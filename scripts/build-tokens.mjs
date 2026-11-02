import { readFileSync, writeFileSync } from 'node:fs'
const directory = new URL('../src/design-system/', import.meta.url)
const baseline = JSON.parse(readFileSync(new URL('tokens.json', directory), 'utf8'))
const primitives = {
  yellow: '#f2ff40',
  blue: '#369cff',
  violet: '#ad64ff',
  pink: '#ff6db7',
  'neutral-950': '#141414',
  'neutral-900': '#1d1d1d',
  'neutral-850': '#292929',
  'neutral-100': '#f0f0ed',
  'neutral-50': '#f5f5f2',
  white: '#ffffff',
}
const anatomy = {
  controlFont: { xs: 12, sm: 13, md: 14, lg: 14, xl: 16 },
  avatarSize: { xs: 24, sm: 28, md: 32, lg: 38, xl: 44 },
  symbolSize: { xs: 16, sm: 20, md: 24, lg: 32, xl: 44 },
  switchHeight: { xs: 16, sm: 18, md: 20, lg: 22, xl: 24 },
  badgeHeight: { xs: 20, sm: 21, md: 22, lg: 24, xl: 28 },
  badgeFont: { xs: 11, sm: 12, md: 12, lg: 13, xl: 14 },
}
const tokens = {
  version: '1.0.0-proposal',
  status: 'Approved identity with proposed component and usage foundations for owner review',
  primitive: {
    color: primitives,
    ...baseline.scale,
    typography: baseline.typography,
    anatomy,
    border: { standard: 1, focus: 2 },
    shape: { circle: '50%' },
  },
  semantic: Object.fromEntries(
    Object.entries(baseline.themes).map(([theme, values]) => [
      theme,
      {
        ...values,
        'border-muted': theme === 'dark' ? '#3c3c37' : '#d1d1c7',
        overlay: theme === 'dark' ? 'rgb(0 0 0 / .68)' : 'rgb(0 0 0 / .42)',
        shadow: theme === 'dark' ? '0 12px 40px rgb(0 0 0 / .32)' : '0 12px 40px rgb(0 0 0 / .14)',
      },
    ]),
  ),
  component: {
    button: {
      defaultSize: 'md',
      heightToken: 'controlHeight',
      radiusToken: 'radius.sm',
      horizontalPaddingToken: 'space.md',
    },
    field: { defaultSize: 'md', gapToken: 'space.xs', invalidBorderToken: 'danger' },
    panel: { defaultPadding: 'xl', radiusToken: 'radius.lg', borderToken: 'border' },
    brand: { visibleSymbolToN: 1.0318786825074857, approvedGeometry: true },
  },
  motion: {
    fast: 120,
    standard: 180,
    ease: 'cubic-bezier(0.23, 1, 0.32, 1)',
    reducedMotion: 'Disable decorative animation; preserve immediate state changes.',
  },
}
const alias = (value) => {
  const entry = Object.entries(primitives).find(([, color]) => color === value)
  return entry ? `var(--bt-palette-${entry[0]})` : value
}
const scaleNames = {
  controlHeight: 'control-height',
  space: 'space',
  radius: 'radius',
  type: 'type',
  brandWidth: 'brand-width',
}
let css =
  '@font-face{font-family:Outfit;src:url("./assets/Outfit.ttf") format("truetype");font-weight:100 900;font-display:swap}\n:root{\n'
for (const [name, value] of Object.entries(primitives)) css += `  --bt-palette-${name}: ${value};\n`
for (const [group, name] of Object.entries(scaleNames))
  for (const [size, value] of Object.entries(baseline.scale[group]))
    css += `  --bt-${name}-${size}: ${value}px;\n`
for (const [group, values] of Object.entries(anatomy)) {
  const name = group.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
  for (const [size, value] of Object.entries(values)) css += `  --bt-${name}-${size}: ${value}px;\n`
}
css += '  --bt-shape-circle: 50%;\n'
css +=
  '  --bt-font-family: Outfit, sans-serif;\n  --bt-font-weight-regular: 400;\n  --bt-font-weight-medium: 500;\n  --bt-font-weight-semibold: 600;\n  --bt-line-height-body: 1.6;\n  --bt-border-width: 1px;\n  --bt-focus-width: 2px;\n  --bt-duration-fast: 120ms;\n  --bt-duration-standard: 180ms;\n  --bt-ease: cubic-bezier(0.23, 1, 0.32, 1);\n  --bt-z-popover: 20;\n  --bt-z-overlay: 30;\n  --bt-z-dialog: 40;\n  --bt-z-toast: 50;\n}\n'
for (const [theme, values] of Object.entries(tokens.semantic)) {
  css += `${theme === 'dark' ? ':root, ' : ''}:root[data-theme="${theme}"]{\n`
  for (const [key, value] of Object.entries(values)) css += `  --bt-${key}: ${alias(value)};\n`
  css += '}\n'
}
writeFileSync(new URL('foundation.tokens.json', directory), JSON.stringify(tokens, null, 2) + '\n')
writeFileSync(new URL('tokens.css', directory), css)
