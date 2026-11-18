# infrastructure

Terraform roots: `env` (applied per environment from `config/staging` and `config/prod`) and `root` (shared, bootstrapped once). How they are planned and applied is in `.github/AGENTS.md`. Reasoning for each rule is in the linked record under `docs/decisions/`.

## Cloud Infrastructure & Security Isolation

- Staging and prod are separate GCP projects (`<prefix>-stag`, `<prefix>-prod`), and every resource carries its environment suffix ([18](../docs/decisions/0018-one-gcp-project-per-environment.md)).

### Root Environment

- `infrastructure/root` owns the root project, both environment projects, every state bucket, the WIF pool and provider, the Cloudflare Workers and their domains, the baseline APIs and the GitHub Actions variables the workflows read. Its first apply is the only manual one (below); everything after goes through CI ([18](../docs/decisions/0018-one-gcp-project-per-environment.md)).
- The first apply is `make init` in `infrastructure/root`, with `gcloud auth application-default login` done and the root project created by hand and linked to billing: `TF_VAR_github_provider_token=<PAT> TF_VAR_cloudflare_api_token=<TOKEN> make init`. It moves its own state into the bucket it made. Until it has written the repository variables, every job that needs GCP or Cloudflare skips itself, so a new repository runs only the PR checks.
- The GitHub PAT is a fine-grained token scoped to this repository, with read and write on Variables, Contents, Pull requests, Workflows, Issues and Commit statuses: Terraform writes the variables, release-please and Renovate push branches, open PRs and keep their dashboard. To rotate it, add a new version of the `github_provider_token` secret; workflows read `latest`.
- The Cloudflare token has **Account: Workers Scripts: Edit** and, for the zone, **Workers Routes: Edit**, **DNS: Edit** and **Zone: Read**. The account id is not a secret and is set in `config/root/terraform.tfvars`.

### IAM & Authentication

- CI authenticates with Workload Identity Federation. No JSON keys, and roles are granted per project, never at org level ([19](../docs/decisions/0019-plan-and-apply-identities.md)).
- Four identities, none holding more than its job needs: `github-plan` (read-only, any run in the repository, used by the PR checks), `github-deploy` (`push-commit.yaml` and `push-release.yaml` on `main`), `github-promote` (`promote-release.yaml` and `apply-infrastructure-prod.yaml` on `main`, prod only) and `github-renovate` (`renovate.yaml` on `main`, the PAT secret only). A workflow picks its identity from `PLAN_`, `DEPLOY_`, `PROMOTE_` or `RENOVATE_SERVICE_ACCOUNT`, and a new workflow that needs an apply identity is added to its `workloadIdentityUser` binding in `github_cicd.tf` ([19](../docs/decisions/0019-plan-and-apply-identities.md)).
- Nothing the plan identity can read may be a credential: PR plans use placeholder tokens and `-refresh=false`, and the plan identity has no Secret Manager access ([19](../docs/decisions/0019-plan-and-apply-identities.md)).
- Workflows read the WIF provider, service accounts, project ids, region and site URLs from repository variables written by root; never hardcode them, and add a new one to `github_cicd.tf`'s `actions_variables` ([19](../docs/decisions/0019-plan-and-apply-identities.md)).
- The GitHub PAT and the Cloudflare token live in Secret Manager (`github_provider_token`, `cloudflare_api_token`), never in a GitHub secret, and are readable only by the identities that need them ([19](../docs/decisions/0019-plan-and-apply-identities.md)).

### Environments

- `infrastructure/env` is applied once per environment: staging on every merge, prod on promotion. Today it holds only the frontend bucket; anything else an environment needs goes here, never in root ([20](../docs/decisions/0020-frontend-bucket-lives-in-env-terraform.md)).
- `apply-infrastructure-prod.yaml` is only for backfilling a new per-environment resource a merge depends on; say so in that PR ([13](../docs/decisions/0013-manual-prod-infrastructure-apply.md)).

### Artifact Stores

- Each environment has its own bucket (`<gcp-project-id>-frontend`), written by the job that built the bundle and read only within that project ([20](../docs/decisions/0020-frontend-bucket-lives-in-env-terraform.md)).
- Env creates it (`env/storage.tf`). Anything a merge writes into prod's bucket must already exist there, or `apply-infrastructure-prod.yaml` must be run first ([20](../docs/decisions/0020-frontend-bucket-lives-in-env-terraform.md)).
- Retention: delete frontend folders after `frontend_retention_days` ([21](../docs/decisions/0021-artifact-retention.md)).

### Cloudflare

- Each environment is a Worker named `<prefix>-<env>`, created by `root/cloudflare_workers.tf`; `wrangler deploy` only uploads versions of it ([2](../docs/decisions/0002-a-static-site-with-no-backend.md)).
- Custom domain: staging is `https://dev.katieanded.com` and prod is `https://katieanded.com`, set via `cloudflare_zone` and `frontend_hostnames` in `config/root/terraform.tfvars`; each domain creates its own DNS record, and the `workers.dev` addresses still work.
