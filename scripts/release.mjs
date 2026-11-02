import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { runNpm } from './run-npm.mjs'

const git = (...args) => spawnSync('git', args, { encoding: 'utf8' })
function fail(message) { console.error(message); process.exit(1) }
const bump = process.argv[2]
if (!['patch', 'minor', 'major'].includes(bump)) fail('Usage: npm run release -- patch|minor|major')
if (git('branch', '--show-current').stdout.trim() !== 'main') fail('Switch to main before preparing a release.')
if (git('status', '--porcelain').stdout.trim()) fail('Release requires a clean working tree.')
const current = JSON.parse(readFileSync('package.json', 'utf8')).version.split('.').map(Number)
const next = bump === 'major' ? `${current[0] + 1}.0.0` : bump === 'minor' ? `${current[0]}.${current[1] + 1}.0` : `${current[0]}.${current[1]}.${current[2] + 1}`
if (git('rev-parse', '--verify', `refs/tags/v${next}`).status === 0) fail(`Tag v${next} already exists.`)
if (runNpm(['version', next, '--no-git-tag-version', '--ignore-scripts']).status !== 0) fail('Version update failed. Inspect the version files; no tag was created.')
if (spawnSync(process.execPath, ['scripts/check.mjs'], { stdio: 'inherit' }).status !== 0) fail('Validation failed. No release commit/tag was created. Inspect the changed version files and fix the failure before releasing.')
if (git('add', 'package.json', 'package-lock.json').status !== 0) fail('Could not stage the version files.')
const commit = git('commit', '-m', `Release v${next}`)
if (commit.status !== 0) fail(commit.stderr || 'Release commit failed; no tag was created.')
if (git('tag', '-a', `v${next}`, '-m', `Byturn v${next}`).status !== 0) fail('Commit created but tagging failed. Inspect the repository before pushing.')
console.log(`Prepared v${next} locally. Review the diff and release notes, then push main and its tag. No automatic push or deployment was performed.`)
