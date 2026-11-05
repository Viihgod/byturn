import { useState } from 'react'
import { ImageSquare, Check } from '@phosphor-icons/react'
import { BtButton, BtIconButton } from '../design-system/core'
import { BtDialog } from '../design-system/overlays'
import { useTranslation } from '../i18n/locale'
import { api } from './api'
import type { Project } from './api'
import { OriginalImage } from './OriginalImage'

export function ProjectCover({
  project,
  pending,
  act,
}: {
  project: Project
  pending: boolean
  act: (fn: () => Promise<unknown>, message?: string) => Promise<boolean>
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(project.cover?.imageId ?? '')
  const images = project.assets.flatMap((asset) =>
    asset.versions.flatMap((version) =>
      version.images.map((image) => ({
        ...image,
        assetId: asset.id,
        versionId: version.id,
        label: `${asset.name} · V${version.number} · ${image.filename}`,
      })),
    ),
  )
  return (
    <BtDialog
      title={t('product.chooseCover')}
      description={t('product.coverHint')}
      closeLabel={t('product.close')}
      open={open}
      onOpenChange={(next) => {
        if (!pending) {
          setOpen(next)
          if (next) setSelected(project.cover?.imageId ?? '')
        }
      }}
      trigger={
        <BtIconButton
          className="p-project-cover-button"
          label={t('product.chooseCover') + ': ' + project.name}
          variant="secondary"
        >
          <ImageSquare />
        </BtIconButton>
      }
    >
      <div className="p-cover-options" role="group" aria-label={t('product.chooseCover')}>
        {images.map((image) => (
          <button
            type="button"
            key={image.id}
            aria-pressed={selected === image.id}
            aria-label={image.label}
            disabled={pending}
            onClick={() => setSelected(image.id)}
          >
            <OriginalImage
              asset={image.assetId}
              version={image.versionId}
              imageId={image.id}
              thumbnail
            />
            <span>{image.label}</span>
            {selected === image.id && <Check className="p-cover-check" aria-hidden="true" />}
          </button>
        ))}
      </div>
      <div className="p-cover-actions">
        <BtButton
          variant="ghost"
          pending={pending}
          onClick={() => {
            void act(async () => {
              await api(`/projects/${project.id}/cover`, { method: 'PUT', body: { imageId: null } })
              setOpen(false)
            }, 'coverSaved')
          }}
        >
          {t('product.automaticCover')}
        </BtButton>
        <BtButton
          pending={pending}
          disabled={!selected}
          onClick={() => {
            void act(async () => {
              await api(`/projects/${project.id}/cover`, {
                method: 'PUT',
                body: { imageId: selected },
              })
              setOpen(false)
            }, 'coverSaved')
          }}
        >
          {t('product.saveCover')}
        </BtButton>
      </div>
    </BtDialog>
  )
}
