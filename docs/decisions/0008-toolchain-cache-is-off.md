# 8. The toolchain cache is off in CI

## Context

Restoring a cached toolchain loses the executable bit on proto's shim, so a task fails with `proto-shim: ... Permission denied (os error 13)` right after a cache hit, on a different task each time.

## Decision

Every `moonrepo/setup-toolchain` step sets `cache: false`, through the `setup-moon` action. A cold toolchain install per job costs a minute or two; a cache hit that breaks the job costs a re-run and a doubt about every red check.

The same error appears without a cache when moon installs proto as part of its own action pipeline while the first task with no dependencies, often a `terraform validate`, is already calling a shimmed tool. Jobs that run `moon ci` therefore set `auto-setup: true` on `setup-toolchain`, which runs `moon setup` first, so proto and every tool are installed before any task starts.

## Consequences

Turn the cache back on only once the cause is confirmed fixed upstream, and watch for the error. The `steward` skill treats the error as a toolchain failure, allowing one re-run, not as a test failure.
