# Byturn

An agency's self-hosted space for creative delivery, versioned feedback and approvals. One installation manages internal accounts, explicit access per project and optional client accounts. Clients can also review through a revocable link without signing up.

The local reference build uses React, Node.js 24, SQLite and private files on disk. It implements persistent accounts, project grants, original image uploads, immutable versions, comments, change requests, approval, original downloads and link revocation. It is ready for owner review; installers, public deployment and a supported hosting matrix are subsequent work.

## Try locally

Internal teams manage delivery names, replace images as new versions and respond to clients. Client review owns approval and change requests. Both sides can pin comments to the artwork and reply in version-specific threads; image-relative positions stay attached to the same point when the viewport changes.

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

Code: Apache-2.0 (LICENSE and NOTICE). Outfit: included SIL OFL. Radix and Phosphor: MIT. Brand use is separate from the software license. Never commit real credentials, runtime data, client files or private research. The default `.data/` directory is ignored. Repository visibility remains private until a separate public-release decision; Supabase is not connected or required.

Short-lived branches integrate into main. See [delivery decisions](docs/decisions/003-delivery.md) for local hooks and deliberate releases. There is no automatic production deployment.
