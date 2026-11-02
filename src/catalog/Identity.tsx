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
      <div className="guide-section-heading">
        <h2>{t('identity.applicationsTitle')}</h2>
        <p>{t('identity.applicationsIntro')}</p>
      </div>
      <div className="identity-applications">
        <figure className="identity-application" data-piece="announcement">
          <div className="identity-piece" data-surface="ink">
            <span className="identity-piece-eyebrow">{t('identity.announcementEyebrow')}</span>
            <div className="identity-piece-orbits" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <BtBrandLockup />
            <div className="identity-piece-footer">
              <p>{t('identity.announcementLine')}</p>
              <span>{t('identity.announcementBody')}</span>
            </div>
          </div>
          <figcaption>{t('identity.announcementCaption')}</figcaption>
        </figure>
        <figure className="identity-application" data-piece="cover">
          <div className="identity-piece" data-surface="paper">
            <span className="identity-piece-eyebrow">{t('identity.coverEyebrow')}</span>
            <BtBrandLockup />
            <div className="identity-piece-footer">
              <p>{t('identity.coverLine')}</p>
              <span>{t('identity.coverBody')}</span>
            </div>
            <span className="identity-piece-edition">01 / 01</span>
          </div>
          <figcaption>{t('identity.coverCaption')}</figcaption>
        </figure>
        <figure className="identity-application" data-piece="handoff">
          <div className="identity-piece" data-surface="yellow">
            <span className="identity-piece-eyebrow">{t('identity.handoffEyebrow')}</span>
            <BtBrandLockup />
            <div className="identity-piece-footer">
              <p>{t('identity.handoffLine')}</p>
              <span>{t('identity.handoffBody')}</span>
            </div>
          </div>
          <figcaption>{t('identity.handoffCaption')}</figcaption>
        </figure>
      </div>
      <BtCollapse title={t('identity.applicationsRules')}>
        <p>{t('identity.applicationsRulesBody')}</p>
      </BtCollapse>
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
