# Managed backend direction

Status: accepted. A hosted Free project was created on 2026-11-02 and verified Healthy in the dashboard. The owner prefers managed infrastructure and minimal operational overhead.

Organization: Byturn. Project: byturn. Region: South America (São Paulo), sa-east-1. Project reference: jiqccvludgoctwxhvqtb. Dashboard: https://supabase.com/dashboard/project/jiqccvludgoctwxhvqtb . The public schema is initially empty; the application is not connected yet. Project creation is not evidence that application authorization has been implemented or tested. No database password or secret API key is stored here.

Use managed Supabase Postgres, Auth and private Storage. Write database schema, migrations, transactional review rules and row-level security in SQL. Use TypeScript in Supabase Edge Functions (Deno runtime) for privileged operations, external integrations and future billing webhooks where necessary. Do not introduce a standalone Python or Rust API for the current scope.

Use Supabase Auth rather than adding Keycloak. Keycloak is useful for an explicit enterprise federation/SSO requirement, but self-hosting it introduces another service, database, upgrades and operational configuration. It does not remove the application's authorization responsibilities.

Supabase supplies managed authentication primitives and database/storage policy mechanisms. Byturn still owns workspace membership and role rules, authorization on every server operation, private-file access, expiring/revocable review links, version-specific approval transactions, input validation, quotas and secret handling. Never ship secret/service-role keys to the browser; those can bypass RLS. Test cross-workspace denial and privilege escalation before allowing real user data.

Account setup: create or use the owner's Supabase account, choose an organization and create a Free project. Prefer connecting through the owner's GitHub account when appropriate. Keep database credentials in a secret manager/local environment, not source code or chat. Local Supabase development can precede the hosted project.

The owner requested inactivity reminders after the hosted project starts. Normal database-backed use twice per week is a reasonable habit, not a guarantee of the provider's low-activity classification. The provider says visiting the project dashboard can generate activity, but does not guarantee that two visits per week meet its low-activity threshold. A scheduled check must distinguish observed low activity from missing metrics or expired dashboard access; it must not generate synthetic database traffic or promise continuous monitoring.

Sources:

- https://supabase.com/docs/guides/auth
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/storage/security/access-control
- https://supabase.com/docs/guides/functions
- https://supabase.com/docs/guides/platform/free-project-pausing
- https://www.keycloak.org/guides
