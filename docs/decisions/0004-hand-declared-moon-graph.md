# 4. A hand-declared moon graph, affected by changed files only

## Context

At a handful of projects, with one npm package, inference has nothing to find that a few declared edges don't say more plainly ([3](0003-moon-runs-the-build.md)).

## Decision

- `.moon/workspace.yml` discovers `services/*` by folder (`globFormat: 'source-path'`, so IDs are paths) and names `root`, `infra-root`, `infra-env` and `deploy-{root,staging,prod}` explicitly. Each `moon.yml` declares `dependsOn` by hand.
- `root:projects-covered` fails CI if a `services/*` folder has no `moon.yml`.
- `--affected` is changed files only; nothing uses `--include-relations`. A task that must react to another project lists it in `inputs` (`project://...`). `.moon/tasks/all.yml`'s `implicitInputs` adds each project's own `moon.yml`, so editing a task runs it.
- `moon ci`'s targets map to the required checks ([6](0006-moon-gates-every-ci-job.md)): `lint-check` runs `:format :lint :typecheck :build :validate root:projects-covered root:decision-links root:markdown-lint` and `test` runs `:test`, each against `origin/main`. A leading `:` runs the task in every project that has it.
- Terraform roots are `infra-env`/`infra-root` with `format` and `validate` (`runInCI: 'only'`) from `.moon/tasks/terraform.yml`.

## Consequences

More typing per task than a transitive flag, and exactly as precise as the `inputs` declared.
