import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  root: 'demo',
  base: './',
  publicDir: false,
  plugins: [react()],
  build: { outDir: '../dist-demo', emptyOutDir: true },
})
