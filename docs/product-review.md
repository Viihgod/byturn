# Product review — 2026-11-03

## Multi-image carousels and terminal approval — 2026-11-05

The app accepts multiple selected or dropped images in one ordered version. Both the upload queue and saved unapproved carousel support drag and drop plus earlier/later buttons. Limits are explicit: 20 images, 5 MB per image and 25 MB per batch. Validation/quota/storage failure rejects the batch atomically. Each image keeps its own original bytes, private thumbnail endpoint and immutable ID; pin coordinates and replies remain attached to that ID through reordering. Schema 2 preserves older single-image versions and annotations. A stopped-server backup of the local data directory was created before upgrading.

Approval closes the whole version. Repeated approval and further comments/replies/change requests/reordering are rejected by the server; the UI removes these controls and shows a locked banner. An editor can upload a new version to restart review. Team pins are pink square pencil markers; client pins are violet round conversation markers. Activity badges distinguish comment/annotation/reply (`C…`), changes (`R…`) and approval (`A…`), with stable references scoped to a version/category.

Automated checks: 61 frontend/guide/coordinate/upload tests, 10 tooling/archive tests and 14 server integration tests (85 total), plus lint, TypeScript and production build. Added coverage exercises multi-selection plus drop and queue ordering, atomic batches/quota cleanup, original/thumbnail authorization, cross-image/version/project references, reorder conflicts, terminal approval, persistence and legacy migration. DS coverage gates remain scoped to the configured DS/i18n sources, not the entire product.

Browser verification against the real local server:

1. Admin selected three real PNG files together, reordered them with native drag and drop, and uploaded one Carousel QA delivery. Reordering the saved carousel preserved the explicitly selected image and its team pin. Moving slides did not change pin ownership.
2. A guest review link showed the three-image carousel. The guest added a general comment, a client pin on another slide and a request (`R001`). Distinct team/client markers and `C001`–`C003` references were visible. Switching slides showed only that image's pins.
3. At a 390 px viewport, document width was exactly 390 px; the client pin remained at `(0.5, 0.5)` and the popover stayed within x=54…374. Keyboard activation worked. This is viewport emulation, not physical-device testing.
4. The guest approved once (`A001`); decision controls, comment forms and mark creation disappeared. Both guest and administrator views showed the locked banner, with no reorder action. Editors retained replacement-as-new-version. Downloading the selected approved slide returned the original filename and exactly matching bytes.
5. The project drop area was exercised with a DOM-dispatched File/DataTransfer drop (browser tooling has no physical OS-file drag). It opened a two-image queue and submitted a real Drop area QA delivery. The separate React integration test also covers drop and native reorder handlers.

Local screenshots and browser scripts are under workspace `.lavish/byturn-carousel-20261105/`, excluded from the product repository. No external messages or public deployment were performed. Figma composed screens were not updated in this iteration. Vite reports an advisory product bundle-size warning; no load-test or production security certification is claimed.

## Review roles and artwork annotations — 2026-11-04

The running app separates internal delivery management from client review. Administrator/editor accounts get name editing, replacement as a new version, sharing and a client conversation. Approval/change requests belong to a client reviewer or review link and are rejected by the API for internal accounts. New member grants are viewer/editor; client grants are viewer/reviewer.

Both writable sides can place translucent image markers, preview on hover, activate and reply. Coordinates refer to the actual image rectangle; threads belong to one exact version. This iteration changes the running app; the prior composed Figma frames have not been rebuilt for annotations.

The complete check passed: **60** frontend/guide/coordinate tests, **10** tooling/archive tests and **9** server integration tests, plus lint, TypeScript and production build. New tests cover image fitting, persistence, replies, invalid coordinates, cross-project/version access, revocation, internal approval rejection, renaming and legacy-schema migration. Later popover placement/identity/focus refinements received fresh lint/build and browser inspection.

Browser flow on local fixtures: guest pin on V2 → administrator reply → delivery edit → replacement selecting V3 with no inherited pins → team pin on V3 → guest reply visible to designer. Neither admin nor designer had an approval button. A desktop marker center `(0.348039, 0.859626)` became `(0.348060, 0.859644)` in a 390 px viewport, within sub-pixel rounding. The thread popover stayed inside the viewport (x=54, right=374). Keyboard activation was checked. These are browser viewport checks, not a claim of physical-phone testing.

The local database and originals were backed up before an additive migration. Existing versions and prior decisions were preserved. Deployment and supported installers remain later work.

