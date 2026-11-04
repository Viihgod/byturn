# Self-hosted review workspace — local review build

This build implements one agency per installation, with a React client, Node.js 24 server, SQLite database and private original images on disk. It is a working local reference implementation, not an installer or a public hosted service. The code retains the existing Apache-2.0 license. Repository publication and packaging are separate decisions.

## Try the prepared workspace

Open http://127.0.0.1:4174 on the computer running the server. The design-system guide remains available at http://127.0.0.1:4174/?guide=1 . English is the default; use the header for Portuguese and light/dark mode.

Inside the signed-in workspace, open Settings in the sidebar, then Resources → Open design system. Settings opens as a modal and preserves the current project; the guide opens in a separate tab.

Settings is at the bottom of the sidebar, immediately above the account/avatar. The modal opens next to its trigger with a 30% black backdrop; narrow screens place it below the trigger so it stays visible.

The explicit local demo seed uses password `Byturn-review-2026!` for these fictional accounts:

| Email | Account | Project access |
| --- | --- | --- |
| admin@byturn.local | Administrator / Alex | All projects and account management |
| designer@byturn.local | Member / Jamie | Autumn launch / editor |
| developer@byturn.local | Member / Sam | Website release / editor |
| client@byturn.local | Client / Taylor | Autumn launch / reviewer |

The browser QA additionally created `pat@byturn.local` as a viewer of Autumn launch, using the same fixture password. This account is only in the prepared local data, not the seed. Demo identities and artwork are fictional. Never use demo credentials for a reachable installation.

Suggested review: sign in as admin, open Team & access, inspect the two separate projects, open Autumn launch, share a review link, and sign out before opening it to experience guest review. Weekend poster already includes a guest change request on V1 and approval on V2 from the browser verification. Other files remain awaiting review. Create a fresh link: the browser acceptance link is deliberately revoked at the end of QA.

## Start a fresh demo

Requires Node.js 24 and npm. From the repository directory:

```sh
npm ci
npm run setup:demo
npm run build
npm start
```

Setup refuses a database that already contains users. It does not replace or reset existing data. By default the private database and originals live in `.data/`, excluded from Git. Use a different `BYTURN_DATA_DIR` for an independent installation. Do not put the data directory under `public/`, `dist/`, or any web-served directory.

For frontend development, run the backend in one terminal with `BYTURN_DEV_ORIGIN=http://localhost:5173`, then `npm run dev` in another. Vite proxies `/api` to `127.0.0.1:4174`. Match the configured development origin to the actual Vite address; origin checks intentionally reject other browser addresses.

## Bootstrap without demo accounts

Set `BYTURN_ADMIN_EMAIL`, `BYTURN_ADMIN_PASSWORD` (12–200 characters), optional `BYTURN_ADMIN_NAME`, and a persistent `BYTURN_DATA_DIR`; then run `npm run setup`. Set secrets through the local process environment, never in a committed file. Only this administrator is created. Add other accounts through Team & access. Password reset signs that account out of all sessions; disabling an account does the same. Public registration, email delivery and password recovery by email are outside this build.

| Setting | Default | Meaning |
| --- | --- | --- |
| PORT | 4174 | HTTP server port |
| HOST | 127.0.0.1 | Listen address; local only by default |
| BYTURN_PUBLIC_URL | http://127.0.0.1:4174 | Actual browser origin; HTTPS also enables Secure cookies |
| BYTURN_DEV_ORIGIN | empty | One additional allowed development origin |
| BYTURN_DATA_DIR | .data | Persistent SQLite database and private originals |
| BYTURN_STORAGE_BYTES | 250000000 | Total original-image allowance across all projects and versions |

The allowance is cumulative disk usage, not a monthly quota. PNG/JPEG/WebP originals are limited to 5,000,000 bytes each, 24 megapixels and a single frame. Invalid images are rejected server-side; existing versions count toward storage. No file conversion or S3 service is required. There is no deletion/retention UI in this version. Administrators can change the allowance after checking actual free disk space; the application does not reserve disk capacity.

## What is working

Internal delivery management now offers Edit delivery, Replace image, Share review and a client conversation panel. Replacement creates and selects a new immutable version. Editing changes the delivery name, not the image's pixels. Internal accounts no longer get client approval controls; those belong to a client reviewer or guest link.

Choose **Mark artwork**, then click/tap the image to write a location-specific comment. Keyboard users can activate the placement surface to start a center marker. Hover a marker to preview, or activate it to reply. Sidebar annotation links locate the same thread on the image. Both sides can create markers and reply. Locations are percentages of the actual image, so viewport resizing preserves the marked point. Old markers remain on the old version.

The local Weekend poster fixture now has V3, a team marker on its date and a guest reply; V2 retains the earlier guest marker and team response. These are fictional QA messages. No external message was sent. A private pre-migration backup was created under ignored `.data-backups/` before restarting the local server.

Administrators create projects/accounts, disable/enable accounts, reset passwords and grant/remove viewer, editor or reviewer access per project. A member initially sees nothing until granted access. Client accounts can be viewers or reviewers; creating one is optional. Tags/search/status filters organize visible work and never grant access.

Editors upload original images and immutable numbered versions, comment, create links and revoke them. Reviewers comment and decide on the current version. A change request requires an explanation. Approval is bound to that exact version; a new upload starts awaiting review. The API rejects decisions based on a replaced version or stale decision revision. Server changes appear in other open sessions on a 10-second refresh interval.

Guest links grant review access to one entire project, including history and future uploads. The secret appears once in the sharing dialog, is carried in the URL fragment and sent as a bearer credential to the API. Only its hash is stored in SQLite. Someone who receives a forwarded link also receives its access. Revocation blocks subsequent API/file requests and retains submitted feedback. It cannot erase already viewed, cached or downloaded content. Guest names are explicitly marked as declared; a signed-in account's identity is recorded as an account.

The download button serves the current approved original byte-for-byte. This is workflow guidance, not copy protection: reviewers can already view the original image and may save it from the preview before approval.

## Verification and limits

`npm run check` runs lint, the existing component/guide/i18n suite and coverage gates, delivery tooling/archive checks, the new server integration suite, then TypeScript and a production build. Coverage percentages apply to the DS/i18n files configured in Vitest, not the backend or the whole product. `npm run test:server` separately covers persistence across restart, project isolation, guest/account review, original download, revocation, disabled users, removed grants, viewer restrictions, concurrent decisions, image validation, storage quota and browser origin checks.

Browser QA additionally exercises guest V1 change request → designer V2 upload → guest approval → exact original download; administrator account creation/grant → viewer-only UI; revocation; language/theme and mobile layout. These checks are evidence for this review build, not a production security certification.

`npm run review:build` still produces the standalone design-system HTML, now in `dist-review/Byturn_Identity_DS_v1.html`, using a dedicated guide entry. The production `dist/` remains the functional product. The product itself requires its backend and cannot be hosted as a static HTML file.

External access from an agency PC requires a reachable server address, HTTPS and correctly configured routing/reverse proxy or tunnel. A website link only opens the app; the running server stores the changes. A VPS must support a persistent Node process, SQLite and persistent disk. Static-only hosting and generic shared-hosting plans are not verified targets. No Windows/macOS/Linux installer, Docker image, service supervisor, backup automation or public deployment has been delivered yet.

For a consistent backup, stop the server, copy the entire data directory (database and originals together) to protected storage, then restart it. Restore the entire directory into a stopped installation. Treat backups and review links as private data. The next deployment phase must include a tested restore, HTTPS/reverse-proxy setup, versioned schema migration and an installation/update procedure before real client data is used.
