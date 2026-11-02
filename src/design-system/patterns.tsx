import type { ReactNode } from 'react'
import { MagnifyingGlassMinus, MagnifyingGlassPlus } from '@phosphor-icons/react'
import { BtBadge, BtButton, BtCard, BtIconButton, BtStatus } from './core'
import type { BtTone } from './core'
import { BtSelector } from './forms'
import type { BtSize } from './scales'

export function BtVersionSelector({
  label,
  value,
  versions,
  onChange,
  disabled,
  size = 'md',
}: {
  label: string
  value: string
  versions: { id: string; label: string }[]
  onChange: (value: string) => void
  disabled?: boolean
  size?: BtSize
}) {
  return (
    <BtSelector
      className="bt-version-selector"
      label={label}
      value={value}
      disabled={disabled}
      size={size}
      onChange={(event) => onChange(event.target.value)}
    >
      {versions.map((version) => (
        <option key={version.id} value={version.id}>
          {version.label}
        </option>
      ))}
    </BtSelector>
  )
}
export function BtCommentThread({
  author,
  time,
  version,
  children,
  resolved = false,
  stateLabel,
}: {
  author: string
  time: string
  version: string
  children: ReactNode
  resolved?: boolean
  stateLabel: string
}) {
  return (
    <article className="bt-comment-thread">
      <header>
        <strong>{author}</strong>
        <time>{time}</time>
      </header>
      <div className="bt-inline">
        <BtBadge tone="client">{version}</BtBadge>
        <BtStatus tone={resolved ? 'success' : 'neutral'}>{stateLabel}</BtStatus>
      </div>
      <div className="bt-comment-content">{children}</div>
    </article>
  )
}
export function BtApprovalPanel({
  title,
  description,
  approveLabel,
  changesLabel,
  onApprove,
  onRequestChanges,
  readOnly = false,
  pending = false,
}: {
  title: string
  description: string
  approveLabel: string
  changesLabel: string
  onApprove: () => void
  onRequestChanges: () => void
  readOnly?: boolean
  pending?: boolean
}) {
  return (
    <BtCard selected className="bt-approval-panel">
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="bt-inline">
        <BtButton disabled={readOnly} pending={pending} onClick={onApprove}>
          {approveLabel}
        </BtButton>
        <BtButton variant="secondary" disabled={readOnly || pending} onClick={onRequestChanges}>
          {changesLabel}
        </BtButton>
      </div>
    </BtCard>
  )
}
export function BtAssetCard({
  title,
  client,
  version,
  status,
  tone = 'neutral',
  preview,
  action,
}: {
  title: string
  client: string
  version: string
  status: string
  tone?: BtTone
  preview: ReactNode
  action: ReactNode
}) {
  return (
    <BtCard className="bt-asset-card" padding="md">
      <div className="bt-asset-preview">{preview}</div>
      <div className="bt-asset-heading">
        <h3>{title}</h3>
        <BtBadge tone="info">{version}</BtBadge>
      </div>
      <p>{client}</p>
      <BtStatus tone={tone}>{status}</BtStatus>
      <div className="bt-asset-action">{action}</div>
    </BtCard>
  )
}
export function BtImageViewer({
  src,
  alt,
  zoom,
  onZoomChange,
  fitLabel,
  zoomInLabel,
  zoomOutLabel,
}: {
  src: string
  alt: string
  zoom: number
  onZoomChange: (zoom: number) => void
  fitLabel: string
  zoomInLabel: string
  zoomOutLabel: string
}) {
  const scale = Math.max(1, Math.min(3, zoom))
  return (
    <div className="bt-image-viewer">
      <div className="bt-image-toolbar">
        <BtButton variant="secondary" onClick={() => onZoomChange(1)}>
          {fitLabel}
        </BtButton>
        <span aria-live="polite">{Math.round(scale * 100)}%</span>
        <BtIconButton
          label={zoomOutLabel}
          variant="secondary"
          disabled={scale <= 1}
          onClick={() => onZoomChange(Math.max(1, scale - 0.25))}
        >
          <MagnifyingGlassMinus />
        </BtIconButton>
        <BtIconButton
          label={zoomInLabel}
          variant="secondary"
          disabled={scale >= 3}
          onClick={() => onZoomChange(Math.min(3, scale + 0.25))}
        >
          <MagnifyingGlassPlus />
        </BtIconButton>
      </div>
      <div className="bt-image-viewport" tabIndex={0} role="region" aria-label={alt}>
        <img src={src} alt={alt} style={{ width: `${scale * 100}%`, maxWidth: 'none' }} />
      </div>
    </div>
  )
}
