import { useState } from 'react'
import type { ReactNode } from 'react'
import translations from './translation.json'

import { LocaleContext } from './locale'
import type { Locale } from './locale'
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, updateLocale] = useState<Locale>('en')
  function setLocale(next: Locale) {
    document.documentElement.lang = next
    updateLocale(next)
  }
  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: (key) => translations[locale][key] }}>
      {children}
    </LocaleContext.Provider>
  )
}
