---
name: steward
description: This repo's conventions for driving a pull request to green - what each required check means, how to reproduce it locally, and which failures need the user. Use when watching, fixing CI on, or answering review on a PR in this repository.
---

# Stewarding a PR in this repo

Rules live in the `AGENTS.md` files and their reasoning in `docs/decisions/`; this is only what to do. Build and CI: `.github/AGENTS.md`. Wire contract: `packages/protos/AGENTS.md`.

## Before any push

Run what CI runs, from the repo root, against `origin/main` (`git fetch origin main` first):

```
moon ci --base origin/main :format :lint :typecheck :build root:projects-covered
moon ci --base origin/main :test
```

`moon ci` runs only what the diff affects, so a clean run on an untouched project proves nothing about it. In a cloud session `:validate` cannot run (`terraform init` needs `registry.terraform.io`); read the CI log for it.

## Required checks

All jobs of `.github/workflows/pull-request.yaml` and `pr-title` in `.github/workflows/conventions.yaml` are required (`.github/settings.yml`). A job its `if:` skips reports "skipped", which counts as passing.

| Check | What a failure means | Fix |
|---|---|---|
| `lint-check` → `:format` | `terraform fmt` | `terraform fmt -recursive infrastructure` |
| `lint-check` → `:lint`/`:typecheck`/`:build` | oxlint, `tsc`, `vite build` | Fix the code |
| `lint-check` → `:validate` | `terraform validate` | Fix the HCL. You can't reproduce it locally, so read the log |
| `lint-check` → `root:projects-covered` | A `services/*` folder has no `moon.yml` | Add one, modelled on a sibling |
| `test` → `:test` | Vitest | A real failure. Root-cause it |
| `pr-title` | The PR title isn't a Conventional Commit: `type(scope)?!?: description`, type one of `feat`, `fix`, `build`, `chore`, `ci`, `docs`, `perf`, `refactor`, `revert`, `style`, `test` (root `AGENTS.md`) | Edit the title. The check reruns on the edit, no push needed |
| `changed` | `moon query affected` failed | A `moon.yml` is invalid. `MOON_BASE=origin/main moon query affected` reproduces it |
| `infrastructure-root` | `terraform init/fmt/validate/plan` with real credentials | See below |

**Toolchain errors are not test failures.** `proto-shim: ... Permission denied (os error 13)` is the known toolchain cache bug that `cache: false` works around in every job. If it shows up anyway, it failed before any task ran, so one re-run is allowed.

## Infrastructure plans

The plan job posts its output as a PR comment. Read it:
- Check that every change in the plan is one the diff meant. Flag any `destroy` or `replace` to the user, even when CI is green.
- `fmt`/`validate` errors: fix them.
- Plan errors (permissions, API not enabled, provider errors, state): stop and comment on the PR with the error. These need the user.
- **Never** run `terraform apply`, `wrangler` or anything else that mutates an environment. `.claude/settings.json` denies them anyway.

## Branch and merge rules

- **Title**: a Conventional Commit (`feat(frontend): ...`, `fix(ci): ...`). PRs are squash-merged with the PR title as the commit subject, and versioning is computed from that subject. Fix a non-conforming title on a PR you opened.
- **Body**: follow `.github/PULL_REQUEST_TEMPLATE.md` (Summary, `Closes #`, Area checkboxes, Testing).
- **`strict: true`**: the branch must be up to date with `main`. When it's behind, merge `origin/main` in. Never rebase or force-push; `allow_force_pushes: false` and squash merge keep `main` linear anyway.
- **Approval**: one code-owner approval (see `.github/CODEOWNERS`), and `dismiss_stale_reviews` is on, so any push drops it. Don't hold back a needed fix because of this. Once CI is green with no open threads, the PR is waiting on the owner and nothing else is yours to do.
- **`mergeable_state: blocked` on a green PR is expected.** Claude Code pushes and opens PRs as the repository owner, and GitHub never lets an author approve their own PR, so the owner merges with the admin override (`enforce_admins: false`). Don't investigate it, and never propose dropping `required_pull_request_reviews`.
- **`required_conversation_resolution`**: resolve every thread you've addressed, and reply on any you're not changing.

## Dependabot PRs

`build(deps)` PRs come grouped per ecosystem (`npm-deps`, `terraform-deps`, `ci-deps`):
- Terraform providers: the plan comment is the review. Read it for unexpected changes.

## Never

- Hand-edit `internal/gen` or `src/gen`.
- Add a `CLAUDE.md`, `.claude/CLAUDE.md` or `CLAUDE.local.md`. Any one of them makes Claude Code stop loading every `AGENTS.md`.
- Put a manifest (`go.mod`, `package.json`, ...) at the repository root.
