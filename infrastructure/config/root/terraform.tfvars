# The state bucket name in terraform.tfbackend is <project id>-terraform-state and must match.
gcp_provider_project_id = "edward-katie-wedding-root"
gcp_provider_region     = "europe-west1"
gcp_provider_zone       = "europe-west1-b"
gcp_project_prefix      = "edward-katie-wedding"
gcp_projects            = ["stag", "prod"]
github_repository_owner = "edgorman"
github_repository_name  = "wedding"

site_name = "Ed and Katie's Wedding"
# No custom domain: the frontends are served at https://edward-katie-wedding-stag.pages.dev and
# https://edward-katie-wedding-prod.pages.dev. To add one, set cloudflare_zone and frontend_hostnames, e.g.
# cloudflare_zone    = "example.com"
# frontend_hostnames = { stag = "staging.example.com", prod = "example.com" }

# The following are sensitive/unknown initially and thus have no default
# github_provider_token
# cloudflare_account_id
# cloudflare_api_token
# — pass them at apply time, e.g.:
#   TF_VAR_github_provider_token=<PAT> TF_VAR_cloudflare_account_id=<ID> TF_VAR_cloudflare_api_token=<TOK> make init
