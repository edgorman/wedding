# The state bucket name in terraform.tfbackend is <project id>-terraform-state and must match.
gcp_provider_project_id = "edward-katie-wedding-root"
gcp_provider_region     = "europe-west1"
gcp_provider_zone       = "europe-west1-b"
gcp_project_prefix      = "edward-katie-wedding"
gcp_projects            = ["stag", "prod"]
github_repository_owner = "edgorman"
github_repository_name  = "wedding"

# Cloudflare dashboard > Workers & Pages, in the sidebar or the URL. Not a secret.
cloudflare_account_id = "3d8161599481144eae472c57c1d976f5"

site_name = "Ed and Katie's Wedding"
# Custom domain, served by the Cloudflare Workers. The zone must exist in the Cloudflare account.
# The workers.dev addresses (https://edward-katie-wedding-<stag|prod>.<your-account>.workers.dev) keep working too.
cloudflare_zone    = "katieanded.com"
frontend_hostnames = { stag = "dev.katieanded.com", prod = "katieanded.com" }

# The following are sensitive and have no default
# github_provider_token
# cloudflare_api_token
# — pass them at apply time, e.g.:
#   TF_VAR_github_provider_token=<PAT> TF_VAR_cloudflare_api_token=<TOK> make init
