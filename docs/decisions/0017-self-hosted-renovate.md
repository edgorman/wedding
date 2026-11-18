# 17. Dependency updates come from self-hosted Renovate

## Context

Dependabot's version updates cover GitHub Actions, Terraform providers and npm, but not the pins outside those formats: `.prototools`, the Terraform version repeated across files, the tools CI installs with `go install` or `pip`, and wrangler. They drift or are synced by hand.

## Decision

- Renovate runs from `renovate.yaml`, a scheduled (weekly) and manually dispatchable workflow in the repository itself, not the hosted Mend app, so the repository needs nothing outside its own files and the PAT it already has. Its config is `.github/renovate.json5`. Dependabot alerts and security updates stay on; its version updates are not configured.
- It runs with the `github_provider_token` PAT, so its PRs trigger the PR checks (one opened with `GITHUB_TOKEN` would not), as the `github-renovate` identity, which can read that one secret and nothing else, because the job runs a third-party action ([19](0019-plan-and-apply-identities.md)).
- One grouped PR per area, so a run opens at most three: `frontend-deps` (npm in `services/frontend`), `infrastructure-deps` (Terraform providers and version) and `ci-deps` (GitHub Actions and the `# renovate:` pins). PRs are titled `build(deps): ...` so the `pr-title` check passes. A pin that lives in several files moves in one PR: the Terraform version.
- A hand-written pin Renovate would not otherwise see carries a `# renovate: datasource=... depName=...` comment on the line above, which one regex manager reads: `.prototools`, the tools installed in `security.yaml`, `markdownlint-cli2` in `moon.yml`, wrangler, and the proto version in the session hook.
- Where a version would otherwise be repeated, one source is read instead: the Terraform actions and the session hook read `.prototools`, and the hook checks the download against the release's own `SHA256SUMS`.

## Consequences

- The PAT needs Contents, Pull requests, Workflows, Issues and Commit statuses read/write as well as Variables ([11](0011-releases-from-release-please.md)), so one token holds Contents and Workflows write. Only the deploy and renovate identities can read it. On a free private repository with no branch protection, that token could also push to `main`; Renovate itself only pushes branches.
- GitHub pauses a scheduled workflow after 60 days without repository activity; running Renovate by hand restarts it.
