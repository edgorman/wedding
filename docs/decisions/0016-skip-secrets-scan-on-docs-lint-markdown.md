# 16. The secrets scan skips docs, and Markdown is linted

## Context

Any file can hold a secret, but a docs-only pull request that starts a runner to scan prose wastes time. Markdown also needs a check of its own for style and structure.

## Decision

- `scan-secrets` ([6](0006-moon-gates-every-ci-job.md)) lists no `docs/` or `*.md` file as inputs, so a pull request that changes only those skips the `gitleaks` job. A change to code, config, a workflow, Terraform or any other file still scans the whole PR range, and the weekly and manual runs scan all of `main`'s history.
- `root:markdown-lint` runs `markdownlint-cli2` over every Markdown file except the generated `CHANGELOG.md`. It is a `lint-check` target, so it runs when a Markdown file or `.markdownlint-cli2.jsonc` changes and is part of the existing required check. The rules are the defaults minus line length, inline HTML, first-line heading and table column style.

## Consequences

A secret pasted into a Markdown file in a PR is not caught on that PR; the weekly scan of `main` finds it, late. Adding a rule to the lint means editing `.markdownlint-cli2.jsonc` and fixing what it reports in the same PR.
