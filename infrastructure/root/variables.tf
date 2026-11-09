variable "gcp_provider_project_id" {
  description = "The id of the root GCP project, created by hand before the first apply (docs/new-repo.md)"
  type        = string
}

variable "gcp_provider_region" {
  description = "The region of the root GCP project"
  type        = string
  default     = "europe-west1"
}

variable "gcp_provider_zone" {
  description = "The zone of the root GCP project"
  type        = string
  default     = "europe-west1-b"
}

variable "gcp_project_prefix" {
  description = "The prefix used for the environment GCP project ids"
  type        = string
}

variable "gcp_projects" {
  description = "The environment GCP projects to create, in addition to root"
  type        = list(string)
  default     = ["stag", "prod"]
}

variable "github_provider_token" {
  description = "GitHub PAT (repo scope) for the `github` provider. Passed by hand at bootstrap only; CI sources it from Secret Manager after (see gcp_secret.tf)."
  type        = string
  sensitive   = true
}

variable "github_repository_owner" {
  description = "The owner of the GitHub repository"
  type        = string
}

variable "github_repository_name" {
  description = "The name of the GitHub repository"
  type        = string
}

variable "cloudflare_account_id" {
  description = "The id of the Cloudflare account"
  type        = string
}

variable "cloudflare_api_token" {
  description = "API token granting CI/CD access to the Cloudflare account. Passed by hand at bootstrap only; CI sources it from Secret Manager after (see gcp_secret.tf)."
  type        = string
  sensitive   = true
}

variable "site_name" {
  description = "Display name of the site, shown in page titles and link previews (the SITE_NAME Actions variable)"
  type        = string
}

variable "cloudflare_zone" {
  description = "The Cloudflare zone (domain) the frontend hostnames live in, e.g. example.com. Empty when there is no domain: the frontends are then served only at their pages.dev subdomains."
  type        = string
  default     = ""
}

variable "frontend_hostnames" {
  description = "Full hostname of each environment's frontend, inside cloudflare_zone, e.g. { stag = \"staging.example.com\", prod = \"example.com\" }. An environment left out is served at its pages.dev subdomain."
  type        = map(string)
  default     = {}
}

variable "frontend_retention_days" {
  description = "How many days a commit-SHA folder survives in the frontend bucket in each environment's bucket before the bucket's lifecycle rule deletes it. See the Artifact Stores section of infrastructure/AGENTS.md."
  type        = number
  default     = 90
}
