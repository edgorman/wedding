# 9. Build once, promote by commit SHA

## Context

Production should run exactly the bytes validated in staging, and a rollback should never depend on rebuilding an old commit.

## Decision

- Every commit on `main` has a frontend `dist/` published by commit SHA, never the version, to both the staging and prod buckets. A merge builds what it changed and republishes the rest ([10](0010-build-only-what-changed.md)); a release commit publishes its predecessor's ([12](0012-release-commits-have-their-own-workflow.md)). A merge whose run is cancelled while pending gets none; the next run covers its infrastructure.
- The frontend is a plain `dist/` with nothing environment-specific baked in, uploaded under `<commit-sha>/` to both frontend buckets. Staging deploys from that same `dist/`.
- The site's name and canonical URL, the environment and the version are runtime configuration: `frontend-deploy` writes `config.json` next to the fetched folder, which the Worker reads, so the stored folder stays environment-neutral.
- Promoting a release ([11](0011-releases-from-release-please.md)) runs, in order: `terraform apply` on prod, then the frontend folder from prod's own bucket (`frontend-fetch`) to Cloudflare Workers with `config.json`. No cross-project read, no copy, no rebuild.
- Rollback is promoting an earlier tag: the same flow, with that release's infrastructure and folder, both already in place.

## Consequences

A bucket's size tracks merges, not deploys, which is why retention exists.
