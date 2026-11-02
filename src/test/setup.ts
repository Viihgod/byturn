import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
  document.documentElement.lang = 'en'
  document.documentElement.dataset.theme = 'dark'
})
