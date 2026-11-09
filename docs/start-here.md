# Start here

From a fresh clone to an open pull request. None of it needs GCP access.

## 1. Clone and install the toolchain

You need git and [proto](https://moonrepo.dev/docs/proto/install).

```sh
git clone https://github.com/edgorman/wedding.git
cd wedding
proto install    # moon, Node, npm and Terraform at the pinned versions
```

## 2. Run the site

```sh
moon run services/frontend:dev    # Vite on http://localhost:5173
```

## 3. Run what CI runs

```sh
git fetch origin main
moon ci --base origin/main
```

This runs every check your branch affects. On a fresh branch nothing is affected yet; to run everything once, use `moon run :format :lint :typecheck :build :test`. `infra-*:validate` needs Terraform's registry; CI runs it if you can't.

## 4. Make one change

Read the root [`AGENTS.md`](../AGENTS.md) and the `AGENTS.md` of the area you're changing. They're short rules; each links to the decision record in [`decisions/`](decisions/README.md) that explains it.

## 5. Open a pull request

- Start from an issue (see [`CONTRIBUTING.md`](../.github/CONTRIBUTING.md)).
- Title it as a Conventional Commit, e.g. `feat(frontend): add the venue details`. The title becomes the commit on `main` and decides the version.
- Fill in the PR template. CI runs the checks from step 3 plus the title check. A code owner reviews, and on merge the change deploys to staging. Production is a separate promotion; nothing is deployed by hand.
