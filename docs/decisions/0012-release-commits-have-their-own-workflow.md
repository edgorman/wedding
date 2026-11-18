# 12. Release commits have their own workflow

## Context

A push to `main` is one of two kinds: a release-please release commit (the merge of its release PR, which changes only `CHANGELOG.md` and `.github/.release-please-manifest.json`), or anything else. Handling both in one workflow would apply infrastructure, re-publish the bundle and redeploy an unchanged staging only to reach `release-please` and `promote`.

## Decision

GitHub path filters pick the workflow; moon is not involved.

- **`push-commit.yaml`** runs on every push except one that changes only those two files (`paths-ignore`). It applies, builds, deploys staging, smoke-tests, and runs `release-please` to open or update the release PR, then `plan-prod`. It never tags a release.
- **`push-release.yaml`** runs when a push changes either of those two files. It publishes the previous commit's (`github.event.before`) bundle under the release commit, building it if it is missing, then runs `release-please` to tag and release, then `promote`. It does not touch staging, which already runs the same code. It has its own concurrency group so a later push can't supersede a waiting release.
- A push that changes both kinds of file runs both; `push-commit.yaml`'s `changed` job still diffs against the previous successful run or last release tag, so it is unaffected by a release commit having no run of its own.
- The deploy identity is bound to both filenames in `github_cicd.tf` ([19](0019-plan-and-apply-identities.md)), so root's apply must have run from `push-commit.yaml` before the first release commit.
- No required status check comes from either workflow (they run after merge), so a skipped one blocks nothing.
- A `previous-commit` job runs first and fails the workflow unless the previous commit's `push-commit.yaml` (or, for a release commit, `push-release.yaml`) run succeeded, so a release is only cut for a commit that was healthy on staging ([11](0011-releases-from-release-please.md)).

## Consequences

A release commit costs one short run. Adding a file release-please owns means adding it to both the `paths-ignore` list and the `push-release.yaml` trigger.
