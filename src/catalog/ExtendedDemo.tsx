import { useState } from 'react'
import {
  BtButton,
  BtChecklist,
  BtCombobox,
  BtConfirmDialog,
  BtDateField,
  BtFilterChip,
  BtMultiSelector,
  BtSearchInput,
} from '../design-system/components'
import type { BtSize } from '../design-system/scales'
import { useTranslation } from '../i18n/locale'

export function ExtendedDemo({ name, size }: { name: string; size: BtSize }) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [date, setDate] = useState('2026-11-12')
  const [person, setPerson] = useState('alex')
  const [clients, setClients] = useState(['northline'])
  const [checklist, setChecklist] = useState([true, false, false])
  const [selected, setSelected] = useState(true)
  const [removed, setRemoved] = useState(false)
  switch (name) {
    case 'BtSearchInput':
      return (
        <BtSearchInput
          label={t('sample.searchFiles')}
          clearLabel={t('sample.clearSearch')}
          value={search}
          onValueChange={setSearch}
          placeholder={t('catalog.searchPlaceholder')}
          size={size}
        />
      )
    case 'BtDateField':
      return (
        <BtDateField
          label={t('sample.dueDate')}
          hint={t('sample.dateHint')}
          value={date}
          onValueChange={setDate}
          size={size}
        />
      )
    case 'BtCombobox':
      return (
        <BtCombobox
          label={t('sample.selectPeople')}
          value={person}
          onValueChange={setPerson}
          placeholder={t('sample.personPlaceholder')}
          emptyMessage={t('sample.noPeople')}
          size={size}
          options={[
            { value: 'alex', label: 'Alex Morgan' },
            { value: 'jordan', label: 'Jordan Lee' },
            { value: 'sam', label: 'Sam Park' },
            { value: 'disabled', label: t('sample.readOnly'), disabled: true },
          ]}
        />
      )
    case 'BtMultiSelector':
      return (
        <BtMultiSelector
          label={t('sample.clients')}
          hint={t('sample.multiHint')}
          value={clients}
          onValueChange={setClients}
          size={size}
          options={[
            { value: 'northline', label: 'Northline' },
            { value: 'fieldwork', label: 'Fieldwork' },
            { value: 'unavailable', label: t('sample.readOnly'), disabled: true },
          ]}
        />
      )
    case 'BtChecklist':
      return (
        <BtChecklist
          label={t('sample.checklist')}
          size={size}
          items={[
            { id: 'date', label: t('sample.checkDate'), checked: checklist[0] },
            { id: 'brand', label: t('sample.checkBrand'), checked: checklist[1] },
            { id: 'export', label: t('sample.checkExport'), checked: checklist[2] },
          ]}
          onCheckedChange={(id, checked) =>
            setChecklist((values) =>
              values.map((value, index) =>
                index === ['date', 'brand', 'export'].indexOf(id) ? checked : value,
              ),
            )
          }
        />
      )
    case 'BtFilterChip':
      return removed ? (
        <BtButton size={size} variant="secondary" onClick={() => setRemoved(false)}>
          {t('sample.pending')}
        </BtButton>
      ) : (
        <BtFilterChip
          label={t('sample.pending')}
          selected={selected}
          onSelectedChange={setSelected}
          removeLabel={t('sample.removeFilter')}
          onRemove={() => setRemoved(true)}
          size={size}
        />
      )
    case 'BtConfirmDialog':
      return (
        <div className="bt-stack">
          <BtConfirmDialog
            trigger={
              <BtButton variant="danger" size={size}>
                {t('sample.confirmAction')}
              </BtButton>
            }
            title={t('sample.confirmTitle')}
            description={t('sample.confirmBody')}
            confirmLabel={t('sample.confirmAction')}
            cancelLabel={t('sample.cancel')}
            errorMessage={t('sample.confirmError')}
            onConfirm={() => setRemoved(true)}
          />
          {removed && <span role="status">{t('catalog.previewAction')}</span>}
        </div>
      )
    default:
      return null
  }
}
