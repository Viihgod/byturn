import { readFileSync, writeFileSync } from 'node:fs'
const root = new URL('../', import.meta.url)
const translations = JSON.parse(readFileSync(new URL('src/i18n/translation.json', root), 'utf8')).en
const registry = JSON.parse(readFileSync(new URL('src/catalog/registry.json', root), 'utf8'))
const sections = ['geometry', 'clearspace', 'misuse', 'voice', 'type', 'icons']
let identity =
  '# Byturn identity guide / v1\n\nApproved: name, symbol, custom lettering, Outfit, palette and lockup proportion. Usage rules and minimum-size recommendations are proposals for owner review.\n\n'
for (const section of sections)
  identity += `## ${translations[`guide.${section}`]}\n\n${translations[`guide.${section}Body`]}\n\n`
identity += `## ${translations['identity.applicationsTitle']}\n\n${translations['identity.applicationsIntro']}\n\n${translations['identity.applicationsRulesBody']}\n\n`
identity +=
  '## Color\n\nElectric yellow #F2FF40. Orbit 02: blue #369CFF, violet #AD64FF, pink #FF6DB7. Dark: normal alpha 34%; light: multiply alpha 24%. Text stays above the tint. Preserve these transparent layers. Semantic decision colors are separate.\n\n## Export use\n\nUse master SVGs rather than reconstructing the logo from font text. Ink, paper and yellow SVG/PNG variants preserve the same paths. The symbol-to-lowercase-n visible height ratio is approximately 1.032. The standalone symbol is contextual; primary signatures should use the approved lockup. PNG exports have transparent backgrounds.\n\n## Licensing\n\nProject code is Apache-2.0. Outfit remains under its SIL Open Font License. Third-party component primitives/icons keep their original licenses. Apache-2.0 does not grant trademark rights. No trademark registration is claimed.\n'
writeFileSync(new URL('docs/identity-guide.md', root), identity)
let api =
  '# Byturn component API / v1 proposal\n\nImport components from src/design-system/components and load tokens.css and components.css once. Default visual controls: md 32 px; xs 28, sm 30, lg 38, xl 44. Multiline fields, badges, avatars and brand marks have anatomy-specific scales. Props/state rules are proposals for owner review. All visible labels must come from translation.json at the call site.\n\n'
for (const component of registry)
  api += `## ${component.name}\n\n${translations[component.descriptionKey]}\n\nCSS identifier: \`${component.css}\`.\n\n\`\`\`ts\n${component.api}\n\`\`\`\n\n`
api +=
  '## State and accessibility contract\n\nButtons use native button semantics and type=button by default. Pending blocks duplicate activation. Inputs link help/errors to their control and retain native validation/readonly/disabled semantics. Native selects/radios preserve browser keyboard behavior. Radix supplies keyboard and focus behavior for dialogs, drawers, menus, tabs, switches, popovers, tooltips and toast. Dialog title, description and close label are required. Menu disabled items are not actions. Do not hide an essential instruction only in a tooltip.\n\nBadges keep text separate from Orbit tint/multiply; statuses also provide words and a visual dot. A color alone never names a decision. Native progress supports indeterminate state. Skeletons/spinners announce a purpose; reduced motion disables decorative rotation. Tables use native caption/headers and contained horizontal scrolling. Form-field grouping is not an automatic accessible label for arbitrary custom children; label them explicitly.\n\nReview patterns are controlled presentational compositions. They do not persist approvals, enforce workspace permissions, convert files or provide real upload security. The file selector provides local MIME/size feedback; servers still validate actual bytes and identity. The image viewer fits/zooms an illustrative image; it is not a comparison/diff engine.\n'
writeFileSync(new URL('docs/component-api.md', root), api)
