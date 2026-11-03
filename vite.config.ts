import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  build: { assetsInlineLimit: 2_000_000 },
  plugins: [
    react(),
    {
      name: 'byturn-guide-entry',
      transformIndexHtml: {
        order: 'pre',
        handler: (html) =>
          process.env.BYTURN_GUIDE_ONLY === '1'
            ? html.replace('/src/main.tsx', '/src/guide-main.tsx')
            : html,
      },
    },
  ],
  server: { proxy: { '/api': 'http://127.0.0.1:4174' } },
})