Latest Settings refinement: the trigger now belongs to the sidebar footer directly above the account/avatar. Its modal is anchored 12 px to the right, aligned to the trigger's bottom edge, with a dedicated black backdrop at 30% opacity. On narrow screens it opens below the trigger with viewport collision handling. This change is scoped to Settings; other dialogs keep their existing presentation. The six internal Figma sidebars and both Settings overlay scenes were updated in the existing file. Browser checks verified exact backdrop alpha, anchor/account geometry, Escape/focus return, outside-click dismissal and a fully visible 358 px modal in a 390 px viewport.

Navigation update: the sidebar now opens Settings as a modal. Its Resources section links to the design-system guide in a separate tab; the guide is no longer a primary navigation item. The same Figma file has corrected navigation in all four internal screens and two additional Settings overlay scenes (light/dark), bringing the total to ten frames. Browser QA confirmed Escape/focus return, the guide destination, translation and 390 px modal layout.

Steps 1–3 authorized by the owner are implemented for local review on branch `feat/self-hosted-review`. No public deployment, repository publication, merge or supported installer release is included.

## Review surfaces

- Product Figma: https://www.figma.com/design/32XlAAmGddJTzBgYtN9XqH — Byturn / Product journeys.
- Existing IDV/DS Figma, preserved: https://www.figma.com/design/S4MyTTVQ0IPSEhCkVLZnO9 .
- Running local application: http://127.0.0.1:4174 .
- Existing interactive design-system guide: http://127.0.0.1:4174/?guide=1 .
- Access rules: [product-access.md](product-access.md).
- Demo credentials, restart and operation: [product-runbook.md](product-runbook.md).

The product Figma has two clearly separated pages: Product journeys and Local primitives. Eight editable screens cover administration, project workspace and desktop client review in light/dark, plus mobile client review in both themes. Existing approved vector geometry, Outfit and semantic colors were reused. These are composed design frames with local button specimens, not a published component library, complete atomic parity, or a clickable prototype. The existing DS file remains the library reference. The running application is the functional prototype. Dialogs, empty states, server errors and additional operational controls are implemented in the app; the eight Figma frames are the core journey, not an exhaustive screen inventory.

## Working product

The admin creates accounts/projects and grants access to a whole project. Members and clients only see projects explicitly granted to them. The team uploads static original images, creates review links, receives version-specific feedback and sends subsequent versions. Account-free review, optional client accounts, a distinct declared-name identity and revocable links are implemented. A new version does not inherit approval. SQLite and private original files preserve state across restart.

The first permission model is direct per-user project grants; tags organize work, and reusable groups/department policies remain later work. The first approval model accepts a final action by one authorized reviewer, rather than requiring unanimous approval by several people. Those are reviewable product choices.

## Verification evidence

The complete `npm run check` passed: lint, **58** React/guide/i18n tests, **10** tooling/archive tests, **6** real server integration tests, TypeScript and production build. Vitest uses two workers after the original unrestricted run hit an existing 5-second guide test timeout under local contention; the complete rerun passed without relaxing assertion or timeout thresholds. Subsequent copy/color refinements received fresh lint/build and package checks.

The server suite verifies: a V1 change request followed by V2 approval/download/revocation and persistence after restart; account/link/file isolation between projects; account-based client review; disabling users and removing grants; viewer write restrictions; conflicting decisions/stale versions; image validity, storage quota and browser origin checks.

Browser checks used the actual local server and database:

1. Admin created a project link and signed out. A guest opened it, entered a declared name and requested a date change on V1.
2. Designer signed in and saw only Autumn launch, read the request and uploaded a real revised PNG as V2.
3. The guest approved V2 and downloaded it through the UI. Downloaded bytes matched the uploaded original exactly (72,308 bytes). V1 retained its change request; its historical view did not offer approval.
4. Admin created Pat Quinn, granted viewer access to Autumn launch, and signed out. Pat saw one project and no comment/upload/share/approval controls.
5. Admin revoked the link. Opening the old link after sign-out showed the unavailable state. Stored versions/decisions remained visible to authorized users.
6. Desktop dark/light and Portuguese labels were inspected, alongside mobile review at 390 px. The mobile document measured 390 px wide with no horizontal page overflow. The standalone guide build was generated independently of the product build.

No hosted CI, cross-OS installer, external deployment, accessibility certification or production security audit is claimed. Default storage is 250 MB of originals across all retained versions, adjustable by the operator; it is cumulative, not monthly. Deployment readiness requires the next installation/hosting phase documented in the runbook.
