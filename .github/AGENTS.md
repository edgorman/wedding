# .github

Workflows, composite actions, repository settings and the moon setup CI runs through. What to do when a PR's checks fail is the `steward` skill (`.claude/skills/steward/SKILL.md`). Reasoning for each rule is in the linked record under `docs/decisions/`.

## CI/CD, Branching, & Release Lifecycle

- Everything builds, tests and deploys through GitHub Actions; infrastructure applies before the site is deployed.
- Every job that needs GCP or Cloudflare is skipped while `vars.WORKLOAD_IDENTITY_PROVIDER` is empty (the `changed` jobs and `promote-release.yaml`'s first job carry the `if:`, and everything else needs them), so a freshly created repository runs only PR checks until its root bootstrap ([20](../docs/decisions/0020-workload-identity-federation.md)).
- Every pipeline has an environment-scoped concurrency group.
- Shared steps live in composite actions under `.github/actions/`.
- Applies run the saved plan for their tree from `plans/root/` in the state bucket, falling back to planning on the spot when it is missing or stale. Pass `plan_dir` to both Terraform actions; never save a plan as a workflow artifact ([25](../docs/decisions/0025-apply-saved-plans.md)).

### Building with moon

- Every folder under `services/` needs a `moon.yml`; `root:projects-covered` fails otherwise ([12](../docs/decisions/0012-hand-declared-moon-graph.md)).
- Declare `dependsOn` by hand. Affected detection is changed files only, so a task that must react to another project lists it in `inputs` (`project://...`) ([12](../docs/decisions/0012-hand-declared-moon-graph.md)).
- Keep `moon ci`'s targets split one-to-one with the required jobs (`lint-check`, `test`; `pr-title` in `conventions.yaml`) ([12](../docs/decisions/0012-hand-declared-moon-graph.md)).
- `deploy-{root,staging,prod}:plan` are `noop` markers whose `inputs` decide which environments a diff reaches. List every workflow and action an environment uses in its marker, and never set `runInCI: false` on one ([13](../docs/decisions/0013-deploy-markers.md)).
- Pin tool versions only in `.prototools` ([14](../docs/decisions/0014-prototools-pins-the-toolchain.md)).
- No remote cache ([11](../docs/decisions/0011-moon-not-pants.md)).

### Versioning

- Versions are computed from Conventional Commit subjects; tags are plain `major.minor.patch`, with pre-release as GitHub's flag ([18](../docs/decisions/0018-versions-from-conventional-commits.md)).

### Staging Deployments

- Every merge publishes the frontend `dist/` by commit SHA to both staging's and prod's buckets ([15](../docs/decisions/0015-build-once-promote-by-sha.md)). It is rebuilt only when the `services/frontend:publish` marker is affected; otherwise the last release's folder is re-published. List every action and workflow the build uses in the marker ([26](../docs/decisions/0026-build-only-what-changed.md)).
- The bundle carries nothing environment-specific.

### Pre-Release Generation

- `pre-release` runs on every merge, checks each direct need for `success` (`services-frontend`, `smoke`, `version`), and takes its tag from `version` ([16](../docs/decisions/0016-pre-release-gates.md)).
- The prod plan in a pre-release runs with `-lock=false` ([16](../docs/decisions/0016-pre-release-gates.md)).

### Production Releases

- Promotion applies prod Terraform, then deploys the frontend by commit SHA from prod's own bucket. Never rebuild for production, and never copy between projects ([15](../docs/decisions/0015-build-once-promote-by-sha.md)).
- Rollback is promoting an earlier release tag ([15](../docs/decisions/0015-build-once-promote-by-sha.md)).
- `apply-infrastructure-prod.yaml` is only for backfilling a new per-environment resource a merge depends on; say so in that PR ([17](../docs/decisions/0017-manual-prod-infrastructure-apply.md)).
