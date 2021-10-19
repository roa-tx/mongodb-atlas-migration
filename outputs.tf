# define output(s)
# 1.
output "mongodb_projects_attributes" {
  description = "key-value pair attributes of the created MongoDB Atlas project"
  value = mongodbatlas_project.mongodb_project
}

# 2.
output "mongodb_project_maintenance_window_attributes" {
  description = "key-value pair attributes of the created MongoDB Atlas project maintenance window"
  value = mongodbatlas_maintenance_window.mongodb_project_maintenance_window
}

# 3.
output "mongodb_credentials_attributes" {
  description = "key-value pair of the admin database user's credential (username and password)"
  value = jsondecode(aws_secretsmanager_secret_version.secret_version.secret_string)
  #sensitive = true
}

# 4.
output "mongodb_admin_database_user_attributes" {
  description = "key-value pair attributes of the created MongoDB Atlas admin database user"
  value = mongodbatlas_database_user.mongodb_admin_database_user
  sensitive = true
}

# 5.
output "mongodb_cluster_regionals_attributes" {
  description = "key-value pair attributes of the created 3 regional MongoDB Atlas cluster(s)"
  value = mongodbatlas_cluster.mongodb_cluster_regionals
}


# 6.
output "mongodb_cluster_central_attributes" {
  description = "key-value pair attributes of the created central MongoDB Atlas cluster(s)"
  value = mongodbatlas_cluster.mongodb_cluster_central
}
