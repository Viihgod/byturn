import { useState } from 'react'
import { CaretLeft, CaretRight, DotsSixVertical } from '@phosphor-icons/react'
import { BtButton, BtIconButton } from '../design-system/core'
import { BtDialog } from '../design-system/overlays'
import { useTranslation } from '../i18n/locale'
import { api } from './api'
import type { Version } from './api'
import { OriginalImage } from './OriginalImage'
import { SortableImages } from './SortableImages'
export function Gallery({
  asset,
  version,
  token,
  index,
  onSelect,
  editable,
  pending,
  act,
}: {
  asset: string
  version: Version
  token: string
  index: number
  onSelect: (index: number) => void
  editable: boolean
  pending: boolean
  act: (fn: () => Promise<unknown>, message?: string) => Promise<boolean>
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [order, setOrder] = useState(version.images)
  const [basis, setBasis] = useState(version.revision)
  return (
    <div className="p-gallery">
      <div className="p-gallery-heading">
        <div className="p-actions">
          <BtIconButton
            label={t('product.previousImage')}
            variant="secondary"
            disabled={index === 0}
            onClick={() => onSelect(index - 1)}
          >
            <CaretLeft />
          </BtIconButton>
          <span aria-live="polite">
            {index + 1} / {version.images.length}{' '}
            {t(version.images.length === 1 ? 'product.image' : 'product.images')}
          </span>
          <BtIconButton
            label={t('product.nextImage')}
            variant="secondary"
            disabled={index === version.images.length - 1}
            onClick={() => onSelect(index + 1)}
          >
            <CaretRight />
          </BtIconButton>
        </div>
        {editable && version.images.length > 1 && (
          <BtDialog
            title={t('product.imageOrder')}
            description={t('product.orderHint')}
            closeLabel={t('product.close')}
            open={open}
            onOpenChange={(next) => {
              if (!pending) {
                setOpen(next)
                if (next) {
                  onSelect(index)
                  setOrder(version.images)
                  setBasis(version.revision)
                }
              }
            }}
            trigger={
              <BtButton variant="ghost">
                <DotsSixVertical />
                {t('product.organizeImages')}
              </BtButton>
            }
          >
            <SortableImages
              items={order}
              onChange={setOrder}
              disabled={pending}
              render={(image) => (
                <>
                  <OriginalImage
                    asset={asset}
                    version={version.id}
                    imageId={image.id}
                    token={token}
                    thumbnail
                  />
                  <span className="p-sortable-filename">{image.filename}</span>
                </>
              )}
            />
            <div className="p-order-save">
              <BtButton
                pending={pending}
                disabled={order.every((image, i) => image.id === version.images[i].id)}
                onClick={() => {
                  void act(async () => {
                    await api(`/assets/${asset}/versions/${version.id}/images/order`, {
                      method: 'PUT',
                      body: {
                        imageIds: order.map((image) => image.id),
                        revision: basis,
                      },
                    })
                    setOpen(false)
                  }, 'orderSaved')
                }}
              >
                {t('product.saveOrder')}
              </BtButton>
            </div>
          </BtDialog>
        )}
      </div>
      {version.images.length > 1 && (
        <div className="p-gallery-strip" role="group" aria-label={t('product.carouselImages')}>
          {version.images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              aria-label={t('product.showImage') + ' ' + (i + 1) + ': ' + image.filename}
              aria-current={index === i ? 'true' : undefined}
              onClick={() => onSelect(i)}
            >
              <OriginalImage
                asset={asset}
                version={version.id}
                imageId={image.id}
                token={token}
                thumbnail
              />
              <span>{i + 1}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
