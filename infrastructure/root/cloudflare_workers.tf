# A Worker per environment, named <gcp_project_prefix>-<env> to match the cloudflare_project_name
# inputs in push-commit.yaml / promote-release.yaml. Terraform creates the Worker and its domains;
# wrangler (services/frontend/wrangler.jsonc, frontend-deploy) only uploads versions of it. Each is
# served at its workers.dev address, plus a custom domain for every entry in frontend_hostnames.
resource "cloudflare_worker" "frontend" {
  for_each = toset(var.gcp_projects)

  account_id = var.cloudflare_account_id
  name       = "${var.gcp_project_prefix}-${each.key}"

  subdomain = {
    enabled = true
  }
}

# Each custom domain creates the DNS record that routes to its Worker.
resource "cloudflare_workers_custom_domain" "frontend" {
  for_each = var.frontend_hostnames

  account_id = var.cloudflare_account_id
  zone_name  = var.cloudflare_zone
  hostname   = each.value
  service    = cloudflare_worker.frontend[each.key].name
}

locals {
  # The host each environment is served at: its custom domain, or else its workers.dev address.
  frontend_hosts = {
    for k, worker in cloudflare_worker.frontend :
    k => lookup(var.frontend_hostnames, k, replace(worker.subdomain.url, "https://", ""))
  }
}
