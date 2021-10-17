# Migration to MongoDB Atlas

This repo contains the source codes for the migration of MongoDB Servers (**on-prem** or in the **cloud**) to MongoDB Atlas **DBaaS** on **AWS**. These include:


## Terraform (TF) Module.
Terraform module for the deployment of:
1. MongoDB Atlas Project.
2. MongoDB Atlas Project Maintenance Window.
3. Admin Credentials, and AWS Secret Manager's Secret and Secret Version for credential storage.
4. MongoDB Atlas Admin Database User (Credential in (3) above is assigned to the database user).
5. MongoDB Atlas Clusters.


## Node.js Module.
The module implements MigrateMongoDB.js class for:
1. Connecting to and disconnecting from MongoDB databases.
2. Dumping and Restoring MongoDB databases via mongodump and mongorestore utilities.
3. Transferring file to, and from, S3 buckets.
4. Running queries against MongoDB databases.
5. Validating MongoDB databases.

---
<br>
<strong> Copyright © 2021 roa-tx. All Rights Reserved. </strong>
