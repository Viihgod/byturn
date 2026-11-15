import { useEffect, useState } from 'react'
import { api, filePath } from './api'
import { useTranslation } from '../i18n/locale'
export function OriginalImage({
  asset,
  version,
  token = '',
  imageId,
  thumbnail = false,
}: {
  asset: string
  version: string
  token?: string
  imageId?: string
  thumbnail?: boolean
}) {
  const { t } = useTranslation()
  const key = version + '/' + (imageId ?? '') + '/' + thumbnail
  const [image, setImage] = useState({ key: '', url: '' })
  useEffect(() => {
    let disposed = false
    let object = ''
    const path = filePath(asset, version, false, imageId)
    api<Blob>(thumbnail ? path.replace(/\/file$/, '/thumbnail') : path, { token, blob: true })
      .then((blob) => {
        if (!disposed) {
          object = URL.createObjectURL(blob)
          setImage({ key, url: object })
        }
      })
      .catch(() => {})
    return () => {
      disposed = true
      if (object) URL.revokeObjectURL(object)
    }
  }, [asset, version, token, imageId, thumbnail, key])
  return image.key === key && image.url ? (
    <img src={image.url} alt="" draggable={false} />
  ) : (
    <span className="p-image-loading">{t('product.loadingImage')}</span>
  )
}
