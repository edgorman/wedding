# Decision records

One file per decision: its context, the decision, and its consequences. The rules that follow from them are in the `AGENTS.md` files, each linking here.

Edit a record in place when its decision changes, and number a new one from the next free number.

| # | Decision | Area |
| --- | --- | --- |
| [1](0001-manifests-live-with-their-code.md) | Manifests live with their code | repo |
| [2](0002-a-static-site-with-no-backend.md) | A static site with no backend | repo |
| [3](0003-moon-runs-the-build.md) | moon runs the build and CI | ci |
| [4](0004-hand-declared-moon-graph.md) | A hand-declared moon graph, affected by changed files only | ci |
| [5](0005-deploy-markers.md) | Deploy decisions come from marker tasks | ci |
| [6](0006-moon-gates-every-ci-job.md) | moon decides which CI jobs run | ci |
| [7](0007-prototools-pins-the-toolchain.md) | `.prototools` is the single source of tool versions | ci |
| [8](0008-toolchain-cache-is-off.md) | The toolchain cache is off in CI | ci |
| [9](0009-build-once-promote-by-sha.md) | Build once, promote by commit SHA | ci |
| [10](0010-build-only-what-changed.md) | Build only what changed, reuse the rest | ci |
| [11](0011-releases-from-release-please.md) | Releases come from release-please | ci |
| [12](0012-release-commits-have-their-own-workflow.md) | Release commits have their own workflow | ci |
| [13](0013-manual-prod-infrastructure-apply.md) | A manual prod apply, for backfilling only | ci |
| [14](0014-replan-at-apply.md) | Applies re-plan instead of applying a saved plan | ci |
| [15](0015-advisory-security-scanning.md) | Security scanning is advisory | ci |
| [16](0016-skip-secrets-scan-on-docs-lint-markdown.md) | The secrets scan skips docs, and Markdown is linted | ci |
| [17](0017-self-hosted-renovate.md) | Dependency updates come from self-hosted Renovate | ci |
| [18](0018-one-gcp-project-per-environment.md) | One GCP project per environment, plus a root | infrastructure |
| [19](0019-plan-and-apply-identities.md) | Plan and apply authenticate as separate identities | infrastructure |
| [20](0020-frontend-bucket-lives-in-env-terraform.md) | Each environment's frontend bucket is created by its own Terraform | infrastructure |
| [21](0021-artifact-retention.md) | Artifact retention keeps recent merges | infrastructure |
