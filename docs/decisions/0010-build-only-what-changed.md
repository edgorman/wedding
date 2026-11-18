# 10. Build only what changed, reuse the rest

## Context

Building the frontend on every merge costs minutes of CI for a merge that never touched it.

## Decision

- `services/frontend:publish` is a `noop` marker like the deploy markers ([5](0005-deploy-markers.md)): its `inputs` are the build's inputs plus the actions that build it. `push-commit.yaml`'s `changed` job reads them from the same `moon query affected` it runs for Terraform ([6](0006-moon-gates-every-ci-job.md)), against the previous successful run's commit or else the newest `v*` tag, and outputs that commit as `base_sha`.
- An affected frontend builds. An unaffected one is `base_sha`'s folder fetched from staging's bucket and published again under this commit, then deployed, so the site always shows the current version. It falls back to building when `base_sha`'s folder is missing (past retention).
- So every commit still has its bundle by SHA in both projects, the publish job succeeds on every merge, and promotion is unchanged ([9](0009-build-once-promote-by-sha.md)). The frontend always deploys on promotion, for its version.

## Consequences

moon only sees files: a change to a repository variable the build reads does not rebuild it. The marker's `inputs` must list every action and workflow the build uses, or an incomplete list under-builds silently.
