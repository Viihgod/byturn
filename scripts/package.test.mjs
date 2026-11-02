import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { unzipSync, strFromU8 } from 'fflate'
import sharp from 'sharp'

test('download package is intact, matches current source and excludes private/provider data', async () => {
  const root = new URL('../', import.meta.url)
  const entries = unzipSync(
    readFileSync(new URL('src/catalog/downloads/byturn-identity-ds-v1.zip', root)),
  )
  const manifest = JSON.parse(strFromU8(entries['manifest.json']))
  const registry = JSON.parse(readFileSync(new URL('src/catalog/registry.json', root), 'utf8'))
  assert.equal(manifest.componentCount, registry.length)
  for (const item of manifest.files) {
    assert.ok(entries[item.file], item.file)
    assert.equal(createHash('sha256').update(entries[item.file]).digest('hex'), item.sha256)
    assert.ok(!/(?:\.env|07_Contexto|share-private|node_modules)/i.test(item.file), item.file)
    if (
      item.file.startsWith('src/') ||
      item.file.startsWith('docs/') ||
      ['LICENSE', 'NOTICE', 'package.json'].includes(item.file)
    ) {
      const source = readFileSync(new URL(item.file, root))
      const expected = item.file.endsWith('.ttf')
        ? source
        : Buffer.from(source.toString('utf8').replaceAll('\r\n', '\n'))
      assert.deepEqual(
        Buffer.from(entries[item.file]),
        expected,
        `Rebuild the stale package entry: ${item.file}`,
      )
    }
  }
  for (const name of [
    'brand/byturn-lockup-ink.png',
    'brand/byturn-symbol-paper.png',
    'brand/byturn-wordmark-yellow.png',
  ]) {
    const metadata = await sharp(entries[name]).metadata()
    const stats = await sharp(entries[name]).stats()
    assert.ok(metadata.hasAlpha, name)
    assert.equal(stats.isOpaque, false, name)
    assert.ok(stats.channels[3].max > 0, name)
    assert.ok(stats.channels[3].min === 0, name)
  }
  assert.match(strFromU8(entries.LICENSE), /Apache License/)
  assert.ok(entries['src/design-system/assets/Outfit-OFL.txt'])
})
