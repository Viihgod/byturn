import { useId } from 'react'
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

import type { BtSize } from './scales'
export function BtButton({ size = 'md', variant = 'primary', className = '', type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { size?: BtSize; variant?: 'primary' | 'secondary' }) {
  return <button type={type} className={`bt-button ${className}`} data-size={size} data-variant={variant} {...props} />
}
export function BtSelector({ label, size = 'md', className = '', id, ...props }: Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & { label: string; size?: BtSize }) {
  const generatedId = useId()
  const controlId = id ?? generatedId
  return <label className="bt-field" htmlFor={controlId}><span>{label}</span><select id={controlId} className={`bt-selector ${className}`} data-size={size} {...props} /></label>
}
export function BtCard({ selected = false, className = '', ...props }: HTMLAttributes<HTMLElement> & { selected?: boolean }) {
  return <section className={`bt-card ${className}`} data-selected={selected} {...props} />
}
export function BtCollapse({ title, children }: { title: string; children: ReactNode }) {
  return <details className="bt-collapse"><summary>{title}</summary><div>{children}</div></details>
}
export function BtSegmented({ label, value, onChange, options, size = 'md' }: {
  label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; size?: BtSize
}) {
  const name = useId()
  return <fieldset className="bt-segmented" data-size={size}><legend>{label}</legend><div>{options.map(option =>
    <label key={option.value}><input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} /><span>{option.label}</span></label>
  )}</div></fieldset>
}
