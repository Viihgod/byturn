import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import {
  BtApprovalPanel,
  BtAssetCard,
  BtCommentThread,
  BtImageViewer,
  BtVersionSelector,
} from './patterns'

it('reports the selected version and respects readonly selection', async () => {
  const change = vi.fn()
  const { rerender } = render(
    <BtVersionSelector
      label="Version"
      value="1"
      versions={[
        { id: '1', label: 'V1' },
        { id: '2', label: 'V2' },
      ]}
      onChange={change}
    />,
  )
  await userEvent.selectOptions(screen.getByRole('combobox'), '2')
  expect(change).toHaveBeenLastCalledWith('2')
  rerender(
    <BtVersionSelector
      label="Version"
      value="1"
      versions={[{ id: '1', label: 'V1' }]}
      onChange={change}
      disabled
    />,
  )
  expect(screen.getByRole('combobox')).toBeDisabled()
})
it('keeps a comment tied to its author, version, time and resolution state', () => {
  const { rerender } = render(
    <BtCommentThread author="Alex" time="10:42" version="V1" stateLabel="Open">
      Make the date clearer.
    </BtCommentThread>,
  )
  expect(screen.getByRole('article')).toHaveTextContent('Alex10:42V1OpenMake the date clearer.')
  rerender(
    <BtCommentThread author="Alex" time="10:42" version="V1" stateLabel="Resolved" resolved>
      Make the date clearer.
    </BtCommentThread>,
  )
  expect(screen.getByRole('article')).toHaveTextContent('Resolved')
})
it('separates approval and changes callbacks and blocks readonly/pending decisions', async () => {
  const approve = vi.fn()
  const changes = vi.fn()
  const props = {
    title: 'Approve V2?',
    description: 'Version 2 only',
    approveLabel: 'Approve',
    changesLabel: 'Request changes',
    onApprove: approve,
    onRequestChanges: changes,
  }
  const { rerender } = render(<BtApprovalPanel {...props} />)
  await userEvent.click(screen.getByRole('button', { name: 'Approve' }))
  await userEvent.click(screen.getByRole('button', { name: 'Request changes' }))
  expect(approve).toHaveBeenCalledOnce()
  expect(changes).toHaveBeenCalledOnce()
  rerender(<BtApprovalPanel {...props} readOnly />)
  for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled()
  rerender(<BtApprovalPanel {...props} pending />)
  for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled()
})
it('preserves asset context and the provided preview/action', () => {
  render(
    <BtAssetCard
      title="Hero"
      client="Northline"
      version="V2"
      status="In review"
      preview={<span>Preview</span>}
      action={<button>Open review</button>}
    />,
  )
  expect(screen.getByRole('heading', { name: 'Hero' })).toBeVisible()
  expect(screen.getByText('Northline')).toBeVisible()
  expect(screen.getByRole('button', { name: 'Open review' })).toBeVisible()
})
it('bounds image zoom controls and offers fit reset', async () => {
  const change = vi.fn()
  const props = {
    src: '/image.png',
    alt: 'Campaign',
    zoom: 1,
    onZoomChange: change,
    fitLabel: 'Fit',
    zoomInLabel: 'Zoom in',
    zoomOutLabel: 'Zoom out',
  }
  const { rerender } = render(<BtImageViewer {...props} />)
  expect(screen.getByRole('button', { name: 'Zoom out' })).toBeDisabled()
  await userEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
  expect(change).toHaveBeenLastCalledWith(1.25)
  rerender(<BtImageViewer {...props} zoom={3} />)
  expect(screen.getByRole('button', { name: 'Zoom in' })).toBeDisabled()
  await userEvent.click(screen.getByRole('button', { name: 'Zoom out' }))
  expect(change).toHaveBeenLastCalledWith(2.75)
  await userEvent.click(screen.getByRole('button', { name: 'Fit' }))
  expect(change).toHaveBeenLastCalledWith(1)
})
