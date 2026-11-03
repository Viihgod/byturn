import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { runNpm } from './run-npm.mjs'

mkdirSync('.checks', { recursive: true })
const steps = ['lint', 'test:coverage', 'test:tooling', 'test:server', 'build']
const report = {
  checkedAt: new Date().toISOString(),
  commit: spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim(),
  results: [],
}
let failed = false
for (const step of steps) {
  const result = runNpm(['run', step])
  report.results.push({ step, passed: result.status === 0 })
  if (result.status !== 0) {
    failed = true
    break
  }
}
writeFileSync('.checks/latest.json', JSON.stringify(report, null, 2) + '\n')
process.exitCode = failed ? 1 : 0
