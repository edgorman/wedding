# 2. A static site with no backend

## Context

The wedding website is one static page: a schedule, a map and some drawings. It has no accounts, no stored data and nothing to call, so a service behind it would be cost and attack surface for no behaviour.

## Decision

- The repository is one Vite/React site, `services/frontend`, served from a Cloudflare Worker with static assets ([9](0009-build-once-promote-by-sha.md)). There is no backend, API contract, database or Cloud Run service.
- The Worker (`services/frontend/worker/index.js`) only does what a static bundle cannot: it serves `robots.txt` and a one-page `sitemap.xml`, and marks every non-production host `noindex`. It reads `config.json`, which `frontend-deploy` writes next to the bundle, for the site's canonical URL.
- `infrastructure/root` creates the GCP projects (`<prefix>-root`, `-stag`, `-prod`), the state buckets, Workload Identity Federation ([19](0019-plan-and-apply-identities.md)), the Cloudflare Workers and their custom domains, and the Actions variables. `infrastructure/env` is applied per environment and holds each environment's frontend bucket ([20](0020-frontend-bucket-lives-in-env-terraform.md)).
- The custom domain is set by `cloudflare_zone` and `frontend_hostnames` in `infrastructure/config/root/terraform.tfvars`; without them each environment is served at its `workers.dev` address.

## Consequences

Anything a backend would bring (a service, a database, an API contract, monitoring) needs its own decision record and a place in `infrastructure/env`, which already applies per environment.
