import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Images, UploadSimple, X } from '@phosphor-icons/react'
import { BtButton, BtIconButton } from '../design-system/core'
import { BtDialog } from '../design-system/overlays'
import { useTranslation } from '../i18n/locale'
import type { TranslationKey } from '../i18n/locale'
import { api, imagePayload } from './api'
import type { Asset, Project } from './api'
import { SortableImages } from './SortableImages'

type QueueItem = { id: string; file: File }
function validFiles(files: File[]) {
  if (files.length > 20) return 'IMAGE_COUNT'
  if (files.some((file) => !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)))
    return 'INVALID_IMAGE'
  if (files.some((file) => file.size > 5_000_000)) return 'FILE_TOO_LARGE'
  if (files.reduce((total, file) => total + file.size, 0) > 25_000_000) return 'BATCH_TOO_LARGE'
  return ''
}
function FilePreview({ file }: { file: File }) {
  const [source, setSource] = useState('')
  useEffect(() => {
    const reader = new FileReader()
    reader.onload = () => setSource(String(reader.result))
    reader.readAsDataURL(file)
    return () => {
      reader.onload = null
      if (reader.readyState === FileReader.LOADING) reader.abort()
    }
  }, [file])
  return source ? <img src={source} alt="" draggable={false} /> : <span />
}
export function FileDropArea({
  onFiles,
  onChoose,
  disabled,
  children,
}: {
  onFiles: (files: File[]) => void
  onChoose?: () => void
  disabled?: boolean
  children?: ReactNode
}) {
  const { t } = useTranslation()
  const [over, setOver] = useState(false)
  return (
    <section
      className="p-file-drop"
      data-over={over || undefined}
      aria-label={t('product.dropImages')}
      onDragOver={(e) => {
        if (!disabled && Array.from(e.dataTransfer.types).includes('Files')) {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'copy'
          setOver(true)
        }
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false)
      }}
      onDrop={(e) => {
        if (e.dataTransfer.files.length) {
          e.preventDefault()
          e.stopPropagation()
          setOver(false)
          if (!disabled) onFiles(Array.from(e.dataTransfer.files))
        }
      }}
    >
      <Images size={28} aria-hidden="true" />
      <div>
        <strong>{t('product.dropImages')}</strong>
        <p>{t('product.dropHint')}</p>
      </div>
      {onChoose && (
        <BtButton variant="secondary" disabled={disabled} onClick={onChoose}>
          {t('product.chooseImages')}
        </BtButton>
      )}
      {children}
    </section>
  )
}
export function UploadDialog({
  project,
  asset,
  pending,
  act,
  onUploaded,
  replace = false,
  open: controlled,
  onOpenChange,
  initialFiles = [],
}: {
  project: Project
  asset?: Asset
  pending: boolean
  act: (fn: () => Promise<unknown>, message?: string) => Promise<boolean>
  onUploaded?: (id: string) => void
  replace?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  initialFiles?: File[]
}) {
  const { t } = useTranslation()
  const p = (key: string) => t(('product.' + key) as TranslationKey)
  const [internalOpen, setOpen] = useState(false)
  const open = controlled ?? internalOpen
  const [items, setItems] = useState<QueueItem[]>(() =>
    validFiles(initialFiles) ? [] : initialFiles.map((file) => ({ id: crypto.randomUUID(), file })),
  )
  const [error, setError] = useState(() => validFiles(initialFiles))
  const [name, setName] = useState(
    asset?.name ?? initialFiles[0]?.name.replace(/\.[^.]+$/, '') ?? '',
  )
  const [progress, setProgress] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  function changeOpen(next: boolean) {
    if (pending && !next) return
    setOpen(next)
    onOpenChange?.(next)
    if (!next) {
      setItems([])
      setName(asset?.name ?? '')
      setError('')
      setProgress(0)
    }
  }
  function add(files: File[]) {
    const combined = [...items.map((item) => item.file), ...files]
    const invalid = validFiles(combined)
    if (invalid) {
      setError(invalid)
      return
    }
    setError('')
    setItems([...items, ...files.map((file) => ({ id: crypto.randomUUID(), file }))])
    if (!name && files[0]) setName(files[0].name.replace(/\.[^.]+$/, ''))
    if (input.current) input.current.value = ''
  }
  return (
    <BtDialog
      title={p(replace ? 'replaceImage' : asset ? 'newVersion' : 'upload')}
      description={p('uploadHint')}
      closeLabel={p('close')}
      open={open}
      onOpenChange={changeOpen}
      trigger={
        <BtButton variant="secondary" disabled={pending}>
          <UploadSimple />
          {p(replace ? 'replaceImage' : asset ? 'newVersion' : 'upload')}
        </BtButton>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const invalid = validFiles(items.map((item) => item.file))
          if (!items.length || invalid) {
            setError(invalid || 'IMAGE_COUNT')
            return
          }
          void act(async () => {
            const images = []
            for (const [index, item] of items.entries()) {
              images.push(await imagePayload(item.file))
              setProgress(index + 1)
            }
            const uploaded = await api<{ versionId: string }>(`/projects/${project.id}/uploads`, {
              body: { name: asset?.name ?? name, images, ...(asset ? { assetId: asset.id } : {}) },
            })
            setOpen(false)
            onOpenChange?.(false)
            setItems([])
            setName(asset?.name ?? '')
            setProgress(0)
            onUploaded?.(uploaded.versionId)
          }, 'uploaded')
        }}
      >
        {!asset && (
          <label className="p-field">
            <span>{p('assetName')}</span>
            <input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={200}
              disabled={pending}
            />
          </label>
        )}
        <input
          ref={input}
          name="files"
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={(e) => add(Array.from(e.target.files ?? []))}
        />
        <FileDropArea disabled={pending} onFiles={add} onChoose={() => input.current?.click()} />
        {error && (
          <p role="alert" className="p-upload-error">
            {p('error.' + error)}
          </p>
        )}
        {items.length > 0 && (
          <>
            <p className="p-small p-subtle">
              {p('batchHint')} · {items.length}/20 ·{' '}
              {(items.reduce((total, item) => total + item.file.size, 0) / 1_000_000).toFixed(1)} MB
            </p>
            <SortableImages
              items={items}
              onChange={setItems}
              disabled={pending}
              render={(item) => (
                <>
                  <FilePreview file={item.file} />
                  <span className="p-sortable-filename">{item.file.name}</span>
                  <BtIconButton
                    variant="ghost"
                    size="sm"
                    label={p('removeImage') + ' ' + item.file.name}
                    disabled={pending}
                    onClick={() => {
                      setItems(items.filter((current) => current.id !== item.id))
                      setError('')
                    }}
                  >
                    <X />
                  </BtIconButton>
                </>
              )}
            />
          </>
        )}
        <p className="p-subtle p-small">{p(asset ? 'versionHint' : 'carouselUploadHint')}</p>
        <div role="status" className="p-small p-subtle">
          {pending && progress > 0 ? `${p('preparingImages')} ${progress}/${items.length}` : ''}
        </div>
        <BtButton type="submit" pending={pending} disabled={!items.length}>
          {p('upload')}
        </BtButton>
      </form>
    </BtDialog>
  )
}
