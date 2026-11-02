# First working review journey

Status: execution plan prepared after the infrastructure bootstrap, 2026-11-02. This is planned work, not a claim that the product is implemented. Follow the phases in dependency order; preserve verified partial deliveries if external setup blocks a later phase.

## Outcome

A studio user publishes V1 of an image, a reviewer requests changes with a comment, the studio publishes V2, the reviewer approves V2, and the studio downloads the approved file with a record of the version, actor and time. Separate browser sessions observe persisted server state. Approving V1 never approves V2. Resolving a comment is not approval.

## Verified starting point

- React/Vite/TypeScript, approved brand assets and initial tokens; five initial component primitives.
- English default, PT-BR translation.json, dark/light modes, control heights 28/30/32/38/44.
- 11 current UI/i18n tests and 7 delivery-tooling tests, local checks, CI, Apache-2.0 and direct-to-main delivery.
- Supabase Free project byturn, region Sao Paulo, reference jiqccvludgoctwxhvqtb, Healthy; public schema empty.
- No product routes, application authentication, backend integration, migrations, real upload or multi-user workflow yet. No local environment configuration is present. Docker and the Supabase executable were not found on PATH during the audit; local database testing must not be claimed until a working runtime is available.

## Defaults for the first implementation

- One studio role and one reviewer role, with workspace membership enforced on the server. Explicit owner-created test users; email/password authentication first. Logging into the Supabase dashboard with GitHub does not configure GitHub OAuth for Byturn users.
- Reviewer deep links initially require an authorized account. Anonymous review links, invitation emails and self-service onboarding follow the authenticated journey; no SMTP or new OAuth provider is required for the first controlled test.
- JPEG, PNG and WebP first. Proposed pilot limits: 10 MB per file, 100 MB per workspace, enforced server-side. No SVG/HTML execution or video processing. PDF support is a follow-up, not a fake image preview.
- One reviewer decision per current asset version for the initial flow. New versions reset review eligibility and preserve prior evidence.
- Approved identity stays fixed. The owner reviews refinements; use existing approved application studies as references and derive components from the actual screens.
- No payments, AI, enterprise SSO, video timecodes, advanced PDF annotation, comparison diff engine or full marketing site in this milestone.

## Phase 1 — Domain and acceptance tests (#4)

Define typed workspaces, memberships, projects, assets, versions, comments, decisions and delivery records. Specify transitions: draft -> in_review -> changes_requested -> in_review on the next version -> approved. Approval binds to a version and the current-version check must be atomic. Define which actions each role can perform. Model failure outcomes before adding persistence.

Acceptance: tests reject approval of an obsolete version, reviewer publication of a new version, decisions by an unrelated workspace, and delivery before required approval. Comments retain their originating version. Double submissions cannot create contradictory current decisions.

## Phase 2 — Components used by the journey (#3)

Add/refine BtInput, BtTextarea, BtBadge, BtStatus, BtTabs, BtVersionSelector, BtCommentThread, BtApprovalPanel and BtAssetCard as the screens require them. Include disabled, pending, error and read-only behavior; validation labels; keyboard navigation and focus. Refine BtButton to express pending actions without duplicate submissions. Keep CSS bt-* identifiers and named scales.

Acceptance: behavior tests and visual inspection in dark/light at mobile and desktop widths. Preserve the approved symbol-to-wordmark ratio, alpha/multiply complementary colors and the stronger light selected-card border/fill. Avoid building dozens of unused components.

## Phase 3 — Product screens with explicit demo data (#4)

Build workspace/project, review room and delivery routes. Show image fit/zoom, versions, comments, current/history states and contextual decisions. Connect the domain behavior through a persistence interface and an explicitly labeled demo adapter. Preserve drafts after failed saves. Direct links and reloads should preserve navigation context.

Acceptance: V1 -> request changes -> V2 -> approve -> delivery can be exercised. Empty/loading/error/read-only states are distinguishable. English/PT-BR, light/dark, keyboard and 390 px mobile work. Demo state must never silently substitute for a failed live connection.

## Phase 4 — Supabase schema, Auth and isolation (#6)

Write versioned SQL migrations before deployment. Add foreign keys, workspace memberships, row-level policies and atomic publication/decision functions. Configure the Supabase browser client with publishable configuration only; keep secrets server-side. Implement login/logout/session recovery and replace the demo adapter with a real adapter. Create disposable test accounts/data without sending messages to real people. Validate application Auth separately from dashboard access.

Acceptance: integration tests prove permitted and denied operations for studio, reviewer and unrelated workspace identities. A reviewer cannot promote their role, access another workspace or approve a superseded version. Mutations and privileged functions derive actor identity server-side. Roll back test data or keep it clearly labeled. Migration application requires a verified authorized connection; if that setup needs user authentication, continue independent frontend/tests/docs and report the exact remaining dependency.

## Phase 5 — Private files and handoff (#7)

Use private Storage with authorized short-lived access. Enforce file types, size and workspace quota at the trusted boundary. Record upload state and clean abandoned uploads without deleting approved evidence. New uploads create immutable version records; do not overwrite approved objects. Deliver the approved original and a version-specific manifest; multi-file ZIP bundling is optional after this works.

Acceptance: unauthorized downloads and path traversal/cross-workspace access fail. Interrupted upload is recoverable. Quota checks withstand concurrent requests. Approving a version and downloading it cannot accidentally serve another version. Client-side checks are only usability aids.

## Phase 6 — Real multi-user proof and review handoff (#8, #9)

Exercise separate studio/reviewer browser sessions against the persisted backend, plus an unrelated user. Cover refresh, expired session/access, stale tabs, duplicate submissions, denied access, failed comment save and upload failure. Inspect visual layout on mobile/desktop and dark/light; use the existing browser workflow. Add reproducible backend test commands once the runtime/connection is available.

Acceptance: capture actual pass/fail evidence and final commit SHAs, keep CI green, update kanban and setup documentation. If a mobile preview can be hosted with the existing free infrastructure, publish it after authorization checks pass; otherwise provide local run instructions and an explicit hosting dependency. Do not declare production readiness from unit coverage. Public repository visibility, a product release tag and production deployment are separate milestones.

## Execution policy

- Work sequentially through the dependencies. A component and the domain tests can advance while a provider access step is pending.
- Keep commits small and meaningful; use short-lived branches into main, local npm run check and the same CI. Do not generate a release/tag for every commit.
- Mark an issue Done only when its acceptance conditions have evidence. A migration file is not a tested RLS policy; a clickable demo is not shared persistence.
- Preserve approved decisions, use original/fictitious sample assets, never commit credentials or private project research, and do not purchase services or send invitations.
- At handoff: working preview/run command, completed milestones, tests and SHAs, unresolved dependencies, and a short next-step list. Execution continues while the task is active; this document is not a claim of unattended all-night scheduling.
