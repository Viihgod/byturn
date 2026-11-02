# Delivery, tests and releases

Status: simplified by the owner on 2026-11-02. Use short-lived feature/fix branches directly into main. No develop stage is required while the project is small; revisit it only if release coordination justifies the extra branch. Do not force-push shared branches.

## One validation command

`npm run check` runs lint, behavior/integration tests with coverage thresholds, delivery-tooling tests, then type-check/build. CI executes the same command on main and PRs targeting main. `npm ci` installs the tracked hooks through prepare; existing clones can run `npm run prepare`.

The pre-push hook requires a clean worktree and validates the checked-out commit being pushed, including an annotated tag's target. Push one checked-out revision at a time. The pre-merge-commit hook validates local non-fast-forward merges. Hooks can be skipped, are clone-local and do not protect merges performed in GitHub's web UI. No hosted runner is required for local checks.

`.checks/latest.json` and `coverage/` are local ignored outputs. The report records the starting HEAD, time and each step result. During release preparation, HEAD is the previous commit, so this report alone is not proof for the eventual release SHA. Record the final commit SHA and validation result in a PR/release record. Re-run after changes.

Coverage thresholds are statements/lines/functions 85%, branches 80%, across included application TS/TSX. Entry bootstrap and test files are excluded. Coverage is a regression signal, not proof of correctness. Tests cover the current foundation and delivery tools. Real browser layout, backend permissions, storage, concurrent review decisions and end-to-end multi-user journeys need separate checks as those features arrive.

## Releases from main

1. Fetch and synchronize main with the remote. Review the intended changes and release notes.
2. On clean main, run `npm run release -- minor` (or patch/major). The script updates package/lockfile versions, validates the working tree, creates a release commit and annotated vX.Y.Z tag. It does not merge another branch, push or deploy.
3. If validation fails, no release commit/tag is created. Inspect the version changes, fix the failure and validate before publishing. Do not tag failed checks.
4. Review and push the exact checked-out main revision and its annotated tag: `git push --atomic origin main --follow-tags`. The pre-push hook validates again. If server-side branch rules require PRs/checks, follow those rules rather than bypassing them; release preparation may need a dedicated PR.

Use SemVer for deliberate releases, not every feature merge. While pre-1.0, minor is a product milestone and patch a compatible fix; explicitly document breaking changes. Tagged releases are immutable. There is no automatic production deployment yet.

## If hosted CI cannot run

Use the same local check on the exact revision, retain the report and final SHA, and perform a reviewed local merge/release. Do not report local results as successful GitHub status checks. If server-side branch protection requires unavailable Actions checks, merging remains blocked until that policy is deliberately changed or the check can run.

GitHub Free supports protected branches on public repositories, not private ones. Verify account plan and visibility before claiming server-side enforcement. Public repositories on standard GitHub-hosted runners do not consume the private-repository included compute allowance. Artifacts, cache and larger runners have separate billing considerations.

Sources: https://docs.github.com/en/billing/concepts/product-billing/github-actions and https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
