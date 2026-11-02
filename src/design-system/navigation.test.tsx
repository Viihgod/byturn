import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { BtBreadcrumb, BtPagination, BtSegmented, BtTable, BtTabs } from './navigation'

it('navigates tabs by keyboard and keeps a disabled panel unavailable', async () => {
  function Example() {
    const [value, setValue] = useState('first')
    return (
      <BtTabs
        label="Project"
        value={value}
        onValueChange={setValue}
        tabs={[
          { value: 'first', label: 'Overview', content: 'Overview content' },
          { value: 'blocked', label: 'Disabled', content: 'Hidden', disabled: true },
          { value: 'last', label: 'Activity', content: 'Activity content' },
        ]}
      />
    )
  }
  render(<Example />)
  screen.getByRole('tab', { name: 'Overview' }).focus()
  await userEvent.keyboard('{ArrowRight}')
  expect(screen.getByRole('tab', { name: 'Activity' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tabpanel')).toHaveTextContent('Activity content')
  expect(screen.getByRole('tab', { name: 'Disabled' })).toBeDisabled()
})
it('bounds pagination and exposes page changes', async () => {
  const change = vi.fn()
  const { rerender } = render(
    <BtPagination
      label="Pages"
      page={-1}
      pageCount={3}
      onPageChange={change}
      previousLabel="Previous"
      nextLabel="Next"
    />,
  )
  expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
  await userEvent.click(screen.getByRole('button', { name: 'Next' }))
  expect(change).toHaveBeenLastCalledWith(2)
  rerender(
    <BtPagination
      label="Pages"
      page={3}
      pageCount={3}
      onPageChange={change}
      previousLabel="Previous"
      nextLabel="Next"
    />,
  )
  expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  await userEvent.click(screen.getByRole('button', { name: 'Previous' }))
  expect(change).toHaveBeenLastCalledWith(2)
})
it('marks the current breadcrumb and labels native table headers and empty state', () => {
  const { rerender } = render(
    <>
      <BtBreadcrumb
        label="Path"
        items={[
          { label: 'Home', href: '#home' },
          { label: 'Client' },
          { label: 'Review', href: '#review' },
        ]}
      />
      <BtTable
        caption="Files"
        columns={[{ key: 'name', label: 'Name' }]}
        rows={[{ id: '1', cells: { name: 'Hero' } }]}
        emptyMessage="No files"
      />
    </>,
  )
  expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '#home')
  expect(screen.getByText('Review')).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('columnheader', { name: 'Name' })).toBeVisible()
  expect(screen.getByRole('cell', { name: 'Hero' })).toBeVisible()
  rerender(
    <BtTable
      caption="Files"
      columns={[{ key: 'name', label: 'Name' }]}
      rows={[]}
      emptyMessage="No files"
    />,
  )
  expect(screen.getByRole('cell', { name: 'No files' })).toBeVisible()
})
it('prevents selection of disabled segmented options', async () => {
  const change = vi.fn()
  render(
    <BtSegmented
      label="View"
      value="one"
      onChange={change}
      options={[
        { value: 'one', label: 'One' },
        { value: 'two', label: 'Two', disabled: true },
      ]}
    />,
  )
  await userEvent.click(screen.getByRole('radio', { name: 'Two' }))
  expect(change).not.toHaveBeenCalled()
})
