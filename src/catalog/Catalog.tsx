import { useState } from 'react'
import { BtCollapse, BtEmptyState, BtInput, BtSelector } from '../design-system/components'
import type { BtSize } from '../design-system/scales'
import { useTranslation } from '../i18n/locale'
import type { TranslationKey } from '../i18n/locale'
import registry from './registry.json'
import { Demo } from './Demo'

export function Catalog({ size }: { size: BtSize }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [family, setFamily] = useState('all')
  const families = [
    'all',
    'brand',
    'actions',
    'forms',
    'navigation',
    'surfaces',
    'feedback',
    'patterns',
  ]
  const matches = registry.filter(
    (item) =>
      (family === 'all' || item.family === family) &&
      `${item.name} ${t(item.descriptionKey as TranslationKey)}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  )
  return (
    <div className="guide-page">
      <div className="guide-page-heading">
        <p className="guide-kicker">{registry.length} / React</p>
        <h1>{t('catalog.title')}</h1>
        <p className="guide-lead">{t('catalog.introV1')}</p>
      </div>
      <div className="catalog-filters">
        <BtInput
          label={t('catalog.search')}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('catalog.searchPlaceholder')}
        />
        <BtSelector
          label={t('catalog.family')}
          value={family}
          onChange={(event) => setFamily(event.target.value)}
        >
          {families.map((value) => (
            <option key={value} value={value}>
              {t(`family.${value}` as TranslationKey)}
            </option>
          ))}
        </BtSelector>
      </div>
      <div className="catalog-grid">
        {matches.map((item) => (
          <article className="catalog-item" id={item.name} key={item.name}>
            <header>
              <h2>{item.name}</h2>
              <span>{t(`family.${item.family}` as TranslationKey)}</span>
            </header>
            <p className="catalog-description">{t(item.descriptionKey as TranslationKey)}</p>
            <div className="catalog-preview">
              <Demo name={item.name} size={size} />
            </div>
            <BtCollapse title={t('catalog.api')}>
              <code className="catalog-code">{item.api}</code>
              <p>
                <code>{item.css}</code>
              </p>
              <p>{t(item.descriptionKey as TranslationKey)}</p>
            </BtCollapse>
          </article>
        ))}
      </div>
      {!matches.length && (
        <BtEmptyState title={t('catalog.noResults')}>{t('catalog.noResultsBody')}</BtEmptyState>
      )}
    </div>
  )
}
