import { useTranslation } from '../i18n/locale'
import tokens from '../design-system/foundation.tokens.json'
import lockup from '../design-system/assets/byturn-lockup.svg'
import wordmark from '../design-system/assets/byturn-wordmark-approved.svg'
import symbol from '../design-system/assets/byturn-symbol.svg'
import bundle from './downloads/byturn-identity-ds-v1.zip?url'
import png from './downloads/byturn-lockup.png'

export function Downloads() {
  const { t } = useTranslation()
  return (
    <div className="guide-page">
      <div className="guide-page-heading">
        <p className="guide-kicker">Byturn / v1</p>
        <h1>{t('exports.title')}</h1>
        <p className="guide-lead">{t('exports.intro')}</p>
      </div>
      <a
        className="download-primary"
        aria-label={t('exports.package')}
        href={bundle}
        download="byturn-identity-ds-v1.zip"
      >
        {t('exports.package')} ↗
      </a>
      <div className="download-grid">
        <a href={lockup} download="byturn-lockup.svg">
          {t('exports.lockup')}
        </a>
        <a href={symbol} download="byturn-symbol.svg">
          {t('exports.symbol')}
        </a>
        <a href={wordmark} download="byturn-wordmark.svg">
          {t('exports.wordmark')}
        </a>
        <a href={png} download="byturn-lockup.png">
          {t('exports.png')}
        </a>
        <a
          href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(tokens, null, 2))}`}
          download="byturn-foundation.tokens.json"
        >
          {t('exports.tokens')}
        </a>
      </div>
      <p className="guide-muted">{t('exports.license')}</p>
      <div className="guide-section-heading">
        <h2>{t('exports.api')}</h2>
        <p>{t('exports.apiBody')}</p>
      </div>
      <pre className="usage-code">
        <code>{`import { BtButton, BtInput } from './design-system/components'\nimport './design-system/tokens.css'\nimport './design-system/components.css'\n\n<BtButton size="md" onClick={onSave}>\n  {t('actions.save')}\n</BtButton>\n\n<BtInput\n  label={t('fields.email')}\n  type="email"\n  error={validationError}\n/>`}</code>
      </pre>
    </div>
  )
}
