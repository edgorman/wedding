# 29. Per-environment Terraform is kept, and owns each environment's frontend bucket

Status: Accepted (amends [28](0028-static-site-only.md); supersedes [27](0027-artifact-stores-in-root.md) for the frontend bucket; reinstates [17](0017-manual-prod-infrastructure-apply.md))

## Context

[28](0028-static-site-only.md) removed `infrastructure/env` along with the backend, leaving the frontend buckets in root. A backend or other cloud services are expected later, and they belong in per-environment Terraform, applied to staging on merge and to prod on promotion.

## Decision

- `infrastructure/env`, `config/staging` and `config/prod` stay, with the `infrastructure-staging` and `infrastructure-prod` jobs in the PR, push and promote workflows, and the manual `apply-infrastructure-prod.yaml`. Today env holds only the frontend bucket and its CI writer binding; backend resources are added to it when they exist.
- Each environment's frontend bucket is created by `infrastructure/env/storage.tf`, not root. Root's `removed` blocks (`root/artifact_stores.tf`) forget the buckets it created first without deleting them, and env's `import` blocks adopt them, so nothing is recreated and the published folders survive. Both sets of blocks were deleted once every environment had applied.
- A merge writes into prod's bucket before prod's env Terraform has applied ([27](0027-artifact-stores-in-root.md)'s reason for putting stores in root). That holds while the bucket already exists. A brand-new environment needs `apply-infrastructure-prod.yaml` run once before its first merge ([17](0017-manual-prod-infrastructure-apply.md)).

## Consequences

- Root still creates the GCP projects and each environment's state bucket, since env needs them to exist.
- Decisions 23 and 24 stay superseded; monitoring and the debug endpoint return only with a backend.
