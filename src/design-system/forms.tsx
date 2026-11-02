import { useId, useState } from 'react'
import type {
  ComponentPropsWithRef,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { Switch } from 'radix-ui'
import { CaretDown } from '@phosphor-icons/react'
import type { BtSize } from './scales'

type FieldProps = { label: string; hint?: string; error?: string; required?: boolean }
export function BtField({
  label,
  hint,
  error,
  required,
  children,
}: FieldProps & { children: ReactNode }) {
  return (
    <div className="bt-field">
      <span>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </span>
      {children}
      {error ? (
        <span className="bt-field-error" role="alert">
          {error}
        </span>
      ) : (
        hint && <span className="bt-field-hint">{hint}</span>
      )}
    </div>
  )
}
export function BtInput({
  label,
  hint,
  error,
  size = 'md',
  className = '',
  id,
  required,
  ...props
}: Omit<ComponentPropsWithRef<'input'>, 'size'> & FieldProps & { size?: BtSize }) {
  const generated = useId()
  const controlId = id ?? generated
  const description = `${controlId}-description`
  return (
    <div className="bt-field">
      <label htmlFor={controlId}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={controlId}
        required={required}
        className={`bt-input ${className}`}
        data-size={size}
        {...props}
        aria-invalid={error ? true : props['aria-invalid']}
        aria-describedby={
          [props['aria-describedby'], hint || error ? description : ''].filter(Boolean).join(' ') ||
          undefined
        }
      />
      {(hint || error) && (
        <span
          id={description}
          className={error ? 'bt-field-error' : 'bt-field-hint'}
          role={error ? 'alert' : undefined}
        >
          {error || hint}
        </span>
      )}
    </div>
  )
}
export function BtTextarea({
  label,
  hint,
  error,
  size = 'md',
  className = '',
  id,
  required,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps & { size?: BtSize }) {
  const generated = useId()
  const controlId = id ?? generated
  const description = `${controlId}-description`
  return (
    <div className="bt-field">
      <label htmlFor={controlId}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <textarea
        id={controlId}
        rows={3}
        required={required}
        className={`bt-textarea ${className}`}
        data-size={size}
        {...props}
        aria-invalid={error ? true : props['aria-invalid']}
        aria-describedby={
          [props['aria-describedby'], hint || error ? description : ''].filter(Boolean).join(' ') ||
          undefined
        }
      />
      {(hint || error) && (
        <span
          id={description}
          className={error ? 'bt-field-error' : 'bt-field-hint'}
          role={error ? 'alert' : undefined}
        >
          {error || hint}
        </span>
      )}
    </div>
  )
}
export function BtSelector({
  label,
  hint,
  error,
  size = 'md',
  className = '',
  id,
  ...props
}: Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & FieldProps & { size?: BtSize }) {
  const generated = useId()
  const controlId = id ?? generated
  const description = `${controlId}-description`
  return (
    <div className="bt-field">
      <label htmlFor={controlId}>{label}</label>
      <div className="bt-selector-control">
        <select
          id={controlId}
          className={`bt-selector ${className}`}
          data-size={size}
          {...props}
          aria-invalid={error ? true : props['aria-invalid']}
          aria-describedby={
            [props['aria-describedby'], hint || error ? description : '']
              .filter(Boolean)
              .join(' ') || undefined
          }
        />
        <CaretDown className="bt-selector-caret" aria-hidden="true" />
      </div>
      {(hint || error) && (
        <span
          id={description}
          className={error ? 'bt-field-error' : 'bt-field-hint'}
          role={error ? 'alert' : undefined}
        >
          {error || hint}
        </span>
      )}
    </div>
  )
}
export function BtCheckbox({
  label,
  hint,
  size = 'md',
  className = '',
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  label: string
  hint?: string
  size?: BtSize
}) {
  const description = useId()
  return (
    <label className={`bt-checkbox ${className}`} data-size={size}>
      <input
        {...props}
        type="checkbox"
        aria-describedby={
          [props['aria-describedby'], hint ? description : ''].filter(Boolean).join(' ') ||
          undefined
        }
      />
      <span>
        <span>{label}</span>
        {hint && (
          <span id={description} className="bt-field-hint">
            {hint}
          </span>
        )}
      </span>
    </label>
  )
}
export function BtRadioGroup({
  label,
  value,
  onChange,
  options,
  disabled,
  size = 'md',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string; disabled?: boolean }[]
  disabled?: boolean
  size?: BtSize
}) {
  const name = useId()
  return (
    <fieldset className="bt-radio-group" disabled={disabled} data-size={size}>
      <legend>{label}</legend>
      {options.map((option) => (
        <label key={option.value}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            disabled={option.disabled}
            onChange={() => onChange(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  )
}
export function BtSwitch({
  label,
  checked,
  onCheckedChange,
  disabled,
  size = 'md',
}: {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  size?: BtSize
}) {
  const id = useId()
  return (
    <div className="bt-switch-field" data-size={size}>
      <Switch.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="bt-switch"
        data-size={size}
      >
        <Switch.Thumb className="bt-switch-thumb" />
      </Switch.Root>
      <label htmlFor={id}>{label}</label>
    </div>
  )
}
export function BtFileUpload({
  label,
  hint,
  typeError,
  sizeError,
  onFile,
  disabled,
  maxBytes = 5_000_000,
  size = 'md',
}: {
  label: string
  hint: string
  typeError: string
  sizeError: string
  onFile: (file: File) => void
  disabled?: boolean
  maxBytes?: number
  size?: BtSize
}) {
  const id = useId()
  const [error, setError] = useState('')
  return (
    <div className="bt-file-upload" data-size={size}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="file"
        disabled={disabled}
        accept="image/jpeg,image/png,image/webp"
        aria-invalid={Boolean(error)}
        aria-describedby={`${id}-hint`}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (!file) return
          const message = !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
            ? typeError
            : file.size > maxBytes
              ? sizeError
              : ''
          setError(message)
          if (!message) onFile(file)
          event.target.value = ''
        }}
      />
      <span
        id={`${id}-hint`}
        className={error ? 'bt-field-error' : 'bt-field-hint'}
        role={error ? 'alert' : undefined}
      >
        {error || hint}
      </span>
    </div>
  )
}
