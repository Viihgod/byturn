import { render, screen, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { BtButton } from './core'
import { BtInput } from './forms'
import { BtDialog, BtDrawer, BtMenu, BtPopover, BtToast, BtTooltip } from './overlays'

it('opens a named dialog, focuses its content, closes on Escape and returns focus', async () => {
  render(
    <BtDialog
      trigger={<BtButton>Open dialog</BtButton>}
      title="Review settings"
      description="Update access"
      closeLabel="Close dialog"
    >
      <BtInput label="Name" />
    </BtDialog>,
  )
  const trigger = screen.getByRole('button', { name: 'Open dialog' })
  await userEvent.click(trigger)
  expect(
    await screen.findByRole('dialog', { name: 'Review settings' }),
  ).toHaveAccessibleDescription('Update access')
  expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement)
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  await waitFor(() => expect(trigger).toHaveFocus())
})
it('makes a drawer dismissible through its explicit close control', async () => {
  render(
    <BtDrawer
      trigger={<BtButton>Open drawer</BtButton>}
      title="Details"
      description="Review details"
      closeLabel="Close drawer"
    >
      <p>Version 2</p>
    </BtDrawer>,
  )
  await userEvent.click(screen.getByRole('button', { name: 'Open drawer' }))
  expect(await screen.findByRole('dialog', { name: 'Details' })).toBeVisible()
  await userEvent.click(screen.getByRole('button', { name: 'Close drawer' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
})
it('opens contextual content and closes it without a page navigation', async () => {
  render(
    <BtPopover trigger={<BtButton>Details</BtButton>} label="Version details" closeLabel="Dismiss">
      <p>Current version</p>
    </BtPopover>,
  )
  await userEvent.click(screen.getByRole('button', { name: 'Details' }))
  expect(await screen.findByRole('dialog', { name: 'Version details' })).toHaveTextContent(
    'Current version',
  )
  await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
})
it('supports menu keyboard selection and skips disabled actions', async () => {
  const edit = vi.fn()
  const blocked = vi.fn()
  render(
    <BtMenu
      trigger={<BtButton>Actions</BtButton>}
      label="Review actions"
      items={[
        { id: 'edit', label: 'Edit', onSelect: edit },
        { id: 'blocked', label: 'Blocked', disabled: true, onSelect: blocked },
        { id: 'delete', label: 'Delete', danger: true, onSelect: vi.fn() },
      ]}
    />,
  )
  const trigger = screen.getByRole('button', { name: 'Actions' })
  trigger.focus()
  await userEvent.keyboard('{ArrowDown}')
  expect(await screen.findByRole('menu', { name: 'Review actions' })).toBeVisible()
  expect(screen.getByRole('menuitem', { name: 'Blocked' })).toHaveAttribute('aria-disabled', 'true')
  await userEvent.keyboard('{Enter}')
  expect(edit).toHaveBeenCalledOnce()
  expect(blocked).not.toHaveBeenCalled()
})
it('shows supplementary tooltip content on keyboard focus', async () => {
  render(
    <BtTooltip content="Version history">
      <BtButton>History</BtButton>
    </BtTooltip>,
  )
  await userEvent.tab()
  expect(await screen.findByRole('tooltip')).toHaveTextContent('Version history')
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument())
})
it('allows a controlled toast to be dismissed', async () => {
  function Example() {
    const [open, setOpen] = useState(true)
    return (
      <BtToast
        open={open}
        onOpenChange={setOpen}
        title="Saved"
        description="Local preview only"
        closeLabel="Dismiss notification"
      />
    )
  }
  render(<Example />)
  expect(await screen.findByText('Local preview only')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }))
  await waitFor(() => expect(screen.queryByText('Local preview only')).not.toBeInTheDocument())
})
