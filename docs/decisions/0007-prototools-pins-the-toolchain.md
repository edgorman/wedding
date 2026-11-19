# 7. `.prototools` is the single source of tool versions

## Context

A tool version repeated in a setup step, a Dockerfile and a local install drifts.

## Decision

The root `.prototools` pins `moon`, `node`, `npm` and `terraform`, read by [proto](https://moonrepo.dev/proto) in CI (`moonrepo/setup-toolchain`, through the `setup-moon` action) and locally (`proto install`). The `frontend-node` action and the Terraform actions read the pin rather than repeating it. Renovate keeps the pins current ([17](0017-self-hosted-renovate.md)).

## Consequences

A version bump is one line; the Terraform pin also has to match every root's `required_version`.
