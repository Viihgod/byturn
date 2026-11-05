import { useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowLeft, ArrowRight, DotsSixVertical } from '@phosphor-icons/react'
import { BtIconButton } from '../design-system/core'
import { useTranslation } from '../i18n/locale'

export function SortableImages<T extends { id: string }>({
  items,
  onChange,
  render,
  disabled = false,
}: {
  items: T[]
  onChange: (items: T[]) => void
  render: (item: T, index: number) => ReactNode
  disabled?: boolean
}) {
  const { t } = useTranslation()
  const [dragging, setDragging] = useState<string | null>(null)
  function move(id: string, index: number) {
    const from = items.findIndex((item) => item.id === id)
    if (disabled || from < 0 || from === index) return
    const next = [...items]
    const [item] = next.splice(from, 1)
    next.splice(index, 0, item)
    onChange(next)
  }
  return (
    <ol className="p-sortable-images" aria-label={t('product.imageOrder')}>
      {items.map((item, index) => (
        <li
          key={item.id}
          data-sort-id={item.id}
          data-dragging={dragging === item.id || undefined}
          draggable={!disabled}
          onDragStart={(e) => {
            e.dataTransfer.setData('text/plain', 'byturn-image:' + item.id)
            e.dataTransfer.effectAllowed = 'move'
            setDragging(item.id)
          }}
          onDragEnd={() => setDragging(null)}
          onDragOver={(e) => {
            if (!disabled && !Array.from(e.dataTransfer.types).includes('Files')) e.preventDefault()
          }}
          onDrop={(e) => {
            const value = e.dataTransfer.getData('text/plain')
            if (value.startsWith('byturn-image:')) {
              e.preventDefault()
              e.stopPropagation()
              move(value.slice(13), index)
              setDragging(null)
            }
          }}
        >
          <div className="p-sortable-number">
            <DotsSixVertical aria-hidden="true" />
            <span>{index + 1}</span>
          </div>
          {render(item, index)}
          <div className="p-sortable-actions">
            <BtIconButton
              label={t('product.moveEarlier') + ' ' + (index + 1)}
              variant="ghost"
              size="sm"
              disabled={disabled || index === 0}
              onClick={() => move(item.id, index - 1)}
            >
              <ArrowLeft />
            </BtIconButton>
            <BtIconButton
              label={t('product.moveLater') + ' ' + (index + 1)}
              variant="ghost"
              size="sm"
              disabled={disabled || index === items.length - 1}
              onClick={() => move(item.id, index + 1)}
            >
              <ArrowRight />
            </BtIconButton>
          </div>
        </li>
      ))}
    </ol>
  )
}
