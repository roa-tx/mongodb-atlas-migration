# MongoDB Migration

This repo contains source codes for the migration of **On-Prem** and **Other Cloud Providers'** MongoDB Servers to MongoDB Atlas DBaaS on **AWS**. These include:


## Terraform (TF) Module.
Terraform template for the deployment of:
1. MongoDB Atlas Project. 
2. MongoDB Atlas Project Maintenance Window.
3. Admin/Master/Super Credentials & AWS Secret Manager's Secret and Secret Version for credential storage.
4. MongoDB Atlas Database Admin/Master/Super User  (Credential in (3) above is assigned to the DB user).
5. MongoDB Atlas Clusters


## Node.js Module.
The module implements MigrateMongoDB.js class for:
1. Connecting to and disconnecting from MongoDB databases.
2. Dumping and Restoring MongoDB databases via mongodump and mongorestore utilities.
3. Transferring file to, and from, S3 buckets.
4. Saving objects to file.
5. Running queries against MongoDB databases.
6. Validating MongoDB databases.

---
<br>
<strong> Copyright © 2021 roa-tx. All Rights Reserved. </strong>
