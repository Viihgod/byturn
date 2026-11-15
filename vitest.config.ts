import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    maxWorkers: 2,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/design-system/**/*.{ts,tsx}', 'src/i18n/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/test/**', 'src/**/*.test.*'],
      reporter: ['text', 'json-summary'],
      thresholds: { statements: 85, branches: 80, functions: 85, lines: 85 },
    },
  },
})
