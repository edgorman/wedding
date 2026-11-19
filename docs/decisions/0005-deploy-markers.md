# 5. Deploy decisions come from marker tasks

## Context

CI has to decide which Terraform environments a diff reaches, and whether a merge has to build the frontend, including through workflow and composite action files.

## Decision

- Each `deploy-{root,staging,prod}:plan` task (read by `pull-request.yaml`) and `deploy-{root,staging}:apply` task (read by `push-commit.yaml`) is a `noop` whose only job is its `inputs`: `terraform.tfbackend`, `terraform.tfvars`, `project://infra-root` or `project://infra-env`, and the workflow and composite action that job uses (`terraform-pull-request` and `pull-request.yaml` for a plan; `terraform-push-commit` and `push-commit.yaml` for an apply). Plan and apply are separate so editing one workflow doesn't re-plan or re-apply what the other covers. There is no blanket `.github/**` glob, so an action only staging uses doesn't mark prod affected.
- `services/frontend:publish` is a marker of the same kind for the build ([10](0010-build-only-what-changed.md)): the build's inputs plus every action and workflow that builds it.
- A marker in the affected set runs that environment's `terraform plan` (PR) or `apply` (push), or builds the frontend.
- Markers keep `options.cache: false` and the default `runInCI`. A `runInCI: false` task is invisible to `moon query affected` in CI, which would make every environment read unaffected.

## Consequences

A new workflow or action an environment or the frontend build depends on must be added to that marker's `inputs`, or a change to it reaches nothing.
