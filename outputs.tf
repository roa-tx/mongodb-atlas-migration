# define output(s)
# 1.
output "mongodbatlas_projects_attributes" {
  description = "key-value pair attributes of the created MongoDB Atlas project"
  value = mongodbatlas_project.mongodb_project
}

# 2.
output "mongodbatlas_project_maintenance_window_attributes" {
  description = "key-value pair attributes of the created MongoDB Atlas project maintenance window"
  value = mongodbatlas_maintenance_window.mongodb_project_maintenance_window
}

# 3.
output "mongodbdb_credentials_attributes" {
  description = "key-value pair of the admin/master/super user's credential (username and password)"
  value = jsondecode(aws_secretsmanager_secret_version.secret_version.secret_string)
  sensitive = true
}

# 4.
output "mongodb_database_admin_user_attributes" {
  description = "key-value pair attributes of the created MongoDB Atlas admin/master/super user"
  value = mongodbatlas_database_user.mongodb_database_admin_user
  sensitive = true
}

# 5.
output "mongodb_cluster_attributes" {
  description = "key-value pair attributes of the created MongoDB Atlas cluster(s)"
  value = mongodbatlas_cluster.mongodb_cluster
}
