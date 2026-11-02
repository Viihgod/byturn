import { useId } from 'react'
import type { ReactNode } from 'react'
import { Tabs } from 'radix-ui'
import type { BtSize } from './scales'
import { BtButton } from './core'

export function BtSegmented({
  label,
  value,
  onChange,
  options,
  size = 'md',
  disabled,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string; disabled?: boolean }[]
  size?: BtSize
  disabled?: boolean
}) {
  const name = useId()
  return (
    <fieldset className="bt-segmented" data-size={size} disabled={disabled}>
      <legend>{label}</legend>
      <div>
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
      </div>
    </fieldset>
  )
}
export function BtTabs({
  label,
  value,
  onValueChange,
  tabs,
}: {
  label: string
  value: string
  onValueChange: (value: string) => void
  tabs: { value: string; label: string; content: ReactNode; disabled?: boolean }[]
}) {
  return (
    <Tabs.Root value={value} onValueChange={onValueChange} className="bt-tabs">
      <Tabs.List className="bt-tab-list" aria-label={label}>
        {tabs.map((tab) => (
          <Tabs.Trigger
            key={tab.value}
            value={tab.value}
            className="bt-tab"
            disabled={tab.disabled}
          >
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {tabs.map((tab) => (
        <Tabs.Content key={tab.value} value={tab.value} className="bt-tab-content">
          {tab.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  )
}
export function BtBreadcrumb({
  label,
  items,
}: {
  label: string
  items: { label: string; href?: string }[]
}) {
  return (
    <nav aria-label={label} className="bt-breadcrumb">
      <ol>
        {items.map((item, index) => (
          <li key={`${index}-${item.label}`}>
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.href && index !== items.length - 1 ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              <span aria-current={index === items.length - 1 ? 'page' : undefined}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
export function BtPagination({
  label,
  page,
  pageCount,
  onPageChange,
  previousLabel,
  nextLabel,
}: {
  label: string
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  previousLabel: string
  nextLabel: string
}) {
  const total = Math.max(1, Math.floor(pageCount))
  const current = Math.max(1, Math.min(Math.floor(page), total))
  return (
    <nav className="bt-pagination" aria-label={label}>
      <BtButton
        variant="secondary"
        disabled={current <= 1}
        onClick={() => onPageChange(current - 1)}
      >
        {previousLabel}
      </BtButton>
      <span aria-live="polite" aria-atomic="true">
        {current} / {total}
      </span>
      <BtButton
        variant="secondary"
        disabled={current >= total}
        onClick={() => onPageChange(current + 1)}
      >
        {nextLabel}
      </BtButton>
    </nav>
  )
}
export function BtTable({
  caption,
  columns,
  rows,
  emptyMessage,
}: {
  caption: string
  columns: { key: string; label: string }[]
  rows: { id: string; cells: Record<string, ReactNode> }[]
  emptyMessage: string
}) {
  return (
    <div className="bt-table-scroll" role="region" aria-label={caption} tabIndex={0}>
      <table className="bt-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th scope="col" key={column.key}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td key={column.key}>{row.cells[column.key]}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length}>{emptyMessage}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
