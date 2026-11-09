# infrastructure

One Terraform root, `root` (shared, bootstrapped once, variables in `config/root`). How they are planned and applied is in `.github/AGENTS.md`. Reasoning for each rule is in the linked record under `docs/decisions/`.

## Cloud Infrastructure & Security Isolation

- Staging and prod are separate GCP projects (`<prefix>-stag`, `<prefix>-prod`), ([19](../docs/decisions/0019-one-gcp-project-per-environment.md)).

### Root Environment

- `infrastructure/root` owns the root project, both environment projects, every state bucket, every environment's frontend bucket, the WIF pool and provider, shared DNS, the baseline APIs and the GitHub Actions variables the workflows read. Its first apply is the only manual one (`make init` in `infrastructure/root`, with the GitHub and Cloudflare tokens passed as `TF_VAR_*`); everything after goes through CI ([19](../docs/decisions/0019-one-gcp-project-per-environment.md)).

### IAM & Authentication

- CI authenticates with Workload Identity Federation. No JSON keys, and roles are granted per project, never at org level ([20](../docs/decisions/0020-workload-identity-federation.md)).
- Workflows read the WIF provider, service account, project ids, region and site URLs from repository variables written by root; never hardcode them, and add a new one to `github_cicd.tf`'s `actions_variables` ([20](../docs/decisions/0020-workload-identity-federation.md)).
- The GitHub PAT lives in Secret Manager (`github_provider_token`), never in a GitHub secret ([20](../docs/decisions/0020-workload-identity-federation.md)).

### Artifact Stores

- Each environment has its own bucket (`<gcp-project-id>-frontend`), written once by the job that built the artifact and read only within that project ([21](../docs/decisions/0021-per-environment-artifact-stores.md)).
- Root creates them (`root/artifact_stores.tf`), because every merge writes to every environment's bucket. Anything a merge writes into every environment goes in root ([27](../docs/decisions/0027-artifact-stores-in-root.md)).
- Retention: delete frontend folders after `frontend_retention_days` ([22](../docs/decisions/0022-artifact-retention.md)).

### Cloudflare

- There is no custom domain yet: the sites are served at `https://edward-katie-wedding-<stag|prod>.pages.dev`. To add one, set `cloudflare_zone` and `frontend_hostnames` in `config/root/terraform.tfvars`.
