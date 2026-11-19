# 6. moon decides which CI jobs run

## Context

moon already chooses what the Terraform plans and applies and the bundle build reach, through `moon query affected`. A job that starts a runner and a full toolchain when `moon ci` has nothing to run, or runs a scanner over files it cannot read, is wasted time. A release PR, which changes only generated files, should run almost nothing.

## Decision

- Every job whose work depends on files has a moon task that lists those files as `inputs`: the `deploy-*:plan`, `deploy-*:apply` and `*:publish` markers ([5](0005-deploy-markers.md)), plus `scan`, `scan-workflows` and `scan-secrets` for the scanners. A marker is a `noop` task with `cache: false` and the default `runInCI`.
- Each workflow's first job, `changed`, runs `moon query affected` once through the `moon-affected` action and outputs which jobs have work. Every other job gates on those outputs with `if:`. `changed` installs only moon (`auto-install: false` on `moonrepo/setup-toolchain`) and runs the query with `MOON_TOOLCHAIN_FORCE_GLOBALS`, and `MOON_SKIP_SETUP_TOOLCHAIN`, so moon does not install the pinned tools. Jobs that run tasks install the toolchain.
- The `moon ci` legs are separate jobs named `lint-check` and `test`, not a matrix. A job skipped by `if:` reports `skipped`, which branch protection counts as passing, and a skipped matrix leg would report an unexpanded name and stay pending. Branch protection requires one job, `required`, which waits for them all and fails only if one that ran failed, plus `pr-title`; naming the skippable jobs would list them as required on a release PR.
- A merge diffs against the last commit its workflow fully processed ([10](0010-build-only-what-changed.md)): the previous commit when its own `push-commit.yaml` run succeeded, otherwise the newest release tag. A cancelled or failed run is never a base, so its work is redone. `smoke` is skipped when nothing deployable changed.
- release-please's generated files (`CHANGELOG.md`, `.github/.release-please-manifest.json`) are inputs to no marker, so a release PR affects nothing and its jobs are skipped.
- Schedule and manual runs have no diff, so `security.yaml` runs every scanner on them.

## Consequences

Adding a job means adding its marker and its `changed` output, or it runs on every change. moon sees only files: a repository variable, an event type or a changed secret still needs an `if:` of its own. `changed` runs on every PR and merge and costs a few seconds.
