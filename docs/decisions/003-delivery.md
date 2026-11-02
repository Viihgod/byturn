# Delivery, tests and releases

Status: initial workflow requested by the owner; no production environment exists yet.

## Branches

Use short-lived feature/fix branches, reviewed integration into develop, and small validated release batches from develop into main. Main remains the stable release line. Do not force-push shared branches. Integrate a main hotfix back into develop before the next release.

This adds release separation, not cheaper tests by itself. For a solo project, direct short-lived PRs into main are simpler; keep develop while batch releases are useful, and avoid long-lived feature branches.

## One validation command

`npm run check` runs lint, behavior/integration tests with coverage thresholds, then type-check/build. CI executes the same command. `npm ci` installs the tracked hooks using the prepare script. On first adopting this workflow in an existing clone, run `npm run prepare`.

The pre-push hook requires a clean worktree and validates the checked-out commit being pushed, including an annotated tag's target. Push one checked-out revision at a time. The pre-merge-commit hook validates local non-fast-forward merges. Hooks can be skipped, are clone-local and do not protect merges performed in GitHub's web UI. No hosted runner is required for local checks.

`.checks/latest.json` and `coverage/` are local, ignored outputs. The check report records the starting HEAD, time and each step result; during a pending release merge, HEAD is the previous commit, so this report alone is not proof for the eventual release SHA. Include the actual final commit SHA and validation result in a PR/release record. Re-run after changes.

Coverage thresholds are statements/lines/functions 85%, branches 80%, across included application TS/TSX. Entry bootstrap and test files are excluded. Coverage is a regression signal, not proof of correctness. Current tests cover component behavior, translation completeness and the foundation preview. Real browser layout, backend permissions, storage, concurrent review decisions and end-to-end multi-user journeys need separate checks as those features arrive.

## Release batches

1. Fetch and synchronize local main/develop with their remote branches. Review the batch diff and changelog; develop must contain main.
2. On clean main, run `npm run release -- minor` (or patch/major). The script merges develop with no fast-forward, updates package and lockfile versions, validates the merged tree, creates a release merge commit and annotated `vX.Y.Z` tag. It does not push or deploy.
3. If validation fails, no release commit/tag is created; inspect/fix the pending merge and validate it, or use `git merge --abort`. Do not publish failed checks. The script may leave version changes in the pending merge.
4. Review and push the exact checked-out main revision and its annotated tag: `git push --atomic origin main --follow-tags`. The pre-push hook validates again.
5. Synchronize main back into develop using a normal merge and validate it. Do not create another release version for that synchronization.

Use SemVer for each release into main, not for each feature merge into develop. While pre-1.0, minor is a product milestone and patch a compatible fix; explicitly document breaking changes. Tagged releases are immutable.

## If hosted CI cannot run

Use the same local check on the exact revision, retain the report and final SHA, and perform a reviewed local merge/release. Do not report local results as a successful GitHub status check, and do not automatically bypass required checks. If server-side branch protection requires unavailable Actions checks, the merge remains blocked until that policy is deliberately changed or the check can run.

GitHub Free supports protected branches on public repositories, not private ones. Verify the account plan and repository visibility before claiming server-side enforcement. Public repositories on standard GitHub-hosted runners do not consume the private-repository included compute allowance. Artifacts, cache and larger runners have separate billing considerations.

Sources: https://docs.github.com/en/billing/concepts/product-billing/github-actions and https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
