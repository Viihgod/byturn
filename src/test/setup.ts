import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom has no pointer-capture implementation. Browser QA covers native pointer behavior.
Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', {
  configurable: true,
  value: () => false,
})
Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
  configurable: true,
  value: () => {},
})
Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
  configurable: true,
  value: () => {},
})

afterEach(() => {
  cleanup()
  document.documentElement.lang = 'en'
  document.documentElement.dataset.theme = 'dark'
  history.replaceState(null, '', '/')
})
