import { useEffect, useRef, useState } from 'react'
import { Popover } from 'radix-ui'
import { ChatCircleDots, MapPin, PencilSimple, X } from '@phosphor-icons/react'
import { BtButton, BtIconButton } from '../design-system/core'
import { useTranslation } from '../i18n/locale'
import type { TranslationKey } from '../i18n/locale'
import { api, filePath } from './api'
import type { ReviewEvent } from './api'
import { fittedImage, pointInImage } from './coordinates'
import type { Point } from './coordinates'
import { EventLabel } from './EventLabel'

export type CommentInput = { body: string; anchor?: Point; replyTo?: string }
export type CommentActions = {
  save: (input: CommentInput) => Promise<boolean>
  pending: boolean
  writable: boolean
  guest: boolean
  name: string
  setName: (name: string) => void
}
function useCopy() {
  const { t, locale } = useTranslation()
  return { p: (key: string) => t(('product.' + key) as TranslationKey), locale }
}
export function MessageForm({
  save,
  pending,
  guest,
  name,
  setName,
  replyTo,
  anchor,
  onSaved,
  onCancel,
}: CommentActions & {
  replyTo?: string
  anchor?: Point
  onSaved?: () => void
  onCancel?: () => void
}) {
  const { p } = useCopy()
  const [body, setBody] = useState('')
  const [failed, setFailed] = useState(false)
  return (
    <form
      className="p-message-form"
      onSubmit={(e) => {
        e.preventDefault()
        void save({ body, ...(replyTo ? { replyTo } : {}), ...(anchor ? { anchor } : {}) }).then(
          (ok) => {
            setFailed(!ok)
            if (ok) {
              setBody('')
              onSaved?.()
            }
          },
        )
      }}
    >
      {guest && (
        <label className="p-field">
          <span>{p('yourName')}</span>
          <input
            value={name}
            required
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </label>
      )}
      <label className="p-field">
        <span>{p(replyTo ? 'reply' : 'comment')}</span>
        <textarea
          value={body}
          required
          maxLength={4000}
          rows={3}
          onChange={(e) => setBody(e.target.value)}
          placeholder={p('feedbackPlaceholder')}
        />
      </label>
      {failed && (
        <p role="alert" className="p-error">
          {p('commentFailed')}
        </p>
      )}
      <div className="p-actions">
        {onCancel && (
          <BtButton variant="ghost" onClick={onCancel}>
            {p('cancel')}
          </BtButton>
        )}
        <BtButton type="submit" pending={pending}>
          {p(replyTo ? 'sendReply' : 'saveComment')}
        </BtButton>
      </div>
    </form>
  )
}
export function CommentThread({
  root,
  replies,
  actions,
  number,
  onLocate,
  onEngage,
}: {
  root: ReviewEvent
  replies: ReviewEvent[]
  actions: CommentActions
  number?: number
  onLocate?: () => void
  onEngage?: () => void
}) {
  const { p, locale } = useCopy()
  const [replying, setReplying] = useState(false)
  function message(event: ReviewEvent) {
    return (
      <div className="p-thread-message" key={event.id} data-party={event.party}>
        <EventLabel event={event} />
        <div className="p-timeline-head">
          <span className="p-avatar">{event.actor[0]}</span>
          <div>
            <strong>{event.actor}</strong>
            <small>
              {event.party !== 'unknown' && (
                <>{p(event.party === 'team' ? 'teamMember' : 'client')} · </>
              )}
              {p(event.identity === 'declared' ? 'declared' : 'account')} ·{' '}
              {new Date(event.created).toLocaleString(locale, {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </small>
          </div>
        </div>
        <p>{event.body}</p>
      </div>
    )
  }
  return (
    <div className="p-comment-thread" data-thread={root.id}>
      {number !== undefined && (
        <div className="p-thread-location">
          {onLocate ? (
            <button type="button" onClick={onLocate}>
              <MapPin />
              {p('annotation')} {number}
            </button>
          ) : (
            <span>
              {p('annotation')} {number}
            </span>
          )}
        </div>
      )}
      {message(root)}
      {replies.map(message)}
      {actions.writable && !replying && (
        <BtButton
          size="sm"
          variant="ghost"
          onClick={() => {
            setReplying(true)
            onEngage?.()
          }}
        >
          {p('reply')}
        </BtButton>
      )}
      {actions.writable && replying && (
        <MessageForm
          {...actions}
          replyTo={root.id}
          onSaved={() => setReplying(false)}
          onCancel={() => setReplying(false)}
        />
      )}
    </div>
  )
}

export function Artwork({
  asset,
  version,
  imageId,
  party,
  token,
  events,
  actions,
  pinMode,
  setPinMode,
  activePin,
  setActivePin,
}: {
  asset: string
  version: string
  imageId: string
  party: 'team' | 'client'
  token: string
  events: ReviewEvent[]
  actions: CommentActions
  pinMode: boolean
  setPinMode: (mode: boolean) => void
  activePin: string | null
  setActivePin: (id: string | null) => void
}) {
  const { p } = useCopy()
  const stage = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [natural, setNatural] = useState({ width: 0, height: 0 })
  const [url, setUrl] = useState('')
  const [failed, setFailed] = useState(false)
  const [draft, setDraft] = useState<Point | null>(null)
  const locked = useRef<string | null>(null)
  const popover = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => {
    const host = stage.current
    if (!host) return
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect
      setSize({ width: rect.width, height: rect.height })
    })
    observer.observe(host)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    let disposed = false
    let object = ''
    api<Blob>(filePath(asset, version, false, imageId), { blob: true, token })
      .then((blob) => {
        if (!disposed) {
          object = URL.createObjectURL(blob)
          setUrl(object)
        }
      })
      .catch(() => {
        if (!disposed) setFailed(true)
      })
    return () => {
      disposed = true
      if (object) URL.revokeObjectURL(object)
      clearTimeout(timer.current)
    }
  }, [asset, version, token, imageId])
  const fitted = fittedImage(size.width, size.height, natural.width, natural.height)
  const roots = events
    .filter((e) => e.type === 'comment' && !e.parentId && e.anchorX !== null && e.anchorY !== null)
    .map((event, index) => ({ ...event, markerNumber: index + 1 }))
    .filter((event) => event.imageId === imageId)
  function leave(id: string) {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      if (locked.current !== id) setActivePin(null)
    }, 180)
  }
  function enter(id: string) {
    clearTimeout(timer.current)
    if (!draft && !locked.current) setActivePin(id)
  }
  return (
    <div className="p-artwork-stage" ref={stage}>
      {!url && (
        <span role={failed ? 'alert' : 'status'} className="p-subtle">
          {p(failed ? 'imageUnavailable' : 'loadingImage')}
        </span>
      )}
      {url && (
        <div
          className="p-image-plane"
          style={{ width: fitted.width || undefined, height: fitted.height || undefined }}
        >
          <img
            src={url}
            alt={p('preview')}
            draggable={false}
            onLoad={(e) =>
              setNatural({
                width: e.currentTarget.naturalWidth,
                height: e.currentTarget.naturalHeight,
              })
            }
          />
          {actions.writable && pinMode && !draft && (
            <button
              className="p-pin-placement"
              aria-label={p('placePin')}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                setDraft(
                  e.detail === 0 ? { x: 0.5, y: 0.5 } : pointInImage(e.clientX, e.clientY, rect),
                )
                setActivePin(null)
              }}
            />
          )}
          {roots.map((root) => (
            <Popover.Root
              key={root.id}
              open={activePin === root.id}
              onOpenChange={(open) => {
                if (!open) {
                  locked.current = null
                  setActivePin(null)
                }
              }}
            >
              <Popover.Trigger asChild>
                <button
                  className="p-art-pin"
                  data-party={root.party}
                  style={{ left: `${root.anchorX! * 100}%`, top: `${root.anchorY! * 100}%` }}
                  aria-label={`${p(root.party === 'team' ? 'teamMember' : root.party === 'client' ? 'client' : 'account')} · ${p('annotation')} ${root.markerNumber}: ${root.actor}`}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== 'touch') enter(root.id)
                  }}
                  onPointerLeave={() => leave(root.id)}
                  onClick={(e) => {
                    e.preventDefault()
                    locked.current = root.id
                    setActivePin(root.id)
                    requestAnimationFrame(() => popover.current?.focus())
                  }}
                >
                  <span>
                    {root.party === 'team' ? <PencilSimple /> : <ChatCircleDots />}
                    <small>{root.markerNumber}</small>
                  </span>
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  ref={popover}
                  className="p-annotation-popover"
                  side="bottom"
                  align="start"
                  sideOffset={8}
                  collisionPadding={16}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  onPointerEnter={() => clearTimeout(timer.current)}
                  onPointerLeave={() => leave(root.id)}
                  aria-label={`${p('annotation')} ${root.markerNumber}`}
                >
                  <div className="p-pin-popover-heading">
                    <strong>
                      {p('annotation')} {root.markerNumber}
                    </strong>
                    <Popover.Close asChild>
                      <BtIconButton label={p('close')} variant="ghost">
                        <X />
                      </BtIconButton>
                    </Popover.Close>
                  </div>
                  <CommentThread
                    root={root}
                    replies={events.filter((e) => e.parentId === root.id)}
                    actions={actions}
                    onEngage={() => {
                      locked.current = root.id
                    }}
                  />
                  <Popover.Arrow className="p-pin-arrow" />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          ))}
          {actions.writable && draft && (
            <Popover.Root
              open
              onOpenChange={(open) => {
                if (!open) setDraft(null)
              }}
            >
              <Popover.Trigger asChild>
                <button
                  className="p-art-pin p-draft-pin"
                  data-party={party}
                  style={{ left: `${draft.x * 100}%`, top: `${draft.y * 100}%` }}
                  aria-label={p('newAnnotation')}
                >
                  <span>
                    <MapPin />
                  </span>
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  className="p-annotation-popover"
                  side="bottom"
                  align="start"
                  sideOffset={8}
                  collisionPadding={16}
                  aria-label={p('newAnnotation')}
                >
                  <div className="p-pin-popover-heading">
                    <strong>{p('newAnnotation')}</strong>
                  </div>
                  <MessageForm
                    {...actions}
                    anchor={draft}
                    onSaved={() => {
                      setDraft(null)
                      setPinMode(false)
                    }}
                    onCancel={() => setDraft(null)}
                  />
                  <Popover.Arrow className="p-pin-arrow" />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          )}
        </div>
      )}
    </div>
  )
}
