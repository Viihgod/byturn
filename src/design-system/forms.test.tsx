import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import {
  BtCheckbox,
  BtField,
  BtFileUpload,
  BtInput,
  BtRadioGroup,
  BtSelector,
  BtSwitch,
  BtTextarea,
} from './forms'

it('associates input labels, help, required and error descriptions', () => {
  const { rerender } = render(<BtInput label="Email" hint="Use your work email" required />)
  expect(screen.getByRole('textbox', { name: /Email/ })).toBeRequired()
  expect(screen.getByRole('textbox')).toHaveAccessibleDescription('Use your work email')
  rerender(
    <>
      <span id="external">Additional information</span>
      <BtInput
        id="email"
        label="Email"
        error="Invalid email"
        aria-describedby="external"
        aria-invalid={false}
      />
    </>,
  )
  expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  expect(screen.getByRole('textbox')).toHaveAccessibleDescription(
    'Additional information Invalid email',
  )
})
it('retains readonly and disabled native input behavior', async () => {
  render(
    <>
      <BtInput label="Readonly" readOnly value="Unchanged" />
      <BtInput label="Disabled" disabled defaultValue="Fixed" />
      <BtInput label="Plain" />
    </>,
  )
  await userEvent.type(screen.getByRole('textbox', { name: 'Readonly' }), 'New')
  expect(screen.getByRole('textbox', { name: 'Readonly' })).toHaveValue('Unchanged')
  expect(screen.getByRole('textbox', { name: 'Disabled' })).toBeDisabled()
})
it('labels multiline fields and switches between help and error states', () => {
  const { rerender } = render(<BtTextarea label="Comment" hint="A useful comment" required />)
  expect(screen.getByRole('textbox')).toHaveAccessibleDescription('A useful comment')
  rerender(
    <>
      <span id="extra">Context</span>
      <BtTextarea id="comment" label="Comment" error="Required comment" aria-describedby="extra" />
    </>,
  )
  expect(screen.getByRole('textbox')).toHaveAccessibleDescription('Context Required comment')
  expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  rerender(<BtTextarea label="Comment" readOnly value="Saved" />)
  expect(screen.getByRole('textbox')).toHaveValue('Saved')
})
it('links selector help/errors without losing provided descriptions', () => {
  const { rerender } = render(
    <BtSelector label="Version" hint="Choose current">
      <option>V2</option>
    </BtSelector>,
  )
  expect(screen.getByRole('combobox')).toHaveAccessibleDescription('Choose current')
  rerender(
    <>
      <span id="extra">Details</span>
      <BtSelector label="Version" id="version" error="Unavailable" aria-describedby="extra">
        <option>V2</option>
      </BtSelector>
    </>,
  )
  expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true')
  expect(screen.getByRole('combobox')).toHaveAccessibleDescription('Details Unavailable')
})
it('makes the checkbox label interactive and its hint accessible', async () => {
  const change = vi.fn()
  const { rerender } = render(
    <BtCheckbox label="Notify me" hint="Only new versions" onChange={change} />,
  )
  await userEvent.click(screen.getByText('Notify me'))
  expect(change).toHaveBeenCalledOnce()
  expect(screen.getByRole('checkbox')).toHaveAccessibleDescription('Only new versions')
  rerender(<BtCheckbox label="Notify me" disabled />)
  expect(screen.getByRole('checkbox')).toBeDisabled()
})
it('keeps native radio and switch choices controlled and ignores disabled choices', async () => {
  function Example() {
    const [value, setValue] = useState('studio')
    const [checked, setChecked] = useState(false)
    return (
      <>
        <BtRadioGroup
          label="Role"
          value={value}
          onChange={setValue}
          options={[
            { value: 'studio', label: 'Studio' },
            { value: 'client', label: 'Client' },
            { value: 'blocked', label: 'Blocked', disabled: true },
          ]}
        />
        <BtSwitch label="Notifications" checked={checked} onCheckedChange={setChecked} />
        <BtSwitch label="Disabled" checked disabled onCheckedChange={setChecked} />
      </>
    )
  }
  render(<Example />)
  await userEvent.click(screen.getByRole('radio', { name: 'Client' }))
  expect(screen.getByRole('radio', { name: 'Client' })).toBeChecked()
  expect(screen.getByRole('radio', { name: 'Blocked' })).toBeDisabled()
  await userEvent.click(screen.getByRole('switch', { name: 'Notifications' }))
  expect(screen.getByRole('switch', { name: 'Notifications' })).toBeChecked()
})
it('validates image type and 5 MB cap, and permits selecting the same file again', async () => {
  const selected = vi.fn()
  render(
    <BtFileUpload
      label="Image"
      hint="Images only"
      typeError="Invalid format"
      sizeError="Too large"
      onFile={selected}
    />,
  )
  const input = screen.getByLabelText('Image') as HTMLInputElement
  const user = userEvent.setup({ applyAccept: false })
  await user.upload(input, new File(['x'], 'script.html', { type: 'text/html' }))
  expect(screen.getByRole('alert')).toHaveTextContent('Invalid format')
  await user.upload(
    input,
    new File([new Uint8Array(5_000_001)], 'large.png', { type: 'image/png' }),
  )
  expect(screen.getByRole('alert')).toHaveTextContent('Too large')
  const file = new File(['image'], 'image.webp', { type: 'image/webp' })
  await user.upload(input, file)
  await user.upload(input, file)
  expect(selected).toHaveBeenCalledTimes(2)
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  fireEvent.change(input, { target: { files: [] } })
  expect(selected).toHaveBeenCalledTimes(2)
})
it('supports field grouping, hint and error without inventing a child label', () => {
  const { rerender } = render(
    <BtField label="Custom field" hint="Description" required>
      <button>Choose</button>
    </BtField>,
  )
  expect(screen.getByText('Description')).toBeVisible()
  rerender(
    <BtField label="Custom field" error="Invalid choice">
      <button>Choose</button>
    </BtField>,
  )
  expect(screen.getByRole('alert')).toHaveTextContent('Invalid choice')
})
