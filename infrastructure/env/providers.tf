# Applied once per environment (staging/prod), against a state bucket infrastructure/root already
# created - so unlike that root, this one needs no local-state bootstrap.
terraform {
  required_version = "1.17.2"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "8.12.0"
    }
  }

  backend "gcs" {
    bucket = ""
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}
