# Applied once per environment (staging/prod), against a state bucket infrastructure/root already
# created - so unlike that root, this one needs no local-state bootstrap.
terraform {
  required_version = "1.15.8"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "8.8.1"
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
