import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import translations from './i18n/translation.json'
import registry from './catalog/registry.json'

describe('identity and DS guide integration', () => {
  it('starts in English/dark and changes the guide language and color mode', async () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      translations.en['guide.identityTitle'],
    )
    expect(document.documentElement.dataset.theme).toBe('dark')
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Language' }), 'pt-BR')
    expect(document.documentElement.lang).toBe('pt-BR')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      translations['pt-BR']['guide.identityTitle'],
    )
    await userEvent.click(screen.getByRole('radio', { name: 'Claro' }))
    expect(document.documentElement.dataset.theme).toBe('light')
    await userEvent.click(screen.getByRole('radio', { name: 'Escuro' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Idioma' }), 'en')
    expect(document.documentElement.lang).toBe('en')
  })
  it('renders every registered specimen, filters by purpose and handles no results', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('link', { name: 'Components' }))
    const componentHeadings = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent)
    expect(componentHeadings).toEqual(registry.map((component) => component.name))
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Preview size' }), 'xl')
    const preview = document.getElementById('BtButton')!
    expect(
      within(preview)
        .getAllByRole('button', { name: 'Save changes' })
        .find((button) => !button.hasAttribute('disabled')),
    ).toHaveAttribute('data-size', 'xl')
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Family' }), 'forms')
    expect(screen.queryByRole('heading', { name: 'BtButton' })).not.toBeInTheDocument()
    const search = screen.getByRole('searchbox', { name: 'Find a component' })
    await userEvent.type(search, 'BtInput')
    expect(screen.getByRole('heading', { name: 'BtInput' })).toBeVisible()
    await userEvent.clear(search)
    await userEvent.type(search, 'does-not-exist')
    expect(screen.getByText('No matching components')).toBeVisible()
  })
  it('exposes token scales/contrast and separate illustrative client views', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('link', { name: 'Foundations' }))
    expect(screen.getAllByRole('table')).toHaveLength(2)
    await userEvent.click(screen.getByRole('link', { name: 'Applications' }))
    expect(screen.getByText('Fieldwork')).toBeVisible()
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'View specimen as' }),
      'client',
    )
    expect(screen.queryByText('Fieldwork')).not.toBeInTheDocument()
    expect(screen.getByText('Northline')).toBeVisible()
    expect(screen.getByText(/does not convert files/)).toBeVisible()
  })
  it('offers downloadable assets and handles browser history navigation', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('link', { name: 'Downloads & API' }))
    expect(screen.getByRole('link', { name: 'Download identity & DS package' })).toHaveAttribute(
      'download',
      'byturn-identity-ds-v1.zip',
    )
    history.replaceState(null, '', '#foundations')
    fireEvent(window, new PopStateEvent('popstate'))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      translations.en['guide.foundationsTitle'],
    )
  })
  it('keeps locale keys complete and interpolation tokens aligned', () => {
    expect(Object.keys(translations.en).sort()).toEqual(Object.keys(translations['pt-BR']).sort())
    for (const key of Object.keys(translations.en) as (keyof typeof translations.en)[]) {
      expect(translations.en[key].trim()).not.toBe('')
      expect(translations['pt-BR'][key].trim()).not.toBe('')
      expect(translations.en[key].match(/\{\w+\}/g) ?? []).toEqual(
        translations['pt-BR'][key].match(/\{\w+\}/g) ?? [],
      )
    }
  })
})
