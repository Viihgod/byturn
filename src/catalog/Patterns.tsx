import { useState } from 'react'
import {
  BtAlert,
  BtAssetCard,
  BtBadge,
  BtCard,
  BtImageViewer,
  BtSelector,
} from '../design-system/components'
import { useTranslation } from '../i18n/locale'
import { Demo } from './Demo'
import specimen from './specimen.svg'

export function Patterns() {
  const { t } = useTranslation()
  const [view, setView] = useState('studio')
  const [zoom, setZoom] = useState(1)
  return (
    <div className="guide-page">
      <div className="guide-page-heading">
        <p className="guide-kicker">{t('family.patterns')}</p>
        <h1>{t('patterns.title')}</h1>
        <p className="guide-lead">{t('patterns.intro')}</p>
      </div>
      <div className="guide-section-heading">
        <h2>{t('patterns.accessTitle')}</h2>
        <p>{t('patterns.accessBody')}</p>
      </div>
      <div className="pattern-filter">
        <BtSelector
          label={t('patterns.viewAs')}
          value={view}
          onChange={(event) => setView(event.target.value)}
        >
          <option value="studio">{t('sample.studio')}</option>
          <option value="client">{t('patterns.clientOnly')}</option>
        </BtSelector>
      </div>
      <div className="pattern-assets">
        <Demo name="BtAssetCard" size="md" />
        {view === 'studio' && (
          <BtAssetCard
            title="Launch email"
            client="Fieldwork"
            version="V1"
            status={t('sample.changes')}
            tone="danger"
            preview={
              <div className="secondary-art">
                <span>FIELDWORK</span>
                <strong>
                  Work
                  <br />
                  in progress.
                </strong>
              </div>
            }
            action={<BtBadge tone="studio">{t('sample.studio')}</BtBadge>}
          />
        )}
      </div>
      <div className="guide-section-heading">
        <h2>{t('sample.campaign')}</h2>
      </div>
      <div className="pattern-review">
        <BtImageViewer
          src={specimen}
          alt={t('sample.imageAlt')}
          zoom={zoom}
          onZoomChange={setZoom}
          fitLabel={t('sample.fit')}
          zoomInLabel={t('sample.zoomIn')}
          zoomOutLabel={t('sample.zoomOut')}
        />
        <div className="bt-stack">
          <Demo name="BtVersionSelector" size="md" />
          <Demo name="BtCommentThread" size="md" />
          <Demo name="BtApprovalPanel" size="md" />
        </div>
      </div>
      <div className="guide-section-heading">
        <h2>{t('patterns.optimizeTitle')}</h2>
        <p>{t('patterns.optimizeBody')}</p>
      </div>
      <BtCard>
        <div className="optimization-specimen">
          <div>
            <img src={specimen} alt={t('sample.imageAlt')} />
            <span>{t('patterns.original')}</span>
          </div>
          <div>
            <img src={specimen} alt={t('sample.imageAlt')} />
            <span>{t('patterns.optimized')}</span>
          </div>
        </div>
        <BtAlert tone="info" title={t('patterns.optimizationNote')} />
      </BtCard>
    </div>
  )
}
