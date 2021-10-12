# 5. create mongodb atlas cluster(s)
resource "mongodbatlas_cluster" "mongodb_cluster" {
  depends_on                     = [mongodbatlas_database_user.mongodb_database_admin_user]
  count                          = length(var.cluster_names)
  project_id                     = mongodbatlas_project.mongodb_project.id
  name                           = "${var.org_identifier}-${var.environment}-${var.cluster_names[count.index]}"
  cluster_type                   = var.cluster_type
  cloud_backup                   = var.cloud_backup
  auto_scaling_disk_gb_enabled   = var.auto_scaling_disk_gb_enabled
  auto_scaling_compute_enabled   = var.auto_scaling_compute_enabled
  mongo_db_major_version         = var.mongo_db_major_version
  disk_size_gb                   = var.disk_size_gb
  provider_name                  = var.provider_name
  provider_instance_size_name    = var.provider_instance_size_name
  provider_volume_type           = var.provider_volume_type
  
  replication_specs {
    num_shards                   = var.num_shards
    
    regions_config {
      region_name                = var.provider_region_names[count.index]
      electable_nodes            = var.electable_nodes
      priority                   = var.priority
      read_only_nodes            = var.read_only_nodes
      analytics_nodes            = var.analytics_nodes
    }
  }
  
  advanced_configuration {
    javascript_enabled           = var.javascript_enabled
    minimum_enabled_tls_protocol = var.minimum_enabled_tls_protocol
 }
 
 labels {
    key                          = var.cluster_node_key
    value                        = "${var.org_identifier}-${var.environment}-${var.cluster_names[count.index]}"
  }
}
