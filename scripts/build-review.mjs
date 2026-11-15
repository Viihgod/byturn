import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../', import.meta.url))
const build = spawnSync(
  process.execPath,
  [
    fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url)),
    'build',
    '--outDir',
    'dist-review',
  ],
  { cwd: root, env: { ...process.env, BYTURN_GUIDE_ONLY: '1' }, stdio: 'inherit' },
)
if (build.status !== 0) process.exit(build.status ?? 1)
await import('./build-review-artifact.mjs')
