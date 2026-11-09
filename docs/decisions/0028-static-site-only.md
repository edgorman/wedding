# 28. A static site only, with no backend

Status: Accepted (supersedes 2-10, 17, 23, 24)

## Context

The repository started as a full-stack template: a Go API on Cloud Run with Firestore, a protobuf contract between it and the frontend, per-environment Terraform and monitoring. The wedding website is a single static page and needs none of that.

## Decision

- The repository is one static Vite/React site, `services/frontend`, deployed to Cloudflare Pages. There is no backend, API contract, database or Cloud Run.
- `infrastructure/root` remains: it creates the GCP projects (`edward-katie-wedding-root`, `-stag`, `-prod`), the state buckets, Workload Identity Federation, the frontend build buckets and the Cloudflare Pages projects. `infrastructure/env` and its staging and prod configs are gone, so there is no per-environment Terraform apply and no prod plan in a pre-release.
- A merge still builds the frontend once, publishes it by commit SHA, and deploys it to staging; promoting a release deploys the same bundle to prod ([15](0015-build-once-promote-by-sha.md)).
- The site has no custom domain yet. When a domain is registered, set `cloudflare_zone` and `frontend_hostnames` in `infrastructure/config/root/terraform.tfvars`.

## Consequences

- Any backend, API or per-environment infrastructure added later needs a new decision record.
