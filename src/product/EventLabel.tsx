import {
  ArrowBendUpLeft,
  ArrowsClockwise,
  ChatCircleDots,
  CheckCircle,
  MapPin,
  UploadSimple,
  DotsSixVertical,
} from '@phosphor-icons/react'
import { useTranslation } from '../i18n/locale'
import type { TranslationKey } from '../i18n/locale'
import type { ReviewEvent } from './api'
export function EventLabel({ event }: { event: ReviewEvent }) {
  const { t } = useTranslation()
  const comment = event.type === 'comment'
  const key = comment
    ? event.parentId
      ? 'reply'
      : event.anchorX !== null
        ? 'annotation'
        : 'comment'
    : event.type
  const Icon = comment
    ? event.parentId
      ? ArrowBendUpLeft
      : event.anchorX !== null
        ? MapPin
        : ChatCircleDots
    : event.type === 'approved'
      ? CheckCircle
      : event.type === 'changes'
        ? ArrowsClockwise
        : event.type === 'images.reordered'
          ? DotsSixVertical
          : UploadSimple
  return (
    <span className="p-event-label" data-kind={comment ? 'comment' : event.type}>
      <Icon aria-hidden="true" />
      <strong>{t(('product.' + key) as TranslationKey)}</strong>
      <code>{event.reference}</code>
    </span>
  )
}
