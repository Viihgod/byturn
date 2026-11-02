import { useEffect, useId, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import { AlertDialog, Popover } from 'radix-ui'
import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { BtAlert, BtButton, BtIconButton } from './core'
import { BtCheckbox, BtInput } from './forms'
import type { BtSize } from './scales'

export function BtSearchInput({
  label,
  clearLabel,
  value,
  onValueChange,
  placeholder,
  disabled,
  size = 'md',
}: {
  label: string
  clearLabel: string
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  size?: BtSize
}) {
  const input = useRef<HTMLInputElement>(null)
  return (
    <div className="bt-search-input">
      <MagnifyingGlass aria-hidden="true" />
      <BtInput
        ref={input}
        label={label}
        type="search"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        size={size}
        onChange={(event) => onValueChange(event.target.value)}
      />
      {value && (
        <BtIconButton
          variant="ghost"
          label={clearLabel}
          size={size}
          disabled={disabled}
          onClick={() => {
            onValueChange('')
            input.current?.focus()
          }}
        >
          <X />
        </BtIconButton>
      )}
    </div>
  )
}

export function BtDateField({
  label,
  value,
  onValueChange,
  min,
  max,
  hint,
  error,
  disabled,
  required,
  size = 'md',
}: {
  label: string
  value: string
  onValueChange: (value: string) => void
  min?: string
  max?: string
  hint?: string
  error?: string
  disabled?: boolean
  required?: boolean
  size?: BtSize
}) {
  return (
    <div className="bt-date-field">
      <BtInput
        label={label}
        type="date"
        value={value}
        min={min}
        max={max}
        hint={hint}
        error={error}
        disabled={disabled}
        required={required}
        size={size}
        onChange={(event) => onValueChange(event.target.value)}
      />
    </div>
  )
}

export type BtChoice = { value: string; label: string; disabled?: boolean }
export function BtMultiSelector({
  label,
  value,
  options,
  onValueChange,
  hint,
  disabled,
  size = 'md',
  rows = 4,
}: {
  label: string
  value: string[]
  options: BtChoice[]
  onValueChange: (value: string[]) => void
  hint?: string
  disabled?: boolean
  size?: BtSize
  rows?: number
}) {
  const id = useId()
  return (
    <div className="bt-field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        className="bt-selector bt-multi-selector"
        data-size={size}
        multiple
        size={Math.max(2, Math.min(8, rows))}
        value={value}
        disabled={disabled}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(event) =>
          onValueChange([...event.target.selectedOptions].map((option) => option.value))
        }
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && (
        <span className="bt-field-hint" id={`${id}-hint`}>
          {hint}
        </span>
      )}
    </div>
  )
}

export function BtChecklist({
  label,
  items,
  onCheckedChange,
  disabled,
  size = 'md',
}: {
  label: string
  items: { id: string; label: string; checked: boolean; disabled?: boolean }[]
  onCheckedChange: (id: string, checked: boolean) => void
  disabled?: boolean
  size?: BtSize
}) {
  return (
    <fieldset className="bt-checklist" disabled={disabled}>
      <legend>
        {label}{' '}
        <span aria-live="polite">
          {items.filter((item) => item.checked).length} / {items.length}
        </span>
      </legend>
      {items.map((item) => (
        <BtCheckbox
          key={item.id}
          label={item.label}
          checked={item.checked}
          disabled={item.disabled || disabled}
          size={size}
          onChange={(event) => onCheckedChange(item.id, event.target.checked)}
        />
      ))}
    </fieldset>
  )
}

export function BtFilterChip({
  label,
  selected,
  onSelectedChange,
  removeLabel,
  onRemove,
  disabled,
  size = 'md',
}: {
  label: string
  selected: boolean
  onSelectedChange: (selected: boolean) => void
  removeLabel?: string
  onRemove?: () => void
  disabled?: boolean
  size?: BtSize
}) {
  return (
    <span className="bt-filter-chip" data-selected={selected}>
      <BtButton
        variant="ghost"
        size={size}
        disabled={disabled}
        aria-pressed={selected}
        onClick={() => onSelectedChange(!selected)}
      >
        {label}
      </BtButton>
      {onRemove && removeLabel && (
        <BtIconButton
          size={size}
          label={removeLabel}
          variant="ghost"
          disabled={disabled}
          onClick={onRemove}
        >
          <X />
        </BtIconButton>
      )}
    </span>
  )
}

