import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'

export function runNpm(args) {
  const cli = [
    process.env.npm_execpath,
    join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
    join(dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js'),
  ].find((candidate) => candidate && existsSync(candidate))
  return cli
    ? spawnSync(process.execPath, [cli, ...args], { stdio: 'inherit' })
    : spawnSync('npm', args, { stdio: 'inherit' })
}
