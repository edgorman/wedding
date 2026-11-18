# wedding

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](services/frontend)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](services/frontend)
[![Terraform](https://img.shields.io/badge/Terraform-1.15-844FBA?logo=terraform&logoColor=white)](infrastructure)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](infrastructure)
[![moon](https://img.shields.io/badge/moon-2.5-6F53F3)](https://moonrepo.dev)

Ed and Katie's wedding website: a static React page served by a Cloudflare Worker, with CI/CD and infrastructure-as-code. There is no backend.

New here? [`docs/start-here.md`](docs/start-here.md) goes from a fresh clone to an open pull request.

## What's in here

| Path | What |
| --- | --- |
| `services/frontend` | Vite/React static site, deployed to a Cloudflare Worker |
| `infrastructure` | Terraform: `root` for the GCP projects (`edward-katie-wedding-root`, `-stag`, `-prod`), the Cloudflare Workers and GitHub; `env` per environment (today each frontend bucket) |
| `.github` | Workflows and composite actions: PR checks, staging deploy on merge, a release PR whose merge promotes to prod |
| `docs` | [`start-here.md`](docs/start-here.md), [`ci-cd.md`](docs/ci-cd.md) (PR to production, and rollback) and the decision records |
| `docs/decisions` | Why things are the way they are, one decision per file |

Every merge to `main` deploys to staging at `https://dev.katieanded.com`; production releases (`https://katieanded.com`) are promoted from there. Nothing is ever applied or deployed by hand.

## Developing with moon

[moon](https://moonrepo.dev) runs every task, and [proto](https://moonrepo.dev/proto) pins the toolchain (`.prototools`: Node, npm, Terraform, moon itself).

```sh
proto install                       # install the pinned toolchain
moon run services/frontend:dev      # frontend dev server
moon run services/frontend:test     # one task in one project
moon run :lint                      # one task across every project
moon ci --base origin/main          # everything your branch affects - what CI runs on a PR
```

## First-time infrastructure bootstrap

The GCP root project `edward-katie-wedding-root` already exists. Until `infrastructure/root` is applied once by hand (`make init` there, with `TF_VAR_github_provider_token` and `TF_VAR_cloudflare_api_token` set, and `cloudflare_account_id` in `config/root/terraform.tfvars`; see [`infrastructure/AGENTS.md`](infrastructure/AGENTS.md)), CI runs only the PR checks and every deploy job skips itself. After that, everything goes through CI.

## Contributing and licence

See [`CONTRIBUTING.md`](.github/CONTRIBUTING.md) and the [code of conduct](.github/CODE_OF_CONDUCT.md).

The code in this repository is [MIT-licensed](LICENSE).
