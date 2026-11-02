import { createContext, useContext } from 'react'
import type translations from './translation.json'
export type Locale = 'en' | 'pt-BR'
export type TranslationKey = keyof typeof translations.en
export const LocaleContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void; t: (key: TranslationKey) => string } | null>(null)
export function useTranslation() {
  const context = useContext(LocaleContext)
  if (!context) throw new Error('useTranslation requires LocaleProvider')
  return context
}
