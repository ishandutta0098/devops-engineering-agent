export const KUBERNETES_LOG = `2024-10-10T14:32:15.123Z [INFO] Starting deployment of myapp:v1.2.3
2024-10-10T14:32:15.456Z [INFO] Applying deployment configuration...
2024-10-10T14:32:15.789Z [INFO] Creating deployment myapp-deployment in namespace production
2024-10-10T14:32:16.012Z [INFO] Deployment created successfully
2024-10-10T14:32:16.234Z [INFO] Waiting for pods to be ready...
2024-10-10T14:32:16.567Z [WARNING] Pod myapp-deployment-7b8c9d5f4-abc12 is in Pending state
2024-10-10T14:32:17.890Z [ERROR] Pod myapp-deployment-7b8c9d5f4-abc12 failed to start
2024-10-10T14:32:18.123Z [ERROR] Event: Failed to pull image "myapp:v1.2.3": rpc error: code = Unknown desc = Error response from daemon: pull access denied for myapp, repository does not exist or may require 'docker login'
2024-10-10T14:32:18.456Z [ERROR] Pod myapp-deployment-7b8c9d5f4-abc12 status: ImagePullBackOff
2024-10-10T14:32:19.789Z [WARNING] Back-off pulling image "myapp:v1.2.3"
2024-10-10T14:32:20.012Z [ERROR] kubelet: Failed to pull image "myapp:v1.2.3": rpc error: code = Unknown desc = Error response from daemon: pull access denied for myapp, repository does not exist or may require 'docker login'
2024-10-10T14:32:21.345Z [ERROR] kubelet: Error syncing pod: ErrImagePull
2024-10-10T14:32:22.678Z [WARNING] Pod myapp-deployment-7b8c9d5f4-abc12 has been in ImagePullBackOff state for 5 seconds
2024-10-10T14:32:25.901Z [ERROR] Deployment rollout failed: deployment "myapp-deployment" exceeded its progress deadline
2024-10-10T14:32:26.234Z [ERROR] ReplicaSet myapp-deployment-7b8c9d5f4 has 0 ready replicas out of 3 desired
2024-10-10T14:32:26.567Z [INFO] Current deployment status: 0/3 pods ready
2024-10-10T14:32:27.890Z [WARNING] Deployment health check failed: no healthy pods found
2024-10-10T14:32:28.123Z [ERROR] Service myapp-service has no available endpoints
2024-10-10T14:32:29.456Z [CRITICAL] Production deployment failed - rollback initiated
2024-10-10T14:32:30.789Z [INFO] Rolling back to previous version myapp:v1.2.2
2024-10-10T14:32:31.012Z [INFO] Rollback completed successfully`;

export const DATABASE_LOG = `2024-10-10T09:15:23.456Z [INFO] Application startup initiated
2024-10-10T09:15:23.789Z [INFO] Loading configuration from /app/config/production.yaml
2024-10-10T09:15:24.012Z [INFO] Initializing database connection pool
2024-10-10T09:15:24.345Z [INFO] Database host: postgres-prod.cluster-xyz.us-west-2.rds.amazonaws.com:5432
2024-10-10T09:15:24.678Z [INFO] Database name: ecommerce_prod
2024-10-10T09:15:24.901Z [INFO] Connection pool size: 20
2024-10-10T09:15:25.234Z [WARNING] Attempting to connect to database...
2024-10-10T09:15:30.567Z [ERROR] Database connection failed: FATAL: password authentication failed for user "app_user"
2024-10-10T09:15:30.890Z [ERROR] Connection attempt 1/5 failed, retrying in 5 seconds...
2024-10-10T09:15:35.123Z [ERROR] Database connection failed: FATAL: password authentication failed for user "app_user"
2024-10-10T09:15:35.456Z [ERROR] Connection attempt 2/5 failed, retrying in 10 seconds...
2024-10-10T09:15:45.789Z [ERROR] Database connection failed: FATAL: password authentication failed for user "app_user"
2024-10-10T09:15:45.012Z [ERROR] Connection attempt 3/5 failed, retrying in 15 seconds...
2024-10-10T09:16:00.345Z [ERROR] Database connection failed: FATAL: password authentication failed for user "app_user"
2024-10-10T09:16:00.678Z [ERROR] Connection attempt 4/5 failed, retrying in 20 seconds...
2024-10-10T09:16:20.901Z [ERROR] Database connection failed: FATAL: password authentication failed for user "app_user"
2024-10-10T09:16:21.234Z [CRITICAL] All database connection attempts failed (5/5)
2024-10-10T09:16:21.567Z [ERROR] Unable to initialize application: database connection pool creation failed
2024-10-10T09:16:21.890Z [ERROR] Health check endpoint returning 503 Service Unavailable
2024-10-10T09:16:22.456Z [ERROR] Application startup failed - exiting with code 1
2024-10-10T09:16:23.345Z [INFO] Application shutdown complete`;

export const CRON_LOG = `2024-10-10T09:01:22.001Z [INFO] Cron job 'scheduled-cleanup' started
2024-10-10T09:01:22.412Z [INFO] Connecting to database postgres-prod...
2024-10-10T09:01:23.118Z [INFO] Database connection established
2024-10-10T09:01:23.230Z [INFO] Querying records older than 30 days
2024-10-10T09:01:24.880Z [INFO] Query completed
2024-10-10T09:01:25.014Z [INFO] 0 records processed
2024-10-10T09:01:25.401Z [INFO] Disk usage: 94% on /var/lib/postgresql/data
2024-10-10T09:01:26.105Z [INFO] Releasing database connection
2024-10-10T09:01:26.812Z [INFO] Cron job duration: 4.811s
2024-10-10T09:01:27.005Z [INFO] Cron job 'scheduled-cleanup' completed successfully
2024-10-10T09:01:27.221Z [INFO] Exit code: 0`;

export const LOG_FILES = {
  kubernetes: {
    file: "kubernetes_deployment_error.log",
    content: KUBERNETES_LOG,
  },
  database: {
    file: "database_connection_error.log",
    content: DATABASE_LOG,
  },
  cron: {
    file: "cron_silent_failure.log",
    content: CRON_LOG,
  },
} as const;
