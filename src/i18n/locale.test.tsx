import { render } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { useTranslation } from './locale'

it('reports a missing locale provider clearly', () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  function MissingProvider() { useTranslation(); return null }
  try { expect(() => render(<MissingProvider />)).toThrow('useTranslation requires LocaleProvider') }
  finally { error.mockRestore() }
})
