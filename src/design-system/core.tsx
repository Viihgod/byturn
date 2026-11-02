import type { ComponentPropsWithRef, HTMLAttributes, ReactNode } from 'react'
import { CircleNotch, X } from '@phosphor-icons/react'
import type { BtSize } from './scales'
import lockup from './assets/byturn-lockup.svg'
import symbol from './assets/byturn-symbol.svg'

export type BtTone = 'neutral' | 'info' | 'client' | 'studio' | 'success' | 'warning' | 'danger'
export type BtButtonProps = ComponentPropsWithRef<'button'> & {
  size?: BtSize
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  pending?: boolean
}
export function BtButton({
  size = 'md',
  variant = 'primary',
  pending = false,
  disabled,
  children,
  className = '',
  type = 'button',
  ...props
}: BtButtonProps) {
  return (
    <button
      type={type}
      className={`bt-button ${className}`}
      data-size={size}
      data-variant={variant}
      aria-busy={pending || undefined}
      disabled={disabled || pending}
      {...props}
    >
      {pending && <CircleNotch className="bt-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}
export function BtIconButton({
  label,
  children,
  ...props
}: Omit<BtButtonProps, 'aria-label'> & { label: string }) {
  return (
    <BtButton {...props} aria-label={label} className={`bt-icon-button ${props.className ?? ''}`}>
      {children}
    </BtButton>
  )
}
export function BtButtonGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="bt-button-group" role="group" aria-label={label}>
      {children}
    </div>
  )
}
export function BtBrandLockup({
  size = 'sm',
  className = '',
}: {
  size?: BtSize
  className?: string
}) {
  return (
    <span
      role="img"
      aria-label="Byturn"
      data-size={size}
      className={`bt-brand-lockup ${className}`}
      style={{ maskImage: `url("${lockup}")` }}
    />
  )
}
export function BtBrandSymbol({
  size = 'md',
  decorative = false,
}: {
  size?: BtSize
  decorative?: boolean
}) {
  return (
    <span
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : 'Byturn'}
      aria-hidden={decorative || undefined}
      data-size={size}
      className="bt-brand-symbol"
      style={{ maskImage: `url("${symbol}")` }}
    />
  )
}
export function BtCard({
  selected = false,
  className = '',
  padding = 'xl',
  ...props
}: HTMLAttributes<HTMLElement> & { selected?: boolean; padding?: BtSize }) {
  return (
    <section
      className={`bt-card ${className}`}
      data-selected={selected}
      data-padding={padding}
      {...props}
    />
  )
}
export function BtCollapse({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  return (
    <details className="bt-collapse" open={defaultOpen || undefined}>
      <summary>{title}</summary>
      <div>{children}</div>
    </details>
  )
}
export function BtBadge({
  tone = 'neutral',
  children,
  size = 'md',
}: {
  tone?: BtTone
  children: ReactNode
  size?: BtSize
}) {
  return (
    <span className="bt-badge" data-tone={tone} data-size={size}>
      <span className="bt-tint" aria-hidden="true" />
      <span>{children}</span>
    </span>
  )
}
export function BtStatus({ tone = 'neutral', children }: { tone?: BtTone; children: ReactNode }) {
  return (
    <span className="bt-status" data-tone={tone}>
      <span aria-hidden="true" className="bt-status-dot" />
      {children}
    </span>
  )
}
export function BtAlert({
  tone = 'info',
  title,
  children,
}: {
  tone?: BtTone
  title: string
  children?: ReactNode
}) {
  return (
    <div className="bt-alert" data-tone={tone} role={tone === 'danger' ? 'alert' : 'status'}>
      <strong>{title}</strong>
      {children && <div>{children}</div>}
    </div>
  )
}
export function BtSpinner({ label, size = 'md' }: { label: string; size?: BtSize }) {
  return (
    <span className="bt-spinner" role="status" data-size={size}>
      <CircleNotch className="bt-spin" aria-hidden="true" />
      <span className="bt-sr-only">{label}</span>
    </span>
  )
}
export function BtSkeleton({ label, lines = 3 }: { label: string; lines?: number }) {
  return (
    <div className="bt-skeleton" role="status" aria-label={label}>
      {Array.from({ length: Math.max(1, Math.min(lines, 8)) }, (_, index) => (
        <span key={index} aria-hidden="true" />
      ))}
    </div>
  )
}
export function BtProgress({ label, value }: { label: string; value?: number }) {
  const progress =
    value === undefined || !Number.isFinite(value) ? undefined : Math.max(0, Math.min(100, value))
  return (
    <label className="bt-progress">
      <span>
        {label}
        {progress !== undefined && <span>{progress}%</span>}
      </span>
      <progress max={100} value={progress} aria-label={label} />
    </label>
  )
}
export function BtEmptyState({
  title,
  children,
  action,
}: {
  title: string
  children?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="bt-empty-state">
      <strong>{title}</strong>
      {children && <p>{children}</p>}
      {action}
    </div>
  )
}
export function BtAvatar({
  name,
  src,
  size = 'md',
}: {
  name: string
  src?: string
  size?: BtSize
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
  return (
    <span className="bt-avatar" data-size={size} role="img" aria-label={name}>
      {src ? (
        <img
          src={src}
          alt=""
          onLoad={(event) => {
            event.currentTarget.hidden = false
          }}
          onError={(event) => {
            event.currentTarget.hidden = true
          }}
        />
      ) : null}
      <span aria-hidden="true">{initials}</span>
    </span>
  )
}
export function BtAvatarGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="bt-avatar-group" role="group" aria-label={label}>
      {children}
    </div>
  )
}
export function BtCloseIcon() {
  return <X aria-hidden="true" />
}
