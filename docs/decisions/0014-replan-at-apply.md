# 14. Applies re-plan instead of applying a saved plan

## Context

A plan saved by a `pull_request` job and applied after merge would be written by a job running on a branch, with credentials able to write the state bucket. Anyone able to push a branch could upload a crafted plan under the tree hash of an approved PR, and the merge would apply it. The reviewed plan and the applied plan would be the same only by convention.

## Decision

- `terraform-push-commit` plans and applies in one job, from the commit it runs for. Nothing is read from a plan another job wrote, and the state buckets hold no plan files.
- `terraform-pull-request` plans and comments on the PR, which is the reviewed reference, but saves nothing. The plan identity therefore needs no write access to the state buckets ([19](0019-plan-and-apply-identities.md)).
- Each apply writes its plan to the job summary, and a plan with nothing to apply is skipped.
- For production, the plan is posted on the release PR ([11](0011-releases-from-release-please.md)) and the promotion re-plans.

## Consequences

What is applied is planned from the merged commit, so it can differ from the PR comment if state, or `main`, moved in between; the apply's job summary shows what was actually applied. Every apply costs one plan.
