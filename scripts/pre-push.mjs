import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
const git = (...args) => spawnSync('git', args, { encoding: 'utf8' })
const head = git('rev-parse', 'HEAD').stdout.trim()
const refs = readFileSync(0, 'utf8').trim().split('\n').filter(Boolean)
const updates = refs.map((line) => line.split(/\s+/)).filter(([, sha]) => !/^0+$/.test(sha))
if (!updates.length) process.exit(0)
function fail(message) {
  console.error(message)
  process.exit(1)
}
if (git('status', '--porcelain').stdout.trim())
  fail('Push blocked: commit or stash changes before validating the pushed revision.')
for (const [ref, sha] of updates) {
  const commit = ref.startsWith('refs/tags/')
    ? git('rev-parse', `${sha}^{commit}`).stdout.trim()
    : sha
  if (commit !== head)
    fail('Push blocked: check out the exact commit you intend to push, then retry.')
}
const result = spawnSync(process.execPath, ['scripts/check.mjs'], { stdio: 'inherit' })
process.exit(result.status ?? 1)
