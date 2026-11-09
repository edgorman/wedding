# Each environment's frontend bucket is created by infrastructure/env (storage.tf), applied per
# environment. These two blocks make root forget the buckets it created originally, without
# deleting them or their contents, so env can adopt them with its import blocks. Delete this file
# once this change has applied.
removed {
  from = google_storage_bucket.frontend

  lifecycle {
    destroy = false
  }
}

removed {
  from = google_storage_bucket_iam_member.frontend_github_actions_writer

  lifecycle {
    destroy = false
  }
}
