# 0. Organization identifier, project, environmental and creator  variables
org_identifier                            = "ps"
project_name                              = "mongodb-map-migration"
environment                               = "dev"
aws_region_name                           = "us-east-1"
creator                                   = "Terraform"

# 1. Project variables
mongodb_org_id                            = "5e53ff6d8be7552e2e723e7c"
mongodb_project_name                      = "mongodb-project-1"

# 2. Mongodb Atlas project maintenance window variables
day_of_week                               = 1
hour_of_day                               = 22

# 3. Credentials-related  variables i.e. variables for random password, secret random uuid, and AWS secret & secret version
random_password_length                    = 20
random_password_true                      = true
random_password_override_special          = "!#$&*()-_=[]{}<>:?"
recovery_window_in_days                   = 7
secret_description                        = "Pride Spider MongoDB Atlas Credentials"
secret_tag_value                          = "mongodb-atlas-credentials"
aws_secretsmanager_secret_name            = "mongodb-atlas-secret"
username                                  = "admin"

# 4. Mongodb Atlas database admin/master/super user variable
mongodb_admin_role_name                   = "readWriteAnyDatabase"
mongodb_admin_database_name               = "admin"

# 5. Mongodb Atlas cluster variables
cluster_names                             = ["regional-1", "regional-2", "regional-3", "central"]
cluster_type                              = "REPLICASET"
cloud_backup                              = true
auto_scaling_disk_gb_enabled              = true
auto_scaling_compute_enabled              = false
mongo_db_major_version                    = "5.0"
disk_size_gb                              = 10
provider_name                             = "AWS"
provider_instance_size_name               = "M10"
provider_volume_type                      = "STANDARD"
num_shards                                = 1
provider_region_names                     = ["US_EAST_1", "US_WEST_2", "EU_WEST_1", "US_WEST_2"] # length must equal length of "cluster_names" list
electable_nodes                           = 3
priority                                  = 7
read_only_nodes                           = 0
analytics_nodes                           = 0
javascript_enabled                        = false
minimum_enabled_tls_protocol              = "TLS1_2"
cluster_node_key                          = "node-name"
