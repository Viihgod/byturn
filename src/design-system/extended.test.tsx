import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { BtButton } from './core'
import {
  BtChecklist,
  BtCombobox,
  BtConfirmDialog,
  BtDateField,
  BtFilterChip,
  BtMultiSelector,
  BtSearchInput,
} from './extended'

it('clears search through a named button and returns input focus', async () => {
  function Example() {
    const [value, setValue] = useState('')
    return (
      <BtSearchInput
        label="Search"
        clearLabel="Clear search"
        value={value}
        onValueChange={setValue}
      />
    )
  }
  render(<Example />)
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
  await userEvent.type(screen.getByRole('searchbox'), 'hero')
  await userEvent.click(screen.getByRole('button', { name: 'Clear search' }))
  expect(screen.getByRole('searchbox')).toHaveValue('')
  expect(screen.getByRole('searchbox')).toHaveFocus()
})
it('retains a calendar date without creating a timezone-dependent Date object', () => {
  const change = vi.fn()
  render(
    <BtDateField
      label="Due date"
      value="2026-11-12"
      onValueChange={change}
      min="2026-11-01"
      max="2026-11-30"
      hint="Calendar date"
      required
    />,
  )
  const field = screen.getByLabelText(/Due date/)
  expect(field).toHaveValue('2026-11-12')
  expect(field).toBeRequired()
  fireEvent.change(field, { target: { value: '2026-11-14' } })
  expect(change).toHaveBeenCalledWith('2026-11-14')
})
it('selects multiple allowed choices and preserves listbox labels/help', async () => {
  function Example() {
    const [value, setValue] = useState(['one'])
    return (
      <BtMultiSelector
        label="Clients"
        hint="Multiple selection"
        value={value}
        onValueChange={setValue}
        options={[
          { value: 'one', label: 'Northline' },
          { value: 'two', label: 'Fieldwork' },
          { value: 'blocked', label: 'Blocked', disabled: true },
        ]}
      />
    )
  }
  render(<Example />)
  const list = screen.getByRole('listbox', { name: 'Clients' })
  expect(list).toHaveAccessibleDescription('Multiple selection')
  await userEvent.selectOptions(list, ['one', 'two'])
  expect(list).toHaveValue(['one', 'two'])
  await userEvent.deselectOptions(list, 'one')
  expect(list).toHaveValue(['two'])
  expect(screen.getByRole('option', { name: 'Blocked' })).toBeDisabled()
})
it('tracks checklist progress and ignores disabled rows', async () => {
  const change = vi.fn()
  function Example() {
    const [checked, setChecked] = useState(false)
    return (
      <BtChecklist
        label="Checks"
        items={[
          { id: 'date', label: 'Readable date', checked },
          { id: 'blocked', label: 'Locked check', checked: false, disabled: true },
        ]}
        onCheckedChange={(id, value) => {
          change(id, value)
          setChecked(value)
        }}
      />
    )
  }
  render(<Example />)
  await userEvent.click(screen.getByRole('checkbox', { name: 'Readable date' }))
  expect(change).toHaveBeenCalledWith('date', true)
  expect(screen.getByRole('group')).toHaveTextContent('1 / 2')
  await userEvent.click(screen.getByRole('checkbox', { name: 'Locked check' }))
  expect(change).toHaveBeenCalledOnce()
})
it('separates filter toggling from removal and respects disabled actions', async () => {
  const select = vi.fn()
  const remove = vi.fn()
  const { rerender } = render(
    <BtFilterChip
      label="In review"
      selected
      onSelectedChange={select}
      removeLabel="Remove filter"
      onRemove={remove}
    />,
  )
  await userEvent.click(screen.getByRole('button', { name: 'In review' }))
  expect(select).toHaveBeenCalledWith(false)
  await userEvent.click(screen.getByRole('button', { name: 'Remove filter' }))
  expect(remove).toHaveBeenCalledOnce()
  expect(select).toHaveBeenCalledOnce()
  rerender(<BtFilterChip label="In review" selected={false} onSelectedChange={select} disabled />)
  expect(screen.getByRole('button')).toBeDisabled()
})

