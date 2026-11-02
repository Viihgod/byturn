import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  build: { assetsInlineLimit: 2_000_000 },
  plugins: [react()],
})
