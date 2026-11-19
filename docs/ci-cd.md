# CI/CD

How a change gets from a pull request to production, and how to go back. Everything runs in GitHub Actions (`.github/workflows/`). The rules are in [`.github/AGENTS.md`](../.github/AGENTS.md); the reasoning is in [`decisions/`](decisions/README.md), linked below.

## The short version

1. A pull request runs checks and posts Terraform plans.
2. Merging to `main` deploys **staging** and opens or updates a **release PR**.
3. Merging the release PR deploys **production**, from the bundle staging already ran.
4. To go back to an earlier version, run **Promote Release** by hand with that version's tag.

Nothing is rebuilt for production, so a release and a rollback are the same operation on different tags ([9](decisions/0009-build-once-promote-by-sha.md)).

## Workflows

| Workflow | Runs when | What it does |
| --- | --- | --- |
| `pull-request.yaml` | a PR is opened or updated | Lint (including Markdown), tests, and Terraform plans for the environments the diff reaches. |
| `conventions.yaml` | a PR is opened or updated | Checks the PR title is a Conventional Commit. |
| `push-commit.yaml` | a push to `main`, except a release commit | Applies infrastructure, builds, deploys staging, smoke-tests, then opens or updates the release PR. |
| `push-release.yaml` | a push to `main` that changes the release files | Tags the release and calls `promote-release.yaml`. Leaves staging alone unless the bundle is missing. |
| `promote-release.yaml` | called by `push-release.yaml`, or run by hand | Deploys one release tag to production. |
| `apply-infrastructure-prod.yaml` | run by hand | Applies prod Terraform only, to backfill a new resource a merge depends on ([13](decisions/0013-manual-prod-infrastructure-apply.md)). |
| `security.yaml`, `renovate.yaml` | schedule and PRs | Advisory scanners (the secrets scan skips docs-only changes) and dependency PRs. |

Each workflow signs in to Google Cloud as its own identity, so a PR check can never touch production ([19](decisions/0019-plan-and-apply-identities.md)). moon decides which jobs a change needs and every other job gates on that, so an unrelated change skips them ([6](decisions/0006-moon-gates-every-ci-job.md)).

## Normal releases

### 1. Pull request

Title the PR as a Conventional Commit, such as `fix(frontend): keep the map readable on small screens`. The title becomes the commit on `main` and decides the next version ([11](decisions/0011-releases-from-release-please.md)). The checks are required to merge; the Terraform plan is posted as a comment and is the review of any infrastructure change.

### 2. Merge to `main`: staging

`push-commit.yaml` runs on every merge:

1. **Infrastructure** applies first (root, then staging), re-planned in the job.
2. The **frontend** is built only if the change affects it; otherwise the previous commit's bundle is published again under this commit. Either way it is deployed to staging, so the site shows this commit ([10](decisions/0010-build-only-what-changed.md)).
3. Every commit's frontend `dist/` is published by **commit SHA** to both staging's and prod's buckets, whether or not it changed. This is what makes promotion a deploy and not a build.
4. **Smoke** tests the live staging site. It is skipped when nothing deployable changed.
5. **release-please** opens or updates the release PR, and `plan-prod` posts the production plan on it.

### 3. Merge the release PR: production

The release PR holds the changelog and the version bump. Reading its prod plan is the review for what production will receive. Merging it makes a release commit that changes only `CHANGELOG.md` and `.github/.release-please-manifest.json` ([12](decisions/0012-release-commits-have-their-own-workflow.md)). That push runs `push-release.yaml`:

1. Checks that the previous commit's `push-commit.yaml` run succeeded (or `push-release.yaml`, if it was a release commit), so a release is only cut for a commit that was healthy on staging.
2. Publishes the previous commit's bundle under the release commit, in both buckets. It builds it only if it is missing. Staging is not redeployed, because it already runs the same code, unless a missing bundle has to be built.
3. release-please creates the tag (`vMAJOR.MINOR.PATCH`) and the GitHub release.
4. If a release was created, it calls `promote-release.yaml` with the tag and commit.

`promote-release.yaml` then runs, in order:

1. `terraform apply` on prod, planned in the job.
2. The frontend folder for that commit is fetched from prod's own bucket and deployed to Cloudflare Workers with `config.json` written for production.

Because promote is called from `push-release.yaml`, GitHub shows its jobs inside the **Push Release** run. The **Promote Release** runs list only shows manual runs.

## Manual rollbacks

Use this when a release is broken in production, or when an automatic promotion failed partway and needs finishing.

### Roll back

1. Find the last good release on the [Releases page](https://github.com/edgorman/wedding/releases). A release is created just before its promotion runs, so check that the version you pick was actually promoted (its Push Release run succeeded).
2. In GitHub, go to **Actions**, then **Promote Release**, then **Run workflow**. Run it from `main` and enter the tag, such as `v1.2.3`.
3. Watch the run. It resolves the tag to its commit and runs the same steps as a normal release, but for that commit: that release's infrastructure and its frontend folder.
4. Check the production site.

It takes a couple of minutes because nothing is built. Runs queue on prod's Terraform state, so two promotions never overlap.

### Finish a failed promotion

If a release's automatic promotion failed partway, for example on a flaky step, run **Promote Release** again with the same tag. Every step can be repeated.

### Things to know

- **`main` still has the bad code.** A rollback changes production only. Fix forward or revert on `main` and let a new release go out, or the next release will redeploy the problem. Staging is unaffected and keeps running `main`.
- **Infrastructure rolls back too.** Step 1 applies the old tag's Terraform to prod, so a resource added since will be planned for removal. Read the plan in the run if the releases differ in infrastructure.
- **The bundle must still exist.** Frontend folders in the bucket are deleted after 90 days ([21](decisions/0021-artifact-retention.md)). A recent release is safe; a very old tag may no longer have a frontend folder.
- **Only tags of the form `vMAJOR.MINOR.PATCH` are accepted**, and the workflow fails early if the tag has no commit.

### When not to use it

A normal release never needs a manual run. For a change that only needs a new Terraform resource in prod before a merge, use `apply-infrastructure-prod.yaml` instead, and say so in the PR ([13](decisions/0013-manual-prod-infrastructure-apply.md)).
