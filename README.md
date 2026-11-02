# Byturn

Creative review and approval, with feedback and decisions attached to the right version.

## Current status

Early frontend foundation: React, Vite and TypeScript, approved brand assets, theme tokens, English/PT-BR translations and five initial component primitives. The preview is a foundation sandbox, not the product. Disabled sample actions do not save, approve or send anything. There is no backend, authentication or upload service yet.

## Run locally

Use Node.js 24 and npm.

```sh
npm ci
npm run dev
```

```sh
npm run lint
npm run build
npm run preview
```

## Structure

- `src/design-system`: approved assets, tokens and initial BtButton, BtSelector, BtCard, BtCollapse and BtSegmented primitives.
- `src/i18n/translation.json`: all localized UI text; English is the default.
- `src/features/review`: reserved for the first complete version review workflow.
- `src/services`: reserved for persistence and authentication adapters.
- `docs/decisions`: architecture decisions and researched backend options.

CSS identifiers use `bt-*`; React exports use `Bt*`. Control sizes are xs 28, sm 30, md 32 (default), lg 38 and xl 44 px. Spacing and radius have their own named scales.

## Next milestones

1. Refine and document the component API and states with the design-system owner.
2. Build the first review flow with explicit mock data: V1, comments, changes requested, V2, approval and handoff.
3. Select the backend, add migrations, enforce workspace isolation and version-specific decisions on the server.
4. Add real uploads, permissions and review links; verify multi-user behavior and failure recovery.
5. Document local backend setup, deployment and contribution; choose the product license before public release.

## Licensing and privacy

The project is intended for an open-source release. The product license has not been selected; this private preparation repository does not yet grant a product license. Outfit's license is included alongside its font. No credentials, private research or personal project context belong in this repository.
