# 20. Each environment's frontend bucket is created by its own Terraform

## Context

Every merge writes the frontend bundle into both environments' buckets ([9](0009-build-once-promote-by-sha.md)), while environment Terraform reaches prod only on promotion. A bucket in prod's Terraform therefore has to exist before the first merge writes to it. Per-environment Terraform is also where anything the site later needs from its own environment (a service, a database) belongs.

## Decision

- `infrastructure/env/storage.tf` creates the bucket `<project id>-frontend` and grants the CI service account (`ci_service_account`: the deploy identity for staging, the promote identity for prod) object access ([19](0019-plan-and-apply-identities.md)). Retention is in the same file ([21](0021-artifact-retention.md)).
- Staging's env applies on every merge it is affected by, after root, and prod's on promotion ([5](0005-deploy-markers.md)). The deploy identity holds `roles/storage.admin` on prod's project, so a merge can write prod's bucket as soon as it exists.
- A brand-new environment's bucket does not exist until its env applies, so `apply-infrastructure-prod.yaml` is run once before that environment's first merge ([13](0013-manual-prod-infrastructure-apply.md)).
- Root keeps what env needs to exist first: the projects and each environment's state bucket ([18](0018-one-gcp-project-per-environment.md)).

## Consequences

Adding a per-environment resource that a merge writes to means running the manual prod apply before that merge lands.
