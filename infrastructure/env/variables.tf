variable "gcp_project_id" {
  description = "The GCP project this environment's resources are created in (e.g. edward-katie-wedding-stag)"
  type        = string
}

variable "gcp_region" {
  description = "The region this environment's resources are created in"
  type        = string
  default     = "europe-west1"
}

variable "environment" {
  description = "Short environment name used in resource naming (e.g. stag, prod)"
  type        = string
}

variable "ci_service_account" {
  description = "Email of the CI service account infrastructure/root creates, granted what CI needs on this environment's resources. The workflows pass the SERVICE_ACCOUNT Actions variable."
  type        = string
}

variable "frontend_retention_days" {
  description = "How many days a commit-SHA folder survives in the frontend bucket before the bucket's lifecycle rule deletes it. See the Artifact Stores section of infrastructure/AGENTS.md."
  type        = number
  default     = 90
}
