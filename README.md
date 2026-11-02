# Byturn

Creative review identity and design-system study. The SaaS is intentionally deferred while the owner evaluates the product direction.

## Current delivery

A reviewable identity guide, semantic foundations, interactive React component catalog and original illustrative applications. English default / PT-BR translation.json; dark default / optional light. The approved symbol and custom Outfit lettering are preserved. Usage recommendations and component APIs are v1 proposals for owner review, not blanket approval of every rule.

The catalog is a real React implementation; review specimens use local state. No authentication, service authorization, file conversion, shared approvals or backend persistence is implemented. Supabase Free is provisioned but not connected. The upload specimen validates type/size locally and does not upload files.

## Run locally

Use Node.js 24 and npm.

```sh
npm ci
npm run dev
```

```sh
npm run check
npm run package:design
npm run review:build
npm run preview
```

`package:design` refreshes generated token CSS/JSON, guide/API documentation and the downloadable ZIP after source changes. Artifact tests reject stale package source. `review:build` produces dist/Byturn_Identity_DS_v1.html as a portable review with local assets inlined. The portable bundle includes font and ZIP download data; it prioritizes a self-contained mobile review over a minimal app bundle.

## Structure

- `src/design-system`: approved assets, semantic tokens and React primitives/compositions.
- `src/catalog`: identity/foundation guide, component registry, interactive examples, original fictional artwork and package downloads.
- `src/i18n/translation.json`: localized UI text; English is the default.
- `docs/identity-guide.md`: approved identity and proposed usage rules.
- `docs/component-api.md`: API reference and accessibility contract.
- `docs/design-system-v1.md`: scope and product direction boundary.
- `docs/overnight-progress.md`: execution checkpoint and evidence.

React identifiers use Bt*; CSS uses bt-*. Control heights: xs 28, sm 30, md 32 default, lg 38, xl 44 px. Spacing/radius have separate named scales. Badges, avatars, brand assets and multiline text have anatomy-specific sizing. Radix supplies unstyled interaction behavior; the visual system is Byturn. Icons use Phosphor.

## Quality and delivery

`npm run check` runs lint, component/i18n/guide tests, DS/i18n coverage thresholds, delivery-tooling/archive tests and production type-check/build. Guide integration tests cover navigation, filtering, language, themes and illustrative client views; their illustrative rendering code is outside the DS coverage threshold. Browser inspection remains necessary for pointer behavior, layout, focus, color composition and downloads. No coverage percentage proves product security.

Short-lived branches integrate into main. `npm ci` installs local push/merge hooks. See docs/decisions/003-delivery.md for their limits and deliberate SemVer release procedures. The working board is https://github.com/users/Viihgod/projects/4/views/2 .

## Licensing and privacy

Code: Apache-2.0 (LICENSE and NOTICE). Outfit: included SIL Open Font License. Radix and Phosphor: MIT, with package notices. Brand use remains separate from the software license. Never commit credentials, private research or personal context. Repository visibility remains private until a separate public-release decision.
