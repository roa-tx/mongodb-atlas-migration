# MongoDB Migration

This repo contains source codes for the migration of **On-Prem** and **Other Cloud Providers'** MongoDB Servers to MongoDB Atlas DBaaS on **AWS**. These include:


## Terraform (TF) Module.
Terraform template for the deployment of:
1. MongoDB Atlas Projects and Project Maintenance Windows.
2. MongoDB Atlas Clusters.
3. MongoDB Atlas Database Users.

## Node.js Module.
The module implements MigrateMongoDB.js class for:
1. Connecting to and disconnecting from MongoDB databases.
2. Migrating (Dumping & Restoring) MongoDB databases via mongodump and mongorestore.
3. Files transfer to and from S3 buckets.
4. Saving objects to file.
5. Running queries against MongoDB databases.
6. Validation of MongoDB databases.

---
<br>
<strong> Copyright © 2021 roa-tx. All Rights Reserved. </strong>
