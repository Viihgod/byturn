import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import {
  BtAlert,
  BtAvatar,
  BtAvatarGroup,
  BtBadge,
  BtBrandLockup,
  BtBrandSymbol,
  BtButton,
  BtButtonGroup,
  BtCard,
  BtCollapse,
  BtEmptyState,
  BtIconButton,
  BtProgress,
  BtSkeleton,
  BtSpinner,
  BtStatus,
} from './core'

describe('core primitives', () => {
  it('blocks duplicate pending actions while retaining their accessible label', async () => {
    const action = vi.fn()
    render(
      <BtButton pending onClick={action}>
        Save review
      </BtButton>,
    )
    const button = screen.getByRole('button', { name: 'Save review' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    await userEvent.click(button)
    expect(action).not.toHaveBeenCalled()
  })
  it('gives icon-only actions a name and preserves controlled pressed state', async () => {
    const action = vi.fn()
    render(
      <BtIconButton
        label="Edit review"
        variant="ghost"
        size="xs"
        onClick={action}
        aria-pressed={false}
      >
        <span aria-hidden="true">+</span>
      </BtIconButton>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Edit review' }))
    expect(action).toHaveBeenCalledOnce()
  })
  it('names action groups and brand images without naming decorative symbols', () => {
    render(
      <>
        <BtButtonGroup label="Review actions">
          <BtButton>Save</BtButton>
        </BtButtonGroup>
        <BtBrandLockup size="lg" />
        <BtBrandLockup />
        <BtBrandSymbol />
        <BtBrandSymbol decorative />
      </>,
    )
    expect(screen.getByRole('group', { name: 'Review actions' })).toBeVisible()
    expect(screen.getAllByRole('img', { name: 'Byturn' })).toHaveLength(3)
  })
  it('supports named cards and initially open disclosure content', () => {
    render(
      <BtCard selected padding="sm" aria-label="Version">
        <BtCollapse title="Details" defaultOpen>
          <p>History remains available</p>
        </BtCollapse>
      </BtCard>,
    )
    expect(screen.getByRole('region', { name: 'Version' })).toContainElement(
      screen.getByText('History remains available'),
    )
    expect(screen.getByText('Details').closest('details')).toHaveAttribute('open')
  })
  it('keeps visible context labels and danger feedback available to assistive technology', () => {
    render(
      <>
        <BtBadge>V1</BtBadge>
        <BtBadge tone="client" size="sm">
          Client
        </BtBadge>
        <BtStatus>Draft</BtStatus>
        <BtAlert title="Saved" />
        <BtAlert tone="danger" title="Save failed">
          Retry without losing your draft.
        </BtAlert>
      </>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Saved')
    expect(screen.getByRole('alert')).toHaveTextContent('Retry without losing your draft.')
    expect(screen.getByText('Draft')).toBeVisible()
  })
  it('announces loading and bounds skeleton line count', () => {
    const { rerender } = render(
      <>
        <BtSpinner label="Loading file" />
        <BtSkeleton label="Loading comments" lines={99} />
      </>,
    )
    expect(screen.getByRole('status', { name: 'Loading comments' }).children).toHaveLength(8)
    expect(screen.getByText('Loading file')).toBeInTheDocument()
    rerender(<BtSkeleton label="Loading" lines={0} />)
    expect(screen.getByRole('status', { name: 'Loading' }).children).toHaveLength(1)
  })
  it('supports indeterminate progress and clamps invalid range values', () => {
    const { rerender } = render(<BtProgress label="Upload" />)
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('value')
    rerender(<BtProgress label="Upload" value={150} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '100')
    rerender(<BtProgress label="Upload" value={-3} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0')
    rerender(<BtProgress label="Upload" value={Number.NaN} />)
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('value')
  })
  it('explains empty content with an optional action', () => {
    const { rerender } = render(
      <BtEmptyState title="No files" action={<BtButton>Add a file</BtButton>}>
        Start a review.
      </BtEmptyState>,
    )
    expect(screen.getByRole('button', { name: 'Add a file' })).toBeVisible()
    rerender(<BtEmptyState title="No comments" />)
    expect(screen.getByText('No comments')).toBeVisible()
  })
  it('preserves person identity if an avatar image fails', () => {
    const { container } = render(
      <BtAvatarGroup label="Team">
        <BtAvatar name="Alex Morgan" src="/missing.png" />
        <BtAvatar name="Jordan" size="xs" />
      </BtAvatarGroup>,
    )
    expect(screen.getByRole('img', { name: 'Alex Morgan' })).toHaveTextContent('AM')
    fireEvent.error(container.querySelector('img')!)
    expect(container.querySelector('img')).toHaveAttribute('hidden')
    fireEvent.load(container.querySelector('img')!)
    expect(container.querySelector('img')).not.toHaveAttribute('hidden')
    expect(screen.getByRole('group', { name: 'Team' })).toBeVisible()
  })
})
