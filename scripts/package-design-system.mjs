import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import sharp from 'sharp'
import { zipSync, strToU8 } from 'fflate'

const root = fileURLToPath(new URL('../', import.meta.url))
const destination = join(root, 'src/catalog/downloads')
mkdirSync(destination, { recursive: true })
const files = {}
const text = (filename) => Buffer.from(readFileSync(filename, 'utf8').replaceAll('\r\n', '\n'))
for (const name of readdirSync(join(root, 'src/design-system'))) {
  if (/\.(tsx?|css|json)$/.test(name) && !name.includes('.test.'))
    files[`src/design-system/${name}`] = text(join(root, 'src/design-system', name))
}
for (const name of readdirSync(join(root, 'src/design-system/assets')))
  files[`src/design-system/assets/${name}`] = name.endsWith('.ttf')
    ? readFileSync(join(root, 'src/design-system/assets', name))
    : text(join(root, 'src/design-system/assets', name))
for (const name of ['LICENSE', 'NOTICE', 'package.json']) files[name] = text(join(root, name))
for (const name of [
  'design-system-v1.md',
  'identity-guide.md',
  'component-api.md',
  'kitsu-component-audit.md',
])
  files[`docs/${name}`] = text(join(root, 'docs', name))
files['src/i18n/translation.json'] = text(join(root, 'src/i18n/translation.json'))
const variants = [
  ['byturn-lockup', 'byturn-lockup.svg', 1480],
  ['byturn-wordmark', 'byturn-wordmark-approved.svg', 1200],
  ['byturn-symbol', 'byturn-symbol.svg', 512],
]
for (const [label, source, width] of variants) {
  const svg = readFileSync(join(root, 'src/design-system/assets', source), 'utf8')
  for (const [colorName, color] of [
    ['ink', '#1b1b19'],
    ['paper', '#f5f5f2'],
    ['yellow', '#f2ff40'],
  ]) {
    const rendered = svg.replaceAll('currentColor', color)
    files[`brand/${label}-${colorName}.svg`] = strToU8(rendered)
    const png = await sharp(Buffer.from(rendered)).resize({ width }).png().toBuffer()
    files[`brand/${label}-${colorName}.png`] = png
    if (label === 'byturn-lockup' && colorName === 'ink')
      writeFileSync(join(destination, 'byturn-lockup.png'), png)
  }
}
for (const dependency of ['radix-ui', '@phosphor-icons/react']) {
  for (const candidate of ['LICENSE', 'LICENSE.md', 'LICENSE.txt']) {
    try {
      files[`licenses/${dependency.replaceAll('/', '-')}-${candidate}`] = readFileSync(
        join(root, 'node_modules', dependency, candidate),
      )
      break
    } catch {
      /* Try the next published license filename. */
    }
  }
}
const registry = JSON.parse(readFileSync(join(root, 'src/catalog/registry.json'), 'utf8'))
files['component-registry.json'] = strToU8(JSON.stringify(registry, null, 2))
files['README.md'] = strToU8(
  '# Byturn identity and DS v1\n\nApproved identity; component APIs and usage foundations are a proposal for owner review. This package is not a published npm library or a Figma library.\n\nReact component source: src/design-system. Import tokens.css and components.css once. Required peer/runtime dependencies are listed in package.json. Localized strings live in src/i18n/translation.json. Components require the caller to provide translated labels; they do not implement service authorization or backend persistence.\n\nBrand variants preserve the approved vector geometry and include transparent PNG exports. Outfit is included with its SIL OFL. Project code: Apache-2.0. Third-party libraries are not vendored; install them from package.json.\n',
)
const manifest = Object.entries(files).map(([name, bytes]) => ({
  file: name,
  bytes: bytes.length,
  sha256: createHash('sha256').update(bytes).digest('hex'),
}))
files['manifest.json'] = strToU8(
  JSON.stringify({ componentCount: registry.length, files: manifest }, null, 2),
)
const archiveEntries = Object.fromEntries(
  Object.entries(files).map(([name, bytes]) => [
    name,
    [bytes, { mtime: new Date('2026-01-01T12:00:00') }],
  ]),
)
writeFileSync(join(destination, 'byturn-identity-ds-v1.zip'), zipSync(archiveEntries, { level: 6 }))
console.log(
  `Packaged ${Object.keys(files).length} files and ${registry.length} catalog components.`,
)
