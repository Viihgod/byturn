import { BtAlert, BtCollapse, BtTable } from '../design-system/components'
import { useTranslation } from '../i18n/locale'
import audit from './kitsu-audit.json'

export function Reference() {
  const { t } = useTranslation()
  return (
    <div className="guide-page">
      <div className="guide-page-heading">
        <p className="guide-kicker">Kitsu / CGWire</p>
        <h1>{t('reference.title')}</h1>
        <p className="guide-lead">{t('reference.summary')}</p>
      </div>
      <BtAlert title={t('reference.complete')} tone="info" />
      <div className="guide-section-heading">
        <h2>{t('reference.method')}</h2>
        <p>{t('reference.methodBody')}</p>
      </div>
      <BtTable
        caption="Kitsu / source audit"
        columns={[
          { key: 'pattern', label: t('reference.pattern') },
          { key: 'files', label: t('reference.files') },
          { key: 'result', label: t('reference.outcome') },
        ]}
        rows={audit.rows.map((row) => ({
          id: row.pattern,
          cells: {
            pattern: (
              <a
                href={`${audit.repository}/blob/${audit.commit}/${row.source}`}
                target="_blank"
                rel="noreferrer"
              >
                {row.pattern}
              </a>
            ),
            files: row.files,
            result: row.existing ? t('reference.alreadyCovered') : row.result,
          },
        }))}
        emptyMessage=""
      />
      <BtCollapse title={t('reference.deferred')}>
        <p>{t('reference.deferredBody')}</p>
        <p>
          <code>{audit.commit}</code>
        </p>
        <a href={audit.repository} target="_blank" rel="noreferrer">
          github.com/cgwire/kitsu
        </a>
      </BtCollapse>
    </div>
  )
}
