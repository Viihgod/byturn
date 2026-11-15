# Byturn

An agency's self-hosted space for creative delivery, versioned feedback and approvals. One installation manages internal accounts, explicit access per project and optional client accounts. Clients can also review through a revocable link without signing up.

The local reference build uses React, Node.js 24, SQLite and private files on disk. It implements persistent accounts, project grants, original image uploads, immutable versions, comments, change requests, approval, original downloads and link revocation. The first release is a preview for local and self-hosted evaluation. The portfolio demo uses a fictional project in the browser.

## Demo and local setup

The [portfolio demo](https://viihgod.github.io/byturn/) opens a fictional client review. Inspect the V1 feedback, return to V2, leave a comment or approve, and download the revised poster. Reset demo starts a fresh session. The full app below includes the studio workspace, authentication and persistent storage.

Internal teams manage delivery names, upload multiple images as ordered carousels, replace image sets as new versions and respond to clients. Multiple selection and file drop share a sortable upload queue; saved unapproved carousels also support ordering, with keyboard/touch alternatives. Client review owns approval and change requests. Approval closes the entire version, preventing repeated decisions or further review edits. Both sides can pin comments to individual images and reply in version-specific threads; stable image IDs preserve pins through reordering and relative positions survive viewport changes. Distinct team/client markers and typed activity references clarify the history.

```sh
npm ci
npm run setup:demo
npm run build
npm start
```

Open http://127.0.0.1:4174 . Setup requires an empty user database and does not replace existing data. Demo accounts, local credentials, a full review journey, configuration and backup instructions are in [the runbook](docs/product-runbook.md). For an installation without fictional accounts, bootstrap your administrator through the environment as described there.

The design-system guide remains at `/?guide=1`. It has independent illustrative specimens; product data and authorization live in the server. English default / PT-BR; dark default / optional light. Approved Byturn geometry, Outfit and the existing semantic design tokens are preserved.

## Verify and develop

```sh
npm run check
npm run test:server
npm run package:design
npm run review:build
```

`check` runs lint, component/guide/i18n tests with DS coverage thresholds, delivery-tooling/archive tests, server integration tests and a production type-check/build. The API tests exercise real temporary databases and original files, independent sessions, forbidden cross-project access, revocation, persistence and concurrent decisions. Browser QA is documented in the product review record; code coverage is not a security certification.

`package:design` refreshes generated tokens, guide documentation and the source/brand ZIP. `review:build` produces a standalone **design-system guide** at `dist-review/Byturn_Identity_DS_v1.html`; the functional product in `dist/` requires the running backend. Development uses `npm start` plus `npm run dev` in separate terminals and an explicitly allowed `BYTURN_DEV_ORIGIN`.

## Structure

- `src/product`: functional workspace, account management and review UI.
- `server`: HTTP API, SQLite authorization/persistence, private image storage, bootstrap and integration tests.
- `src/design-system`: approved identity, semantic tokens and React components.
- `src/catalog`: independent IDV/DS guide, component registry, specimens and downloads.
- `src/i18n/translation.json`: English and Brazilian Portuguese interface text.
- `docs/product-access.md`: access matrix and review rules.
- `docs/product-runbook.md`: operation, demo and deployment boundaries.
- `docs/product-review.md`: implementation and verification record.

## Licensing and privacy

Code: Apache-2.0 (LICENSE and NOTICE). Outfit: included SIL OFL. Radix and Phosphor: MIT. Brand use is separate from the software license. Never commit real credentials, runtime data, client files or private research. The default `.data/` directory is ignored. The current release uses SQLite and requires no Supabase project.

Short-lived branches integrate into main. See [delivery decisions](docs/decisions/003-delivery.md) for local hooks and deliberate releases. There is no automatic production deployment.
