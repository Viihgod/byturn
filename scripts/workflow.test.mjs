import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const source = dirname(fileURLToPath(import.meta.url))
function fixture(t, checkExit = 0) {
  const root = realpathSync(tmpdir())
  const cwd = mkdtempSync(join(root, 'byturn-workflow-'))
  t.after(() => {
    const target = resolve(cwd)
    assert.equal(dirname(target), root)
    assert.ok(target.startsWith(join(root, 'byturn-workflow-')))
    rmSync(target, { recursive: true, force: true })
  })
  mkdirSync(join(cwd, 'scripts'))
  for (const file of ['release.mjs', 'run-npm.mjs', 'pre-push.mjs']) copyFileSync(join(source, file), join(cwd, 'scripts', file))
  writeFileSync(join(cwd, 'scripts/check.mjs'), `process.exit(${checkExit})`)
  writeFileSync(join(cwd, 'package.json'), JSON.stringify({ name: 'workflow-fixture', version: '0.0.0' }))
  writeFileSync(join(cwd, 'package-lock.json'), JSON.stringify({ name: 'workflow-fixture', version: '0.0.0', lockfileVersion: 3, packages: { '': { name: 'workflow-fixture', version: '0.0.0' } } }))
  const git = (...args) => {
    const result = spawnSync('git', args, { cwd, encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr)
    return result.stdout.trim()
  }
  git('init', '-b', 'main'); git('config', 'user.name', 'Byturn Test'); git('config', 'user.email', 'test@example.invalid')
  git('config', 'commit.gpgsign', 'false'); git('config', 'tag.gpgsign', 'false'); git('config', 'core.hooksPath', '.unused-hooks')
  git('add', '.'); git('commit', '-m', 'Initial fixture')
  const node = (script, args = [], input) => spawnSync(process.execPath, [`scripts/${script}.mjs`, ...args], { cwd, encoding: 'utf8', input })
  return { cwd, git, node }
}

test('release refuses invalid bumps, wrong branch and dirty trees', t => {
  const f = fixture(t)
  assert.notEqual(f.node('release', ['surprise']).status, 0)
  f.git('switch', '-c', 'feature/example')
  assert.notEqual(f.node('release', ['minor']).status, 0)
  f.git('switch', 'main')
  writeFileSync(join(f.cwd, 'dirty.txt'), 'Uncommitted')
  assert.notEqual(f.node('release', ['minor']).status, 0)
})
test('failed release validation creates neither release commit nor tag', t => {
  const f = fixture(t, 1)
  const before = f.git('rev-parse', 'HEAD')
  assert.notEqual(f.node('release', ['minor']).status, 0)
  assert.equal(f.git('rev-parse', 'HEAD'), before)
  assert.equal(f.git('tag', '--list'), '')
  assert.ok(f.git('status', '--porcelain').includes('package.json'))
})
test('successful release versions main without develop and creates an annotated tag', t => {
  const f = fixture(t)
  const result = f.node('release', ['minor'])
  assert.equal(result.status, 0, result.stderr)
  assert.equal(JSON.parse(readFileSync(join(f.cwd, 'package.json'), 'utf8')).version, '0.1.0')
  assert.equal(JSON.parse(readFileSync(join(f.cwd, 'package-lock.json'), 'utf8')).version, '0.1.0')
  assert.equal(f.git('rev-list', '--parents', '-n', '1', 'HEAD').split(' ').length, 2)
  assert.equal(f.git('cat-file', '-t', 'v0.1.0'), 'tag')
  assert.equal(f.git('status', '--porcelain'), '')
})
test('release refuses to overwrite an existing version tag', t => {
  const f = fixture(t)
  f.git('tag', 'v0.1.0')
  const head = f.git('rev-parse', 'HEAD')
  assert.notEqual(f.node('release', ['minor']).status, 0)
  assert.equal(f.git('rev-parse', 'HEAD'), head)
  assert.equal(f.git('status', '--porcelain'), '')
})
test('pre-push validates HEAD and rejects a dirty or different revision', t => {
  const f = fixture(t)
  const head = f.git('rev-parse', 'HEAD')
  const ref = `refs/heads/main ${head} refs/heads/main ${'0'.repeat(40)}\n`
  assert.equal(f.node('pre-push', [], ref).status, 0)
  assert.notEqual(f.node('pre-push', [], ref.replace(head, '1'.repeat(40))).status, 0)
  writeFileSync(join(f.cwd, 'dirty.txt'), 'Uncommitted')
  assert.notEqual(f.node('pre-push', [], ref).status, 0)
})
test('pre-push propagates failed checks and allows ref deletions', t => {
  const f = fixture(t, 1)
  const head = f.git('rev-parse', 'HEAD')
  assert.notEqual(f.node('pre-push', [], `refs/heads/main ${head} refs/heads/main ${head}\n`).status, 0)
  assert.equal(f.node('pre-push', [], `(delete) ${'0'.repeat(40)} refs/heads/old ${head}\n`).status, 0)
})
test('pre-push dereferences annotated release tags', t => {
  const f = fixture(t)
  f.git('tag', '-a', 'v0.0.1', '-m', 'Fixture tag')
  const sha = f.git('rev-parse', 'v0.0.1')
  assert.equal(f.node('pre-push', [], `refs/tags/v0.0.1 ${sha} refs/tags/v0.0.1 ${'0'.repeat(40)}\n`).status, 0)
})
