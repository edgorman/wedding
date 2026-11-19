# .github

Workflows, composite actions, repository settings and the moon setup CI runs through. What to do when a PR's checks fail is the `steward` skill (`.claude/skills/steward/SKILL.md`). Reasoning for each rule is in the linked record under `docs/decisions/`; the whole path from a PR to production, and how to roll back, is in [`docs/ci-cd.md`](../docs/ci-cd.md).

## CI/CD, Branching, & Release Lifecycle

- Everything builds, tests and deploys through GitHub Actions; infrastructure applies before the site updates.
- Every job that needs GCP or Cloudflare is skipped while `vars.WORKLOAD_IDENTITY_PROVIDER` is empty (the infrastructure jobs, `push-commit.yaml`'s and `push-release.yaml`'s first jobs, and `promote-release.yaml`'s `target` job carry the `if:`, and everything else needs them), so a freshly created repository runs only PR checks until its root bootstrap ([19](../docs/decisions/0019-plan-and-apply-identities.md)).
- Every pipeline has an environment-scoped concurrency group.
- Shared steps live in composite actions under `.github/actions/`.
- A job signs in to Google Cloud once (`google-github-actions/auth`; the runner's own `gcloud` uses its credentials); composite actions never sign in themselves and use the job's credentials. Secrets are read with `google-github-actions/get-secretmanager-secrets`.
- Every apply plans and applies in its own job, from the commit it runs for; nothing reads a plan another job wrote. The PR comment is the reviewed reference, and each apply shows its plan in the job summary ([14](../docs/decisions/0014-replan-at-apply.md)).
- Each workflow authenticates as its own identity: PR checks as `PLAN_`, `push-commit.yaml` and `push-release.yaml` as `DEPLOY_`, promotion and the manual prod apply as `PROMOTE_`, Renovate as `RENOVATE_SERVICE_ACCOUNT`. A PR's plan job gets placeholder tokens and `-refresh=false`, never a secret; a workflow that needs another identity calls a reusable workflow ([19](../docs/decisions/0019-plan-and-apply-identities.md)).

### Building with moon

- Every folder under `services/` needs a `moon.yml`; `root:projects-covered` fails otherwise ([4](../docs/decisions/0004-hand-declared-moon-graph.md)).
- Declare `dependsOn` by hand. Affected detection is changed files only, so a task that must react to another project lists it in `inputs` (`project://...`) ([4](../docs/decisions/0004-hand-declared-moon-graph.md)).
- Keep `moon ci`'s targets split one-to-one with the required jobs (`lint-check`, `test`; `pr-title` in `conventions.yaml`) ([4](../docs/decisions/0004-hand-declared-moon-graph.md)).
- moon decides which jobs run: each workflow's `changed` job runs `moon query affected` (moon only, `auto-install: false`) and every other job gates on its outputs. A new job needs a marker task with `inputs` and an output in `changed`, or it runs on every change. `lint-check` and `test` are separate jobs, not a matrix, so a skip reports as skipped instead of an unexpanded name. Only `required` (the last job of `pull-request.yaml`, which waits for them all and fails if one that ran failed) and `pr-title` are required checks, so a PR that skips most jobs, such as a release PR, still has an accurate list ([6](../docs/decisions/0006-moon-gates-every-ci-job.md)).
- `deploy-{root,staging,prod}:plan` (pull requests) and `deploy-{root,staging}:apply` (merges) are `noop` markers whose `inputs` decide which environments a diff reaches. List only the workflow and actions that marker's own job uses, so a PR plan ignores `push-commit.yaml` and a merge apply ignores `pull-request.yaml`, and never set `runInCI: false` on one (nor on any `publish` or `scan*` marker): moon then never reports it affected in CI, which hides it from `moon query affected` ([5](../docs/decisions/0005-deploy-markers.md)).
- Pin tool versions only in `.prototools`; keep its `terraform` pin and every `required_version` in step ([7](../docs/decisions/0007-prototools-pins-the-toolchain.md)).
- The toolchain cache is off in every `setup-toolchain` step, which the `setup-moon` action sets once ([8](../docs/decisions/0008-toolchain-cache-is-off.md)). No remote cache ([3](../docs/decisions/0003-moon-runs-the-build.md)).

### Security scanning

- `security.yaml` is advisory: its scanners report in the job summary and never fail a run or gate a merge, and none is a required check. Run each through `.github/scripts/advisory.sh` so a scanner that can't run still fails, and pin its version ([15](../docs/decisions/0015-advisory-security-scanning.md)).
- Each scanner has a moon marker task (`scan`, `scan-workflows`, `scan-secrets`) and a `changed` job skips the ones a pull request doesn't reach. `scan-secrets` ignores `docs/` and Markdown ([16](../docs/decisions/0016-skip-secrets-scan-on-docs-lint-markdown.md)); the weekly and manual runs scan everything ([6](../docs/decisions/0006-moon-gates-every-ci-job.md)).

### Dependency updates

- Renovate (`renovate.yaml`, `.github/renovate.json5`) opens one grouped PR per area, weekly, with the `github_provider_token` PAT; Dependabot alerts stay on, its version updates are off. A pin Renovate wouldn't see carries a `# renovate: datasource=... depName=...` comment on the line above; a version repeated across files is read from `.prototools` instead of copied ([17](../docs/decisions/0017-self-hosted-renovate.md)).

### Versioning

- release-please computes versions from Conventional Commit subjects and opens the release PR; tags are plain `vMAJOR.MINOR.PATCH`, and `build:`, `chore:`, `ci:`, `docs:` and `refactor:` call for a patch release too, so dependency bumps reach prod; `style:` and `test:` alone do not. Its config and manifest live in `.github/`, and `CHANGELOG.md` at the root is its output ([11](../docs/decisions/0011-releases-from-release-please.md)).

### Staging Deployments

- Every merge publishes the frontend `dist/` by commit SHA to both staging's and prod's buckets ([9](../docs/decisions/0009-build-once-promote-by-sha.md)). The frontend is built only when its `publish` marker is affected; otherwise the previous commit's (or the last release's) folder is published again. List every action and workflow the build uses in the marker ([10](../docs/decisions/0010-build-only-what-changed.md)).
- `push-commit.yaml` diffs against the previous commit when its run succeeded, else the last release tag. The `frontend` job (the `frontend-staging` action) deploys it to staging, and `smoke` is skipped when nothing deployable changed ([6](../docs/decisions/0006-moon-gates-every-ci-job.md)).
- The frontend bundle carries nothing environment-specific; `config.json` is written at deploy time ([9](../docs/decisions/0009-build-once-promote-by-sha.md)).
- Staging shows the short commit SHA; only production shows a release tag ([11](../docs/decisions/0011-releases-from-release-please.md)).

### Release PR

- A push to main runs one of two workflows by path: `push-release.yaml` when it changes `CHANGELOG.md` or `.github/.release-please-manifest.json` (the release commit), else `push-commit.yaml` (`paths-ignore` on those). A release commit publishes the previous commit's bundle under its own SHA, tags the release and promotes; it does not deploy to staging unless the bundle is missing and has to be built. A new workflow that signs in as `DEPLOY_` needs its filename in `github_cicd.tf`'s `github_deploy_wif` ([12](../docs/decisions/0012-release-commits-have-their-own-workflow.md)).
- `push-release.yaml` first checks that the previous commit's `push-commit.yaml` (or `push-release.yaml`) run succeeded, and stops before tagging if not ([12](../docs/decisions/0012-release-commits-have-their-own-workflow.md)).
- `release-please` in `push-commit.yaml` runs on every non-release merge and checks each direct need for `success` (`frontend` and `smoke`, which may be skipped), never a bare `needs:`; a new job a release depends on goes in both its `needs` and its `if:` ([11](../docs/decisions/0011-releases-from-release-please.md)).
- It runs with the `github_provider_token` PAT, because a PR opened with `GITHUB_TOKEN` would not trigger the PR checks ([11](../docs/decisions/0011-releases-from-release-please.md)).
- `plan-prod` posts the prod plan, run with `-lock=false`, on the open release PR.

### Production Releases

- Merging the release PR promotes it: `push-release.yaml`'s `release-please` tags the release and `promote` calls `promote-release.yaml`, which applies prod Terraform, then deploys the frontend by commit SHA from prod's own bucket. Never rebuild for production, and never copy between projects ([9](../docs/decisions/0009-build-once-promote-by-sha.md)).
- Rollback is `promote-release.yaml` run by hand (`workflow_dispatch`) with an earlier release tag; so is finishing a promotion whose deploy failed ([11](../docs/decisions/0011-releases-from-release-please.md)).
- `apply-infrastructure-prod.yaml` is only for backfilling a new per-environment resource a merge depends on; say so in that PR ([13](../docs/decisions/0013-manual-prod-infrastructure-apply.md)).
