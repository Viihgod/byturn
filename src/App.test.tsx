import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import translations from './i18n/translation.json'

describe('foundation integration', () => {
  it('starts in English and changes the whole preview to Portuguese and back', async () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(translations.en['app.heading'])
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Language' }), 'pt-BR')
    expect(document.documentElement.lang).toBe('pt-BR')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(translations['pt-BR']['app.heading'])
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Idioma' }), 'en')
    expect(document.documentElement.lang).toBe('en')
  })
  it('changes color mode through the segmented control', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('radio', { name: 'Light' }))
    expect(document.documentElement.dataset.theme).toBe('light')
    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
  it('applies the selected size and keeps sample decisions disabled', async () => {
    render(<App />)
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Preview size' }), 'xl')
    expect(screen.getByRole('button', { name: 'Approve version' })).toHaveAttribute('data-size', 'xl')
    for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled()
  })
  it('keeps locale keys complete and interpolation tokens aligned', () => {
    expect(Object.keys(translations.en).sort()).toEqual(Object.keys(translations['pt-BR']).sort())
    for (const key of Object.keys(translations.en) as (keyof typeof translations.en)[]) {
      const english = translations.en[key]
      const portuguese = translations['pt-BR'][key]
      expect(english.trim()).not.toBe('')
      expect(portuguese.trim()).not.toBe('')
      expect(english.match(/\{\w+\}/g) ?? []).toEqual(portuguese.match(/\{\w+\}/g) ?? [])
    }
  })
})
