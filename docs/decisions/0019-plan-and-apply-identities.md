# 19. Plan and apply authenticate as separate identities

## Context

JSON service-account keys are long-lived secrets, and one service account with `roles/editor`, IAM admin and more on every project, behind a Workload Identity provider that admits any token from the repository, would let any run on any branch and event act as an IAM admin on prod, including a `pull_request` plan job running whatever workflow the PR branch carries. Review protects `main`; it does not protect the credentials. GitHub Environments would gate this, but their rules are unavailable on a private repository on GitHub Free, so the split is enforced on the Google side from claims in the OIDC token, which every plan issues.

## Decision

- Workflows authenticate over short-lived OIDC tokens through Workload Identity Federation, with no JSON keys. **Four identities** live in root, with roles granted per project, never at org level:
  - `github-plan`: `roles/viewer` and `roles/iam.securityReviewer` on every project, and nothing writable. Any run in this repository can assume it, which is what the PR checks use.
  - `github-deploy`: the apply roles on every project, for `push-commit.yaml` and `push-release.yaml` as they exist on `main`: root and staging applies, builds, staging deploys, and reading the tokens release-please and Cloudflare need.
  - `github-promote`: the apply roles on prod only, plus prod's state bucket and the Cloudflare token, for `promote-release.yaml` and `apply-infrastructure-prod.yaml` as they exist on `main`.
  - `github-renovate`: the GitHub PAT secret and nothing else, for `renovate.yaml` as it exists on `main`. It runs a third-party action, so it is not given an apply identity ([17](0017-self-hosted-renovate.md)).
- **Binding.** The provider maps `attribute.job_workflow_ref` and the apply identities are bound to `<repo>/.github/workflows/<file>@refs/heads/main`. A pull request's runs carry `refs/pull/<n>/merge`, so a workflow edited on a PR branch cannot assume them. The provider's attribute condition admits only this repository.
- **No secrets for a PR.** A pull request's workflow runs with the plan identity, so nothing it can read may be a credential. PR plans are `-refresh=false` against placeholder tokens, so no provider calls GitHub or Cloudflare, and the plan identity has no Secret Manager access. A PR plan is therefore the configuration against the last applied state, not a refresh; each apply refreshes. The Cloudflare account id is not a secret and is set in `terraform.tfvars` and the `CLOUDFLARE_ACCOUNT_ID` variable. The `secret_data` of the stored tokens is ignored by Terraform, so the placeholders never show as a change; rotating one means adding a Secret Manager version, which workflows read as `latest`.
- The root apply writes the provider path, the four service account emails, project ids, region and site URLs into GitHub Actions variables (`PLAN_`, `DEPLOY_`, `PROMOTE_` and `RENOVATE_SERVICE_ACCOUNT`), so workflows never hardcode them. Until that first apply, the variables are empty and the deploy jobs skip.
- The GitHub PAT, which WIF can't replace, is supplied by hand once at bootstrap and read back from the `github_provider_token` secret by deploy and renovate only, never stored as a GitHub secret.

## Consequences

- No stored cloud credentials in GitHub.
- Prod's deploy credentials are only obtainable by the promotion workflows as they exist on `main`.
- Root owns IAM for every project, so the deploy identity can change IAM on prod too: the split keeps prod's credentials from everything but `main`'s workflows, not from a change merged to `main`. On a repository without branch protection (a free private one), anything that can push to `main` can change those workflows.
- A workflow that needs an identity other than its own must call a reusable workflow, whose `job_workflow_ref` is its own file.
