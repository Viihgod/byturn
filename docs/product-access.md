# Self-hosted product / first working journey

Authorized by Victor on 2026-11-03: proceed through access rules, Figma product views and a persistent working journey. Review may change this proposal. Packaging and public deployment are later steps.

## Access matrix

| Operation | Administrator | Project viewer | Project editor | Project reviewer | Guest review link |
|---|---|---|---|---|---|
| Manage accounts / enable or disable | Yes | No | No | No | No |
| Create projects / grant project access | Yes | No | No | No | No |
| List/read project data | All | Granted project | Granted project | Granted project | Shared project only |
| Upload a piece or new version | Yes | No | Yes | No | No |
| Add a version comment | Yes | No | Yes | Yes | Yes, declared name |
| Request changes / approve current version | Yes | No | No | Yes | Yes, declared name |
| Create/revoke a project review link | Yes | No | Yes | No | No |
| Read historical versions and decisions | All | Granted project | Granted project | Granted project | Shared project only |
| Download approved version | All | Granted project | Granted project | Granted project | Shared project only |

An internal member or client account receives an explicit project grant. Clients may only receive viewer/reviewer grants. No automatic access from job title, tags, knowing an ID or creating an account. An administrator has global access. A disabled account loses active sessions and cannot log in. A removed grant takes effect on the next server request. Tags are labels/filter inputs, not access rules. The first version supports direct account grants; reusable account groups are deferred.

## Versions and decisions

Every piece belongs to one project. Each version is an immutable file with a numbered sequence. A new version starts in review and never inherits approval. Comments and decisions reference a specific version. Decisions for a superseded version are rejected as stale. Resolving a comment is not approval. A change request needs an explanation. An approved version remains an approved historical version; only a currently approved version can be downloaded as the current delivery. A new version does not erase earlier comments or approvals.

An explicit request-changes decision on an approved current version reopens review, retaining the earlier approval event. This first version uses one final reviewer action rather than unanimity across multiple reviewers. Conflicting stale actions are detected with an expected revision counter; no silent overwrite of a newer decision.

## Links and identity

The approved-delivery download control is a workflow rule, not copy protection: review access already permits viewing and saving the original image through the preview. Approval does not prevent a reviewer from copying content they can see.

A link grants review of all pieces and their history in exactly one project, including subsequent versions. The creation UI states that scope. Secrets use random tokens stored hashed; the raw token is shown only when created, carried in a URL fragment, and submitted via an Authorization header. Guest names are declared names, not verified identities. A separate browser-local identity entry is not treated as a client account. Authenticated users retain their actual account identity even when following a guest link.

Revocation prevents new reads/writes/files through that link, while keeping previous events. It cannot remove files already downloaded or content already viewed. Revoke does not remove an independently granted client account. Links do not expose internal user lists, grants, other projects, or link administration. No self-registration or email delivery in this milestone; admins create optional client accounts and send links through their usual channel.

## Runtime and storage

Reference runtime: Node 24, its SQLite API, one HTTP process, local SQLite database and private upload directory. React/Vite frontend uses the same-origin API; the backend can serve the built application. Password hashes use scrypt; sessions use opaque hashed tokens and HttpOnly SameSite cookies. Origin checks cover mutations. Files are decoded and validated as PNG/JPEG/WebP, maximum 5,000,000 bytes, with image dimensions bounded. Storage quota is checked in a transaction before storing metadata; users cannot choose a disk path. Original uploaded bytes are retained rather than silently recompressed.

This is a working application reference environment, not a supported installer for multiple OSes. HTTPS/reverse-proxy setup, backups, recovery, release packaging and load testing remain distribution work. Existing design catalogue remains accessible separately from the product. English is the default, with pt-BR and dark/light controls preserved.

## Acceptance journey

Admin creates member and client accounts, creates a project and grants access. Member uploads V1 and creates a review link. Guest requests a change. Member uploads V2. Guest approves V2. A second session sees the result and downloads the approved file. Member revokes the link. The former visitor can no longer access it; authorized internal users still see the history. Restarting the server preserves accounts, files and events. Tests also attempt cross-project access and stale/revoked actions.
