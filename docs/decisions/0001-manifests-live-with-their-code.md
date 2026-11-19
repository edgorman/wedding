# 1. Manifests live with their code

## Context

A manifest at the repository root claims the whole tree for one language. A root `package.json` makes npm and editor tooling treat `infrastructure/` and everything else as part of the frontend, and outlives the code that justified it if that service is ever removed.

## Decision

Each language's manifest lives in the directory that owns that language's code: `services/frontend/package.json`, the Terraform roots under `infrastructure/`. `.github/renovate.json5` reads the same list: each manager points at a manifest's own folder.

A service in another language gets its manifest in its own folder, never at the root.

`.moon/` and `.prototools` sit at the root anyway. They configure the orchestrator that walks every other manifest rather than claiming an ecosystem of their own, so there is nothing for them to live beside. `CHANGELOG.md` and the release-please files ([11](0011-releases-from-release-please.md)) are not manifests either.

## Consequences

- Each language's tooling only sees its own directory.
- A new service brings its own manifest in its own folder.
