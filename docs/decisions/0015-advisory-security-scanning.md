# 15. Security scanning is advisory

## Context

Formatting, lint, types and tests say nothing about vulnerabilities or misconfiguration. GitHub's own offerings for this (code scanning with CodeQL, secret scanning and push protection) need a paid plan or a public repository, and the repository must work on GitHub Free.

## Decision

- `security.yaml` runs open-source CLIs as ordinary jobs, on every PR a change reaches ([6](0006-moon-gates-every-ci-job.md)), weekly on `main` (new advisories land without a commit) and on demand: `npm audit` for the frontend, `actionlint` and `zizmor` for workflows, `tflint` and `trivy config` for Terraform, and `gitleaks` over a PR's commits or `main`'s history.
- Scanning is advisory. Each tool's findings go to the job summary and a warning annotation, and never fail the run; none is a required check. `.github/scripts/advisory.sh` wraps each one: the tool's own "found something" exit code is a warning, while any other non-zero exit is a failure, so a scanner that cannot run is noticed rather than read as a clean result.
- Tools are installed with `go install <module>@<version>` (the runner's Go) or `pip` at a pinned version, so a new rule cannot turn the workflow red unannounced. Renovate keeps the pins current ([17](0017-self-hosted-renovate.md)).
- `infrastructure/env/.terraform.lock.hcl` is committed, with hashes for linux, macOS and Windows, so staging and prod are planned with the provider builds root already locks.

## Consequences

Findings are read in the job summary, not the Security tab, and nothing forces them to be fixed. Tightening a scanner into a gate is a deliberate change: add it to `settings.yml`'s required checks and drop its advisory wrapper.