export function BtConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  cancelLabel,
  errorMessage,
  onConfirm,
}: {
  trigger: ReactElement
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  errorMessage: string
  onConfirm: () => void | boolean | Promise<void | boolean>
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)
  async function confirm() {
    setPending(true)
    setFailed(false)
    try {
      if ((await onConfirm()) === false) setFailed(true)
      else setOpen(false)
    } catch {
      setFailed(true)
    } finally {
      setPending(false)
    }
  }
  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!pending) {
          setOpen(next)
          setFailed(false)
        }
      }}
    >
      <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="bt-overlay" />
        <AlertDialog.Content className="bt-dialog bt-confirm-dialog">
          <AlertDialog.Title>{title}</AlertDialog.Title>
          <AlertDialog.Description className="bt-dialog-description">
            {description}
          </AlertDialog.Description>
          {failed && <BtAlert tone="danger" title={errorMessage} />}
          <div className="bt-inline">
            <AlertDialog.Cancel asChild>
              <BtButton variant="secondary" disabled={pending}>
                {cancelLabel}
              </BtButton>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <BtButton
                variant="danger"
                pending={pending}
                onClick={(event) => {
                  event.preventDefault()
                  void confirm()
                }}
              >
                {confirmLabel}
              </BtButton>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

export function BtCombobox({
  label,
  value,
  options,
  onValueChange,
  placeholder,
  emptyMessage,
  disabled,
  size = 'md',
}: {
  label: string
  value: string
  options: BtChoice[]
  onValueChange: (value: string) => void
  placeholder: string
  emptyMessage: string
  disabled?: boolean
  size?: BtSize
}) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const visible = options.filter((option) =>
    option.label.toLowerCase().includes(query.toLowerCase()),
  )
  const enabled = visible.filter((option) => !option.disabled)
  const current = enabled[Math.min(active, enabled.length - 1)]
  const optionId = (option: BtChoice) => `${id}-option-${options.indexOf(option)}`
  const activeId = open && !disabled && current ? optionId(current) : undefined
  useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView?.({ block: 'nearest' })
  }, [activeId])
  function choose(option: BtChoice) {
    onValueChange(option.value)
    setOpen(false)
    input.current?.focus()
  }
  return (
    <Popover.Root open={open && !disabled} onOpenChange={setOpen}>
      <Popover.Anchor asChild>
        <div className="bt-combobox">
          <BtInput
            ref={input}
            label={label}
            value={open ? query : (options.find((option) => option.value === value)?.label ?? '')}
            placeholder={placeholder}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open && !disabled}
            aria-controls={open && !disabled ? `${id}-list` : undefined}
            aria-activedescendant={activeId}
            disabled={disabled}
            size={size}
            onClick={() => {
              if (!open) {
                setQuery('')
                setActive(0)
                setOpen(true)
              }
            }}
            onChange={(event) => {
              setQuery(event.target.value)
              setActive(0)
              setOpen(true)
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault()
                if (!open) {
                  setQuery('')
                  setActive(
                    event.key === 'ArrowDown'
                      ? 0
                      : options.filter((option) => !option.disabled).length - 1,
                  )
                  setOpen(true)
                } else
                  setActive(
                    (index) =>
                      (index + (event.key === 'ArrowDown' ? 1 : -1) + Math.max(1, enabled.length)) %
                      Math.max(1, enabled.length),
                  )
              } else if (event.key === 'Enter' && open) {
                event.preventDefault()
                if (current) choose(current)
              } else if (event.key === 'Escape') {
                event.preventDefault()
                setOpen(false)
              } else if (event.key === 'Tab') setOpen(false)
            }}
          />
        </div>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          id={`${id}-list`}
          role="listbox"
          aria-label={label}
          aria-labelledby={undefined}
          className="bt-combobox-list"
          sideOffset={4}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onInteractOutside={(event) => {
            if (event.target === input.current) event.preventDefault()
          }}
        >
          {visible.length ? (
            visible.map((option) => (
              <div
                id={optionId(option)}
                key={option.value}
                role="option"
                aria-selected={current?.value === option.value}
                aria-disabled={option.disabled || undefined}
                className="bt-combobox-option"
                onMouseDown={(event) => event.preventDefault()}
                onMouseMove={() => {
                  if (!option.disabled) setActive(enabled.indexOf(option))
                }}
                onClick={() => {
                  if (!option.disabled) choose(option)
                }}
              >
                {option.label}
              </div>
            ))
          ) : (
            <span className="bt-field-hint" role="status">
              {emptyMessage}
            </span>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
