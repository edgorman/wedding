# 21. Artifact retention keeps recent merges

## Context

Every merge writes a bundle into both projects' frontend buckets ([9](0009-build-once-promote-by-sha.md)), so they grow with merge volume, even across long gaps between promotions.

## Decision

The rule is the same in both projects (`infrastructure/env/storage.tf`, [20](0020-frontend-bucket-lives-in-env-terraform.md)):

- A `lifecycle_rule` deletes commit-SHA folders older than `frontend_retention_days` (default 90). GCS can only match by age, so it can't spare the live folder: promote, or raise the window, before a live folder ages out.
- Before relying on it, list what it would match (`gcloud storage ls -L` filtered by creation time). Changing the window is a deliberate change.

## Consequences

The window still matters for staging and for commits never promoted. A rollback target must have a folder younger than the window, or it has to be rebuilt.
