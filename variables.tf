# 0. Organization identifier, project, environmental and creator  variables
variable "org_identifier" {
  type = string
}

variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "aws_region_name" {
  type = string
}

variable "creator" {
  description = "creator of the resource(s): could be e-mail address of creator or simply Terraform."
  type = string
}


# 1. Mongodb Atlas project variables
variable "mongodb_org_id" {
  type = string
}

variable "mongodb_project_name" {
  type = string
}


# 2.  Mongodb Atlas project maintenance window variables
variable "day_of_week" {
  description = "Day of the week to start maintenance window: S=1, M=2, T=3, W=4, T=5, F=6, S=7."
  type = number
}

variable "hour_of_day" {
  description = "Hour of the day to start maintenance window: 24-hour clock (UTC/GMT time zone), midnight=0, noon=12."
  type = number
}



# 3. Credentials-related  variables i.e. variables for random password, secret random uuid, and AWS secret & secret version
variable "random_password_length" {
  type = number
}

variable "random_password_true" {
  type = bool
}

variable "random_password_override_special" {
  description = "A customized list of random special characters to be included in the password. The list overides the default special characters."
  type  = string
}

variable "recovery_window_in_days" {
  type = number
}

variable "secret_description" {
  type = string
}

variable "secret_tag_value" {
  type = string
}

variable "aws_secretsmanager_secret_name" {
  type = string
}

variable "username" {
  type = string
}


# 4. Mongodb Atlas admin database user variables
variable "mongodb_admin_role_name" {
  type = string
}

variable "mongodb_admin_database_name" {
  type = string
}


# 5. The 3 regional Mongodb Atlas clusters variables
variable "regional_cluster_names" {
 type = list(string)
}

variable "cluster_type" {
 type = string
}

variable "cloud_backup" {
  type = bool
}

variable "auto_scaling_disk_gb_enabled" {
  type = bool
}

variable "auto_scaling_compute_enabled" {
  type = bool
}

variable "mongo_db_major_version" {
  type = string
}

variable "disk_size_gb" {
 type = number
}

variable "provider_name" {
 type = string
}

variable "provider_instance_size_name" {
 type = string
}

variable "provider_volume_type" {
 type = string
}

variable "num_shards" {
 type = number
}

variable "provider_region_names" {
  type = list(string)
}

variable "javascript_enabled" {
 type = bool
}

variable "minimum_enabled_tls_protocol" {
 type = string
}

variable "cluster_node_key" {
 type = string
}


# 6. The Central Mongodb Atlas cluster specific variables
variable "central_cluster_name" {
 type = string
}

variable "central_auto_scaling_compute_enabled" {
 type = bool
}

variable "central_provider_instance_size_name" {
 type = string
}

variable "central_provider_auto_scaling_compute_min_instance_size" {
 type = string
}

variable "central_provider_auto_scaling_compute_max_instance_size" {
 type = string
}

variable "central_one_provider_region_name" {
 type = string
}

variable "central_two_provider_region_name" {
 type = string
}

variable "central_three_provider_region_name" {
 type = string
}
