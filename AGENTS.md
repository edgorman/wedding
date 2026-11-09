# AGENTS.md

Repo-wide rules for Claude Code, other coding agents and contributors. Each area has its own `AGENTS.md`, loaded when working on files under it:

- `infrastructure/AGENTS.md` - GCP projects, IAM/WIF, artifact stores and retention.
- `.github/AGENTS.md` - moon, CI/CD, versioning, deploys, releases, rollback.

Rules are short; the reasoning behind each is a decision record in [`docs/decisions/`](docs/decisions/README.md). New to the repository? Start with [`docs/start-here.md`](docs/start-here.md).

Claude Code reads these files through its built-in [`agents-md`](https://github.com/anthropics/claude-code/tree/main/mods/agents-md) plugin, which loads `AGENTS.md` where it would load `CLAUDE.md`, but only while the project has no `CLAUDE.md`, `.claude/CLAUDE.md` or `CLAUDE.local.md`.

## Repository Structure

A trunk-based repository: a static frontend, Terraform and repository governance in one place. There is no backend.

- `infrastructure/` - Terraform. `root` holds the GCP projects, state buckets, WIF, frontend buckets and Cloudflare Pages projects, bootstrapped once; `config/root` holds its variables.
- `services/frontend/` - the wedding site: a Vite/React app on Cloudflare Pages.
- `.github/` - workflows, composite actions (`actions/`), and `settings.yml` (repository settings and rulesets, applied by the Probot Settings app).
- `docs/` - [`start-here.md`](docs/start-here.md) and the decision records.

Each language's manifest lives in the directory that owns its code; the root declares none ([1](docs/decisions/0001-manifests-live-with-their-code.md)). There is no Makefile for the frontend: CI runs through moon, and locally you call the tooling directly. See [28](docs/decisions/0028-static-site-only.md) for why there is no backend.

## Commands

What to run before pushing, mirroring `pull-request.yaml`:

```
# Frontend (services/frontend)
npm test && npm run lint && npm run build

# Infrastructure
terraform fmt -check -recursive infrastructure

# CI parity (repo root)
moon ci --base origin/main                               # everything affected vs origin/main
moon run services/frontend:test services/frontend:lint    # specific targets
MOON_BASE=origin/main moon query affected                # what CI's `changed` job sees (no --base flag)
```

Locally, `proto install && moon ci --base origin/main` is the whole setup. In a Claude Code cloud session, `.claude/hooks/session-start.sh` installs the pinned toolchain and exports `MOON_PLUGINS_USE_URL_DIST` and `MOON_TOOLCHAIN_FORCE_GLOBALS`, since `ghcr.io` isn't allowlisted. Everything then runs except `infra-root:validate` (`terraform init` needs `registry.terraform.io`); `moon setup` and `proto install` don't work there and aren't needed.

## Claude Code plugins

`.claude/settings.json` enables these plugins for every Claude Code session here, so expect their defaults in Claude-authored changes:

- `ponytail` - a minimal-code style: the smallest change that works, no speculative abstractions.
- `code-simplifier` - a cleanup pass over changed code.
- `feature-dev` - guided feature development agents (explore, architect, review).
- `google-cloud-developer` - Google Cloud docs lookup and `gcloud` guardrails.

Locally Claude Code offers to install them when you trust the folder. A cloud session installs them through `.claude/hooks/install-plugins.sh` in the background, so they apply from the next start, resume or `/reload-plugins`.

Two project skills in `.claude/skills/` cover issue to merged PR: `implement-issue` (e.g. `/implement-issue 194`) and `steward` (drive the PR to green).

## Rules

- **Never run apply/deploy by hand.** `terraform apply`, `wrangler` and the like go through the workflows (`.github/AGENTS.md`); `.claude/settings.json` denies them to Claude Code.
- **Bundles are never rebuilt for production.** Prod deploys the commit-SHA artifact already in its own store (`.github/AGENTS.md`).
- **Never add a manifest at the repository root** (Repository Structure above).
- **Never add a `CLAUDE.md`, `.claude/CLAUDE.md` or `CLAUDE.local.md` anywhere.** One such file makes Claude Code ignore every `AGENTS.md`; put instructions in the `AGENTS.md` of the directory they apply to.
- **Reasoning goes in a decision record, not an `AGENTS.md`.** Add a rule as a bullet linking to its record; supersede a record with a new one rather than rewriting it ([`docs/decisions/`](docs/decisions/README.md)).

## Commit Message Convention

Every PR title must be a [Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/) subject, `type(scope)?: description` (e.g. `feat(frontend): add the venue details`), and the `pr-title` check enforces it. PRs are squash-merged with the title as the commit subject, and versioning parses that subject ([18](docs/decisions/0018-versions-from-conventional-commits.md)):

- `feat:` - a new capability; bumps minor.
- `fix:` - a bug fix; bumps patch.
- `build`, `chore`, `ci`, `docs`, `perf`, `refactor`, `revert`, `style`, `test` - bump patch.
- `!` after the type or scope, or a `BREAKING CHANGE:` footer in the PR body - bumps major.

This applies to PRs Claude Code opens too.
