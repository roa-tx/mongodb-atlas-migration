# 0. configuration for provider(s) and backend
terraform {

  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
    
    mongodbatlas = {
      source = "mongodb/mongodbatlas"
    }
      
    random = {
      source = "hashicorp/random"
    }
    
    rediscloud = {
      source = "RedisLabs/rediscloud"
    }
  }

  backend "s3" {
    bucket  = "test-bucket-eco"
    key     = "mongodb-atlas-terraform.tfstate"
    region  = "us-east-1"
    encrypt = true
  }
}


# 1. create mongodb atlas project
resource "mongodbatlas_project" "mongodb_project" {
  org_id                        = var.mongodb_org_id
  name                          = "${var.org_identifier}-${var.environment}-${var.mongodb_project_name}"
}


# 2. create mongodb atlas project maintenance window
resource "mongodbatlas_maintenance_window" "mongodb_project_maintenance_window" {
  count                         = length(var.cluster_names)
  depends_on                    = [mongodbatlas_project.mongodb_project]
  project_id                    = mongodbatlas_project.mongodb_project.id
  day_of_week                   = var.day_of_week
  hour_of_day                   = var.hour_of_day
}
  
  
# 3 create admin/master/super user's credential and storage for the admin/master/super user's credentials
# a. create random password to be used as database password
resource "random_password" "random_password" {
  depends_on                    =  [mongodbatlas_maintenance_window.mongodb_project_maintenance_window]
  length                        =  var.random_password_length
  special                       =  var.random_password_true
  lower                         =  var.random_password_true
  upper                         =  var.random_password_true
  number                        =  var.random_password_true
  override_special              =  var.random_password_override_special
}

# b. create uuid, to be appended to the secret name (uuid full string) to ensure uniqueness
resource "random_uuid" "secret_random_uuid" { }

# c. create aws secret manager's secret
resource "aws_secretsmanager_secret" "secret" {
  depends_on                    = [random_password.random_password, random_uuid.secret_random_uuid]
  name                          = "${var.org_identifier}-${var.environment}-${var.aws_secretsmanager_secret_name}-${random_uuid.secret_random_uuid.result}"
  description                   = var.secret_description
  recovery_window_in_days       = var.recovery_window_in_days
  tags = {
    Name                        = "${var.org_identifier}-${var.environment}-${var.aws_secretsmanager_secret_name}-${random_uuid.secret_random_uuid.result}"
    Creator                     = var.creator
  }
}

# d. create local variables for referencing purpose
locals {
  depends_on                     = [aws_secretsmanager_secret.secret]
  credentials = {
    username                     = var.username
    password                     = random_password.random_password.result
  }
}

# e. create aws secret version - stores the credential (username and password) in secret manager's secret
resource "aws_secretsmanager_secret_version" "secret_version" {
  depends_on                     = [aws_secretsmanager_secret.secret]
  secret_id                      = aws_secretsmanager_secret.secret.id
  secret_string                  = jsonencode(local.credentials)
}


# 4. create mongodb atlas database admin/master/super user and assign the credentials stored in secret manager to the user
resource "mongodbatlas_database_user" "mongodb_database_admin_user" {
  depends_on                     = [aws_secretsmanager_secret_version.secret_version]
  username                       = local.credentials.username
  password                       = local.credentials.password
  project_id                     = mongodbatlas_project.mongodb_project.id
  auth_database_name             = local.credentials.username

  roles {
    role_name                    = var.mongodb_admin_role_name
    database_name                = var.mongodb_admin_database_name
  }

  labels {
    key                          = "${var.org_identifier}-${var.environment}-mongodb-roles}"
    value                        = "${var.org_identifier}-${var.environment}-${var.mongodb_admin_role_name}"
  }
}

/*
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

*/
