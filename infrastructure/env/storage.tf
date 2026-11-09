# The environment's frontend build bucket: one folder per commit SHA (that is its versioning; the
# bucket itself has none). CI writes the built site here on merge and reads it back on deploy, and
# Cloudflare Pages serves the extracted files. Not public. Named after the project because bucket
# names are global across GCS.
resource "google_storage_bucket" "frontend" {
  name                        = "${var.gcp_project_id}-frontend"
  location                    = var.gcp_region
  force_destroy               = false
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  # GCS lifecycle rules only condition on age - there is no "keep the N most recent folders" - so
  # this expires anything older than frontend_retention_days, including a live folder: promote, or
  # raise the window, before the folder prod runs ages out (see infrastructure/AGENTS.md).
  lifecycle_rule {
    condition {
      age = var.frontend_retention_days
    }

    action {
      type = "Delete"
    }
  }
}

# CI writes the build on merge and reads it back on deploy; objectAdmin covers both without
# bucket-level control (ACLs, deletion) that neither step needs.
resource "google_storage_bucket_iam_member" "frontend_github_actions_writer" {
  bucket = google_storage_bucket.frontend.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${var.ci_service_account}"
}
