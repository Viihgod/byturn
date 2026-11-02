import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
const directory = fileURLToPath(new URL('../dist/', import.meta.url))
function asset(reference, extension) {
  const filename = resolve(directory, reference)
  if (
    !filename.startsWith(directory.endsWith(sep) ? directory : directory + sep) ||
    !filename.endsWith(extension)
  )
    throw new Error('Unexpected build asset reference')
  return readFileSync(filename, 'utf8')
}
let html = readFileSync(resolve(directory, 'index.html'), 'utf8')
html = html.replace(
  /<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g,
  (_, reference) =>
    `<script type="module">${asset(reference, '.js').replaceAll('</script', '<\\/script')}</script>`,
)
html = html.replace(
  /<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,
  (_, reference) => `<style>${asset(reference, '.css')}</style>`,
)
const icon = readFileSync(new URL('../public/favicon.svg', import.meta.url), 'utf8')
html = html
  .replace('href="./favicon.svg"', `href="data:image/svg+xml,${encodeURIComponent(icon)}"`)
  .replace('href="/favicon.svg"', `href="data:image/svg+xml,${encodeURIComponent(icon)}"`)
if (/(?:src|href)="\.\/assets\//.test(html))
  throw new Error('Portable review still references build assets')
writeFileSync(resolve(directory, 'Byturn_Identity_DS_v1.html'), html)
console.log(`Portable review: ${Buffer.byteLength(html)} bytes`)
