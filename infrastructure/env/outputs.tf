output "frontend_bucket" {
  description = "Name of this environment's frontend static-build bucket"
  value       = google_storage_bucket.frontend.name
}
