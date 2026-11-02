import {
  ArrowsClockwise,
  ChatCircle,
  CheckCircle,
  ClockCounterClockwise,
  UploadSimple,
} from '@phosphor-icons/react'
import { BtBrandLockup, BtBrandSymbol, BtCollapse } from '../design-system/components'
import { useTranslation } from '../i18n/locale'

export function Identity() {
  const { t } = useTranslation()
  return (
    <div className="guide-page">
      <div className="guide-page-heading">
        <p className="guide-kicker">{t('guide.approved')}</p>
        <h1>{t('guide.identityTitle')}</h1>
        <p className="guide-lead">{t('guide.identityIntro')}</p>
      </div>
      <div className="identity-master">
        <BtBrandLockup size="xl" />
        <span className="identity-master-note">Byturn / Master 01</span>
      </div>
      <div className="guide-section-heading">
        <h2>{t('guide.variants')}</h2>
      </div>
      <div className="brand-variants">
        <div className="brand-variant" data-surface="ink">
          <BtBrandLockup />
          <span>{t('guide.darkSurface')}</span>
        </div>
        <div className="brand-variant" data-surface="paper">
          <BtBrandLockup />
          <span>{t('guide.lightSurface')}</span>
        </div>
        <div className="brand-variant" data-surface="yellow">
          <BtBrandLockup />
          <span>{t('guide.yellowSurface')}</span>
        </div>
      </div>
      <BtCollapse title={t('guide.geometry')}>
        <p>{t('guide.geometryBody')}</p>
        <div className="signature-reference">
          <BtBrandLockup size="sm" />
          <BtBrandSymbol size="md" />
        </div>
      </BtCollapse>
      <BtCollapse title={t('guide.clearspace')}>
        <p>{t('guide.clearspaceBody')}</p>
        <div className="clearspace-demo">
          <div>
            <BtBrandLockup size="sm" />
          </div>
        </div>
        <div className="bt-inline">
          <BtBrandLockup size="xs" />
          <BtBrandSymbol size="xs" />
        </div>
      </BtCollapse>
      <BtCollapse title={t('guide.misuse')}>
        <p>{t('guide.misuseBody')}</p>
        <div className="misuse-grid">
          <div>
            <BtBrandLockup className="misuse-stretch" />
            <span>{t('guide.stretch')}</span>
          </div>
          <div>
            <BtBrandLockup className="misuse-contrast" />
            <span>{t('guide.lowContrast')}</span>
          </div>
        </div>
      </BtCollapse>
      <div className="guide-section-heading">
        <h2>{t('guide.type')}</h2>
        <p>{t('guide.typeBody')}</p>
      </div>
      <div className="type-poster">
        <span className="type-poster-large">Aa Bb Gg 012</span>
        <div className="type-weights">
          <span>400 / Regular</span>
          <span>500 / Medium</span>
          <span>600 / Semibold</span>
        </div>
      </div>
      <BtCollapse title={t('guide.voice')}>
        <p>{t('guide.voiceBody')}</p>
        <blockquote>{t('guide.voiceExample')}</blockquote>
      </BtCollapse>
      <BtCollapse title={t('guide.icons')}>
        <p>{t('guide.iconsBody')}</p>
        <div className="icon-specimen">
          <CheckCircle />
          <ChatCircle />
          <UploadSimple />
          <ArrowsClockwise />
          <ClockCounterClockwise />
        </div>
      </BtCollapse>
    </div>
  )
}
