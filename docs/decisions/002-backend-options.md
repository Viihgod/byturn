# Backend and hosting options

Status: research / recommendation, not a selected or provisioned backend. Reviewed 2026-11-02. Free allowances can change; verify before deployment.

## Recommended starting point: Supabase

Postgres, authentication, storage and server-side authorization policies support the relational review workflow with fewer services to operate. Free includes a 500 MB database, 1 GB file storage, 5 GB egress and 5 GB cached egress; projects can pause after one week of inactivity. This suits a demo or a capped pilot, not unlimited media hosting.

Sources: https://supabase.com/pricing and https://supabase.com/docs/guides/platform/free-project-pausing

Email delivery is a separate production concern: built-in SMTP is restricted. Do not promise public email invitations or passwordless onboarding until a suitable provider is configured. OAuth and review links are possible alternatives to assess, not implemented authentication.

Source: https://supabase.com/docs/guides/auth/auth-smtp

## Larger file allowance: Cloudflare R2

R2 Standard includes 10 GB-month storage, 1 million Class A and 10 million Class B requests monthly, with no direct egress fee. Excess usage is billed; this is not a hard zero-cost cap. Activation requires a billing checkout. Keep buckets private, and issue short-lived access only after server authorization. R2 does not replace authentication or the metadata database.

Source: https://developers.cloudflare.com/r2/pricing/ and https://developers.cloudflare.com/r2/get-started/

## Alternative: Workers + D1 + R2

Workers Free includes 100,000 requests/day and 10 ms CPU/invocation. D1 Free includes 5 GB total account storage, 5 million rows read/day and 100,000 rows written/day; individual database limits also apply. R2 has its own allowances and billing. This needs a custom API and an authentication solution, so expect more backend work than Supabase. Media processing is outside this initial scope.

Sources: https://developers.cloudflare.com/workers/platform/pricing/ and https://developers.cloudflare.com/d1/platform/pricing/

## Alternative for self-hosters: PocketBase

PocketBase provides an open-source backend with database, authentication and file storage, including local/S3 file storage. Running locally is useful for contributors. A public deployment still needs a server, persistent disk, backups and maintenance: open source is not free hosting.

Source: https://pocketbase.io/

## Zero-budget operating proposal

- Start with a capped image/PDF pilot; do not promise unlimited uploads or video transcoding.
- Keep only metadata, comments and version-specific decisions in the database; store binaries in private object storage.
- Enforce file size, workspace quota and permissions on the server, not just in UI validation.
- Preserve approved versions; never delete review evidence silently to recover quota.
- Export metadata and keep recoverable backups. A hosting free tier is not a backup plan.
- Keep provider configuration outside components. Ship migrations and local setup documentation once a backend is selected.
- Do not depend on startup/OSS credits being approved to keep the demo working.

Next decision: select the first backend, then implement workspaces, projects, assets, immutable versions, comments, review decisions and expiring review links with server-enforced workspace isolation.
