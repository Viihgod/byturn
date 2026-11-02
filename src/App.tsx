import { useState } from 'react'
import { BtButton, BtCard, BtCollapse, BtSegmented, BtSelector } from './design-system/components'
import { controlHeights } from './design-system/scales'
import type { BtSize } from './design-system/scales'
import { LocaleProvider } from './i18n/context'
import { useTranslation } from './i18n/locale'
import type { Locale } from './i18n/locale'
import lockup from './design-system/assets/byturn-lockup.svg'
import './App.css'

function Foundations() {
  const { locale, setLocale, t } = useTranslation()
  const [size, setSize] = useState<BtSize>('md')
  const [theme, setTheme] = useState('dark')
  return <main className="bt-workspace">
    <header><img className="bt-brand" src={lockup} alt="Byturn" /><BtSelector label={t('app.locale')} value={locale} onChange={event => setLocale(event.target.value as Locale)}><option value="en">{t('locale.en')}</option><option value="pt-BR">{t('locale.ptBR')}</option></BtSelector></header>
    <h1>{t('app.heading')}</h1><p>{t('app.intro')}</p>
    <div className="bt-toolbar"><BtSegmented label={t('app.theme')} value={theme} onChange={value => { setTheme(value); document.documentElement.dataset.theme = value }} options={[{ value: 'dark', label: t('theme.dark') }, { value: 'light', label: t('theme.light') }]} />
    <BtSelector label={t('catalog.globalSize')} value={size} onChange={event => setSize(event.target.value as BtSize)}>{Object.entries(controlHeights).map(([key, height]) => <option key={key} value={key}>{key} / {height} px</option>)}</BtSelector></div>
    <BtCard selected><h2>{t('tab.review')}</h2><p>{t('foundation.demo')}</p><div className="bt-actions"><BtButton size={size} disabled>{t('foundation.primary')}</BtButton><BtButton size={size} variant="secondary" disabled>{t('foundation.disabled')}</BtButton></div></BtCard>
    <BtCollapse title={t('catalog.rules')}><p>{t('foundation.scope')}</p></BtCollapse>
  </main>
}
export default function App() { return <LocaleProvider><Foundations /></LocaleProvider> }
