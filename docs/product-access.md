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
| Request changes / approve current version | No | No | No | Client only | Yes, declared name |
| Edit delivery name / replace image with a new version | Yes | No | Yes | No | No |
| Pin a comment to the artwork / reply in its thread | Yes | No | Yes | Yes | Yes, declared name |
| Create/revoke a project review link | Yes | No | Yes | No | No |
| Read historical versions and decisions | All | Granted project | Granted project | Granted project | Shared project only |
| Download approved version | All | Granted project | Granted project | Granted project | Shared project only |

An internal member or client account receives an explicit project grant. Clients may only receive viewer/reviewer grants. No automatic access from job title, tags, knowing an ID or creating an account. An administrator has global access. A disabled account loses active sessions and cannot log in. A removed grant takes effect on the next server request. Tags are labels/filter inputs, not access rules. The first version supports direct account grants; reusable account groups are deferred.

## Versions and decisions

Updated after owner review on 2026-11-04: approval belongs to client review. Signed-in administrators and internal members manage deliveries and discuss feedback; they cannot approve or request changes through their internal account API. A guest link explicitly opens client review, including for someone with a signed-in account. New member grants are viewer/editor; client grants are viewer/reviewer. A legacy internal reviewer grant retains read/comment access but cannot approve.

## Artwork comments

Both writable sides can place a comment on the original image and reply in its shared thread. Messages are visible to all authorized project participants; they are not private internal notes. Viewers can read but cannot write.

Root comments can contain a normalized `(x, y)` anchor, each finite and between 0 and 1, against the displayed image content. Preview padding and letterboxed space are excluded. The same intrinsic image point is displayed at every viewport size without cropping. Markers are translucent icon buttons; hover previews the thread, activation keeps it open for replies, and keyboard activation is supported. Popovers are constrained to the viewport.

Replies reference a root comment in the same project, asset and exact version, inheriting its location. The API rejects invalid coordinates, cross-version/project replies and separate anchors on replies. A new file version has its own markers; no automatic transfer or text tracking across changed artwork is claimed.

New events store team/client context alongside account/declared identity. Legacy events retain their body, actor and identity with no invented anchor or inferred party. The additive event-column migration preserves original files and decision history.

## Version history

Every piece belongs to one project. Each numbered version contains 1–20 immutable original images in an ordered carousel. A new version starts in review and never inherits approval. Comments and decisions reference a specific version. Writes to a superseded version are rejected as stale. Resolving a comment is not approval. A change request needs an explanation. An approved version remains an approved historical version; only a currently approved version offers the delivery download control. A new version does not erase earlier images, comments or approvals.

Approval is terminal for the entire version, covering every image. The server rejects repeated approval, further change requests, comments, replies and image reordering after approval. Editors can upload a new version to start another review. This first version uses one final reviewer action rather than unanimity across multiple reviewers. Conflicting stale actions are detected with an expected revision counter; no silent overwrite of a newer decision. Reordering increments that revision too, so a decision based on an older order must refresh.

## Carousel and event identifiers — 2026-11-05

Upload accepts multiple files from a chooser or a drop area. The pending queue and current unapproved carousel can be ordered with drag and drop; earlier/later buttons support keyboard and touch. Only administrators/project editors can reorder. An exact permutation of existing image IDs is required. Reordering never moves a pin to a different image: anchors and replies retain an immutable image ID. Sidebar annotation links select the associated slide.

Team marks use a pink square and pencil; client marks use a violet circle and conversation icon. Colors use the existing studio/review tokens. Activity badges distinguish comments/annotations/replies (`C001`…), change requests (`R001`…), approvals (`A001`…), uploads (`U001`…) and reorder events (`O001`…). These references are stable within a version and event category; version and delivery provide their scope. They are display references, not authorization credentials.

Schema 2 adds ordered version-image rows and event image IDs. Existing single-image versions become one-image carousels, retaining their IDs, original files, events and pin positions. Existing replies inherit their root's image ID. Versions remain independent; no automatic transfer of annotations between versions. Make a consistent full data-directory backup before updating. A newer unsupported schema is refused rather than downgraded.

## Links and identity

The approved-delivery download control is a workflow rule, not copy protection: review access already permits viewing and saving the original image through the preview. Approval does not prevent a reviewer from copying content they can see.

A link grants review of all pieces and their history in exactly one project, including subsequent versions. The creation UI states that scope. Secrets use random tokens stored hashed; the raw token is shown only when created, carried in a URL fragment, and submitted via an Authorization header. Guest names are declared names, not verified identities. A separate browser-local identity entry is not treated as a client account. Authenticated users retain their actual account identity even when following a guest link.

Revocation prevents new reads/writes/files through that link, while keeping previous events. It cannot remove files already downloaded or content already viewed. Revoke does not remove an independently granted client account. Links do not expose internal user lists, grants, other projects, or link administration. No self-registration or email delivery in this milestone; admins create optional client accounts and send links through their usual channel.

## Runtime and storage

Reference runtime: Node 24, its SQLite API, one HTTP process, local SQLite database and private upload directory. React/Vite frontend uses the same-origin API; the backend can serve the built application. Password hashes use scrypt; sessions use opaque hashed tokens and HttpOnly SameSite cookies. Origin checks cover mutations. Files are decoded as static PNG/JPEG/WebP, maximum 5,000,000 bytes and 24 megapixels each, 20 images and 25,000,000 original bytes per batch. Batch validation, total-original quota and metadata writes are atomic; failure removes only files written by that batch. Users cannot choose disk paths. Original uploaded bytes are retained rather than silently recompressed. Gallery/card thumbnails are authenticated derived WebP responses, not substituted originals; revocation applies to them too.

This is a working application reference environment, not a supported installer for multiple OSes. HTTPS/reverse-proxy setup, backups, recovery, release packaging and load testing remain distribution work. Existing design catalogue remains accessible separately from the product. English is the default, with pt-BR and dark/light controls preserved.

## Acceptance journey

Admin creates member and client accounts, creates a project and grants access. Member uploads V1 and creates a review link. Guest requests a change. Member uploads V2. Guest approves V2. A second session sees the result and downloads the approved file. Member revokes the link. The former visitor can no longer access it; authorized internal users still see the history. Restarting the server preserves accounts, files and events. Tests also attempt cross-project access and stale/revoked actions.
