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
npm run check
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
5. Document local backend setup, deployment and contribution; prepare the first public release.

## Delivery workflow

Work on short-lived feature/fix branches and integrate directly into `main`. No develop stage is required. Mark deliberate releases with SemVer tags. Run `npm run check` locally or in CI. It includes lint, behavior tests with coverage thresholds, delivery-tooling tests and the production build. `npm ci` installs pre-push and local merge hooks. See [delivery rules](docs/decisions/003-delivery.md) for limits and the versioned release procedure. Hooks do not enforce GitHub web merges.

Track work in the [Byturn delivery kanban](https://github.com/users/Viihgod/projects/4/views/2). The owner selected Apache-2.0; see [the license decision](docs/decisions/004-license-options.md).

## Licensing and privacy

The project code is licensed under [Apache-2.0](LICENSE). See [NOTICE](NOTICE) for attribution. Outfit remains under its included SIL Open Font License. Apache-2.0 does not grant trademark rights. Repository visibility remains private during preparation; applying a license does not publish the repository. No credentials, private research or personal project context belong in this repository.
