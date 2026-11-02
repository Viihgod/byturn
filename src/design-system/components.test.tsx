import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { BtButton, BtCard, BtCollapse, BtSegmented, BtSelector } from './components'

describe('component behavior', () => {
  it('does not submit a form unless explicitly requested', async () => {
    const submit = vi.fn((event) => event.preventDefault())
    const action = vi.fn()
    render(
      <form onSubmit={submit}>
        <BtButton onClick={action}>Preview</BtButton>
        <BtButton type="submit">Save</BtButton>
      </form>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Preview' }))
    expect(action).toHaveBeenCalledOnce()
    expect(submit).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(submit).toHaveBeenCalledOnce()
  })
  it('blocks disabled actions', async () => {
    const action = vi.fn()
    render(
      <BtButton disabled onClick={action}>
        Approve
      </BtButton>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(action).not.toHaveBeenCalled()
  })
  it('labels selectors uniquely and reports the chosen value', async () => {
    const change = vi.fn()
    render(
      <>
        <BtSelector label="Version" onChange={change}>
          <option value="1">V1</option>
          <option value="2">V2</option>
        </BtSelector>
        <BtSelector label="Owner" id="owner">
          <option>Studio</option>
        </BtSelector>
      </>,
    )
    const version = screen.getByRole('combobox', { name: 'Version' })
    expect(version.id).not.toBe(screen.getByRole('combobox', { name: 'Owner' }).id)
    await userEvent.selectOptions(version, '2')
    expect(version).toHaveValue('2')
    expect(change).toHaveBeenCalledOnce()
  })
  it('keeps separate segmented controls independent', async () => {
    function Example() {
      const [value, setValue] = useState('dark')
      const options = [
        { value: 'dark', label: 'Dark' },
        { value: 'light', label: 'Light' },
      ]
      return (
        <>
          <BtSegmented label="Theme" value={value} onChange={setValue} options={options} />
          <BtSegmented label="Preview" value="dark" onChange={() => {}} options={options} />
        </>
      )
    }
    render(<Example />)
    await userEvent.click(screen.getAllByRole('radio', { name: 'Light' })[0])
    expect(screen.getAllByRole('radio', { name: 'Light' })[0]).toBeChecked()
    expect(screen.getAllByRole('radio', { name: 'Dark' })[1]).toBeChecked()
  })
  it('starts collapses closed and permits opening', async () => {
    render(
      <BtCollapse title="Details">
        <p>Usage guidance</p>
      </BtCollapse>,
    )
    const summary = screen.getByText('Details')
    expect(summary.closest('details')).not.toHaveAttribute('open')
    await userEvent.click(summary)
    expect(summary.closest('details')).toHaveAttribute('open')
  })
  it('retains card semantics and user content', () => {
    render(
      <BtCard aria-label="Current version">
        <h2>V2</h2>
      </BtCard>,
    )
    expect(screen.getByRole('region', { name: 'Current version' })).toContainElement(
      screen.getByRole('heading', { name: 'V2' }),
    )
  })
})