const confirmLabels = {
  title: 'Delete version?',
  description: 'The test specimen only.',
  confirmLabel: 'Confirm delete',
  cancelLabel: 'Cancel deletion',
  errorMessage: 'Action failed',
}
it('keeps failed confirmation open for retry, then closes on success', async () => {
  const confirm = vi
    .fn()
    .mockResolvedValueOnce(false)
    .mockRejectedValueOnce(new Error('Network'))
    .mockResolvedValueOnce(undefined)
  render(
    <BtConfirmDialog
      {...confirmLabels}
      trigger={<BtButton>Open confirmation</BtButton>}
      onConfirm={confirm}
    />,
  )
  await userEvent.click(screen.getByRole('button', { name: 'Open confirmation' }))
  expect(
    await screen.findByRole('alertdialog', { name: 'Delete version?' }),
  ).toHaveAccessibleDescription('The test specimen only.')
  expect(screen.getByRole('button', { name: 'Cancel deletion' })).toHaveFocus()
  await userEvent.click(screen.getByRole('button', { name: 'Confirm delete' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Action failed')
  await userEvent.click(screen.getByRole('button', { name: 'Confirm delete' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Action failed')
  await userEvent.click(screen.getByRole('button', { name: 'Confirm delete' }))
  await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
  expect(confirm).toHaveBeenCalledTimes(3)
})
it('blocks duplicate confirmation/cancellation while the action is pending', async () => {
  let finish!: (value: boolean) => void
  const confirm = vi.fn(
    () =>
      new Promise<boolean>((resolve) => {
        finish = resolve
      }),
  )
  render(
    <BtConfirmDialog
      {...confirmLabels}
      trigger={<BtButton>Open confirmation</BtButton>}
      onConfirm={confirm}
    />,
  )
  await userEvent.click(screen.getByRole('button', { name: 'Open confirmation' }))
  await userEvent.click(screen.getByRole('button', { name: 'Confirm delete' }))
  expect(screen.getByRole('button', { name: 'Confirm delete' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Cancel deletion' })).toBeDisabled()
  await userEvent.keyboard('{Escape}')
  expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  await act(async () => finish(true))
  await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
  expect(confirm).toHaveBeenCalledOnce()
})
it('cancels confirmation without invoking the action', async () => {
  const confirm = vi.fn()
  render(
    <BtConfirmDialog
      {...confirmLabels}
      trigger={<BtButton>Open confirmation</BtButton>}
      onConfirm={confirm}
    />,
  )
  await userEvent.click(screen.getByRole('button', { name: 'Open confirmation' }))
  await userEvent.click(screen.getByRole('button', { name: 'Cancel deletion' }))
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  expect(confirm).not.toHaveBeenCalled()
})

const people = [
  { value: 'alex', label: 'Alex Morgan' },
  { value: 'blocked', label: 'Blocked', disabled: true },
  { value: 'jordan', label: 'Jordan Lee' },
]
function PeopleExample() {
  const [value, setValue] = useState('alex')
  return (
    <>
      <BtCombobox
        label="Reviewer"
        value={value}
        onValueChange={setValue}
        options={people}
        placeholder="Search names"
        emptyMessage="No people"
      />
      <BtButton>Outside</BtButton>
    </>
  )
}
it('selects a searchable choice by keyboard, skips disabled choices and preserves Escape behavior', async () => {
  render(<PeopleExample />)
  const field = screen.getByRole('combobox', { name: 'Reviewer' })
  field.focus()
  await userEvent.keyboard('{ArrowDown}')
  expect(await screen.findByRole('listbox')).toBeVisible()
  expect(field).toHaveFocus()
  await userEvent.keyboard('{ArrowDown}{Enter}')
  expect(field).toHaveValue('Jordan Lee')
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  await userEvent.click(field)
  await userEvent.type(field, 'nothing')
  expect(await screen.findByRole('status')).toHaveTextContent('No people')
  await userEvent.keyboard('{ArrowDown}{ArrowUp}{Escape}')
  expect(field).toHaveValue('Jordan Lee')
})
it('allows pointer choice and does not commit disabled options', async () => {
  render(<PeopleExample />)
  const field = screen.getByRole('combobox', { name: 'Reviewer' })
  await userEvent.click(field)
  fireEvent.mouseMove(screen.getByRole('option', { name: 'Jordan Lee' }))
  await userEvent.click(screen.getByRole('option', { name: 'Blocked' }))
  expect(screen.getByRole('listbox')).toBeVisible()
  await userEvent.click(screen.getByRole('option', { name: 'Jordan Lee' }))
  expect(field).toHaveValue('Jordan Lee')
  field.focus()
  await userEvent.keyboard('{ArrowUp}{ArrowUp}{Tab}')
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
})
it('does not expose a disabled searchable field as an enabled picker', () => {
  render(
    <BtCombobox
      label="Reviewer"
      value=""
      onValueChange={vi.fn()}
      options={[]}
      placeholder="Search"
      emptyMessage="No people"
      disabled
    />,
  )
  expect(screen.getByRole('combobox')).toBeDisabled()
  expect(screen.getByRole('combobox')).toHaveValue('')
})

it('does not submit a form when Enter has no matching option', async () => {
  const submit = vi.fn((event) => event.preventDefault())
  render(
    <form onSubmit={submit}>
      <BtCombobox
        label="Reviewer"
        value=""
        options={[]}
        onValueChange={vi.fn()}
        placeholder="Search"
        emptyMessage="No people"
      />
      <button type="submit">Submit</button>
    </form>,
  )
  await userEvent.type(screen.getByRole('combobox'), 'missing')
  await userEvent.keyboard('{Enter}')
  expect(submit).not.toHaveBeenCalled()
  await userEvent.keyboard('{Escape}')
})
