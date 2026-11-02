import { useEffect, useState } from 'react'
import { BtBrandLockup, BtSelector, BtSegmented } from './design-system/components'
import { controlHeights } from './design-system/scales'
import type { BtSize } from './design-system/scales'
import { LocaleProvider } from './i18n/context'
import { useTranslation } from './i18n/locale'
import type { Locale, TranslationKey } from './i18n/locale'
import { Identity } from './catalog/Identity'
import { Foundations } from './catalog/Foundations'
import { Catalog } from './catalog/Catalog'
import { Patterns } from './catalog/Patterns'
import { Downloads } from './catalog/Downloads'
import { Reference } from './catalog/Reference'
import './design-system/components.css'
import './App.css'

const sections = [
  'identity',
  'foundations',
  'components',
  'patterns',
  'reference',
  'exports',
] as const
function Guide() {
  const { locale, setLocale, t } = useTranslation()
  const [page, setPage] = useState<string>(
    () => sections.find((section) => `#${section}` === location.hash) ?? 'identity',
  )
  const [size, setSize] = useState<BtSize>('md')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  useEffect(() => {
    const update = () =>
      setPage(sections.find((section) => `#${section}` === location.hash) ?? 'identity')
    window.addEventListener('hashchange', update)
    window.addEventListener('popstate', update)
    return () => {
      window.removeEventListener('hashchange', update)
      window.removeEventListener('popstate', update)
    }
  }, [])
  function navigate(section: string) {
    setPage(section)
    history.pushState(null, '', `#${section}`)
  }
  return (
    <>
      <a className="guide-skip" href="#guide-main">
        {t('guide.navigation')}
      </a>
      <header className="guide-header">
        <a href="#identity" className="guide-home" onClick={() => setPage('identity')}>
          <BtBrandLockup size="sm" />
        </a>
        <div className="guide-header-controls">
          <BtSegmented
            label={t('app.theme')}
            value={theme}
            onChange={(value) => setTheme(value as 'dark' | 'light')}
            options={[
              { value: 'dark', label: t('theme.dark') },
              { value: 'light', label: t('theme.light') },
            ]}
          />
          <BtSelector
            label={t('app.locale')}
            value={locale}
            onChange={(event) => setLocale(event.target.value as Locale)}
          >
            <option value="en">{t('locale.en')}</option>
            <option value="pt-BR">{t('locale.ptBR')}</option>
          </BtSelector>
        </div>
      </header>
      <div className="guide-shell">
        <aside className="guide-sidebar">
          <span className="guide-sidebar-title">Identity / DS v1</span>
          <nav aria-label={t('guide.navigation')}>
            {sections.map((section) => (
              <a
                key={section}
                href={`#${section}`}
                aria-current={page === section ? 'page' : undefined}
                onClick={(event) => {
                  event.preventDefault()
                  navigate(section)
                }}
              >
                {t(`nav.${section}` as TranslationKey)}
              </a>
            ))}
          </nav>
          <p>{t('guide.footer')}</p>
        </aside>
        <main id="guide-main" tabIndex={-1} className="guide-main">
          {page === 'identity' && <Identity />}
          {page === 'foundations' && <Foundations theme={theme} />}
          {page === 'components' && (
            <>
              <div className="guide-size-picker">
                <BtSelector
                  label={t('catalog.globalSize')}
                  value={size}
                  onChange={(event) => setSize(event.target.value as BtSize)}
                >
                  {Object.entries(controlHeights).map(([key, height]) => (
                    <option key={key} value={key}>
                      {key} / {height} px
                    </option>
                  ))}
                </BtSelector>
              </div>
              <Catalog size={size} />
            </>
          )}
          {page === 'patterns' && <Patterns />}
          {page === 'exports' && <Downloads />}
          {page === 'reference' && <Reference />}
        </main>
      </div>
      <footer className="guide-footer">
        <span>Byturn / Identity & DS v1</span>
        <span>{t('guide.proposed')}</span>
      </footer>
    </>
  )
}
export default function App() {
  return (
    <LocaleProvider>
      <Guide />
    </LocaleProvider>
  )
}
