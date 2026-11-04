# Product review — 2026-11-03

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
