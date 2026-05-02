import type { ChapterDef } from "../schema";
import { KUBERNETES_LOG, DATABASE_LOG, CRON_LOG } from "../log-files";

export const ch02: ChapterDef = {
  slug: "first-task",
  number: 2,
  phase: "Notebook 01",
  title: "Your First Task",
  subtitle: "Give your agent a specific job with a description and expected output",
  intro:
    "Notebook 01 next turns the agent into useful work with a Task. A Task tells the agent exactly what to do and what to produce. The expected_output field is especially powerful — the more specific you make it, the more structured and useful the result.",
  takeaway:
    "The expected_output field is your strongest lever for controlling output quality. Vague instructions produce vague results. Specific structure produces specific, actionable analysis.",
  examples: [
    {
      id: "kubernetes",
      title: "Kubernetes ImagePullBackOff",
      summary:
        "Same 5-section structured task — primary issue, errors, timeline, root cause, components — applied to a Kubernetes rollout failure.",
      file: "kubernetes_deployment_error.log",
      logFile: KUBERNETES_LOG,
      result: {
        label: "Structured task · K8s rollout",
        description: "expected_output forces a sectioned incident report",
        log: [
          { tag: "BOOT", text: "Initializing crew with 1 agent, 1 task" },
          { tag: "INFO", text: "Task: Analyze kubernetes_deployment_error.log" },
          { tag: "INFO", text: "Expected output: 5-section report (issue/errors/timeline/cause/components)" },
          { tag: "PROCESS", text: "Extracting timeline..." },
          { tag: "PROCESS", text: "Mapping affected components..." },
          { tag: "OK", text: "Structured report generated" },
        ],
        output: `# Deployment Failure Analysis

## Primary Issue
myapp-deployment failed to roll out — pods stuck in ImagePullBackOff and rollback was triggered.

## Key Errors
- Failed to pull image "myapp:v1.2.3": pull access denied
- Pod status: ImagePullBackOff (back-off pulling image)
- Deployment rollout failed: exceeded progress deadline
- Service myapp-service has no available endpoints

## Timeline
1. 14:32:15 — Deployment of myapp:v1.2.3 started
2. 14:32:17 — Pod failed to start
3. 14:32:18 — Image pull denied (ROOT CAUSE)
4. 14:32:25 — Progress deadline exceeded
5. 14:32:29 — Rollback initiated
6. 14:32:31 — Rolled back to myapp:v1.2.2

## Root Cause
Image myapp:v1.2.3 is missing from the registry, or imagePullSecrets are not configured.

## Affected Components
- Pod: myapp-deployment-7b8c9d5f4-abc12
- Deployment: myapp-deployment
- Service: myapp-service`,
      },
    },
    {
      id: "database",
      title: "Postgres FATAL auth",
      summary:
        "The same task definition produces the same shape on a totally different log — proving structure travels with the task, not the input.",
      file: "database_connection_error.log",
      logFile: DATABASE_LOG,
      result: {
        label: "Structured task · DB outage",
        description: "Same expected_output schema, applied to a DB log",
        log: [
          { tag: "BOOT", text: "Initializing crew with 1 agent, 1 task" },
          { tag: "INFO", text: "Task: Analyze database_connection_error.log" },
          { tag: "INFO", text: "Expected output: 5-section report" },
          { tag: "PROCESS", text: "Extracting auth-failure timeline..." },
          { tag: "OK", text: "Structured report generated" },
        ],
        output: `# Database Outage Analysis

## Primary Issue
Application failed to start — database connection pool could not be initialized.

## Key Errors
- FATAL: password authentication failed for user "app_user" (×5)
- All database connection attempts failed (5/5)
- Unable to initialize application: connection pool creation failed
- Health check endpoint returning 503 Service Unavailable

## Timeline
1. 09:15:23 — Application startup initiated
2. 09:15:25 — First connect attempt to postgres-prod
3. 09:15:30 — Auth failure 1/5 (ROOT CAUSE)
4. 09:16:21 — Auth failure 5/5, all attempts exhausted
5. 09:16:21 — Health endpoint switched to 503
6. 09:16:22 — Process exited with code 1

## Root Cause
The credentials configured for app_user are invalid against postgres-prod — likely an expired or unrotated secret.

## Affected Components
- Application instance (startup failed)
- Database: postgres-prod.cluster-xyz (unreachable with current creds)
- Load balancer (instance marked unhealthy)`,
      },
    },
    {
      id: "cron",
      title: "Cron silent failure",
      summary:
        "When the log has no errors, a vague task happily reports \"no issues\". The structured task forces the agent to fill every section anyway — exposing the suspicious 0 records / 94% disk lines.",
      file: "cron_silent_failure.log",
      logFile: CRON_LOG,
      result: {
        label: "Structured task · silent cron",
        description: "Required sections force the agent to surface anomalies",
        log: [
          { tag: "BOOT", text: "Initializing crew with 1 agent, 1 task" },
          { tag: "INFO", text: "Task: Analyze cron_silent_failure.log" },
          { tag: "INFO", text: "Expected output: 5-section report (must populate every section)" },
          { tag: "PROCESS", text: "No ERRORs — looking at INFO semantics..." },
          { tag: "OK", text: "Structured report generated" },
        ],
        output: `# Cron Job Run Analysis

## Primary Issue
Job exit code is 0, but the run is anomalous and should be treated as a soft failure.

## Key Errors
- (no ERROR-level entries — task forces us to record observed anomalies instead)
- "0 records processed" — cleanup matched nothing
- "Disk usage: 94% on /var/lib/postgresql/data" — over safe threshold

## Timeline
1. 09:01:22 — Cron job 'scheduled-cleanup' started
2. 09:01:23 — DB connection established
3. 09:01:25 — Query returned 0 rows (ANOMALY)
4. 09:01:25 — Disk reported at 94% (WARNING)
5. 09:01:27 — Job reported success (MISLEADING)

## Root Cause
Either the cleanup query is no longer matching the right rows, or the dataset really is empty — combined with disk almost full.

## Affected Components
- Cron job: scheduled-cleanup
- Database: postgres-prod
- Disk: /var/lib/postgresql/data (94% utilized)`,
      },
    },
  ],
  demos: [
    {
      id: "expected-output-quality",
      question: "How does the expected_output detail affect result quality?",
      controlLabel: "Expected Output Spec",
      options: [
        {
          key: "vague",
          label: "Vague: 'A report'",
          description: "Minimal instruction — just asks for a report",
        },
        {
          key: "detailed",
          label: "Detailed: 5-section structure",
          description: "Specifies exactly what sections and content to include",
        },
      ],
      defaultLeft: "vague",
      defaultRight: "detailed",
      variants: {
        vague: {
          label: "Simple expected_output",
          description: "A one-liner that gives the agent almost nothing to aim for",
          paramSnippet: `expected_output = "Primary issue description"`,
          log: [
            { tag: "BOOT", text: "Initializing crew with 1 agent, 1 task" },
            { tag: "INFO", text: "Task: Analyze logs" },
            { tag: "INFO", text: 'Expected output: "Primary issue description"' },
            { tag: "PROCESS", text: "Agent processing task..." },
            { tag: "OK", text: "Task complete" },
          ],
          output: `There are errors in the deployment logs. The main issue is that the Docker image could not be pulled. This caused the pods to fail and the deployment was rolled back. You should fix the image reference and try deploying again.`,
        },
        detailed: {
          label: "Detailed expected_output",
          description: "A multi-section spec the agent has to fill out completely",
          paramSnippet: `expected_output = """A detailed analysis report containing:
    - Primary issue description
    - Key error messages and codes
    - Timeline of failure events
    - Root cause analysis
    - Affected components"""`,
          log: [
            { tag: "BOOT", text: "Initializing crew with 1 agent, 1 task" },
            { tag: "INFO", text: "Task: Analyze Kubernetes deployment logs" },
            { tag: "INFO", text: "Expected output: structured report with 5 sections" },
            { tag: "PROCESS", text: "Agent reading log data..." },
            { tag: "PROCESS", text: "Extracting error timeline..." },
            { tag: "PROCESS", text: "Identifying affected components..." },
            { tag: "PROCESS", text: "Performing root cause analysis..." },
            { tag: "OK", text: "Structured report generated" },
          ],
          output: `# Deployment Failure Analysis

## Primary Issue
Production deployment of myapp-deployment failed due to container image pull failure.

## Key Error Messages
- Failed to pull image "myapp:v1.2.3": pull access denied
- Pod status: ImagePullBackOff
- Deployment rollout failed: exceeded progress deadline

## Timeline of Events
1. 14:32:15 — Deployment initiated
2. 14:32:16 — Pod entered Pending state
3. 14:32:17 — Pod failed to start
4. 14:32:18 — Image pull denied (ROOT CAUSE)
5. 14:32:25 — Deployment deadline exceeded
6. 14:32:26 — Service endpoints unavailable
7. 14:32:29 — Rollback initiated

## Root Cause Analysis
The image myapp:v1.2.3 could not be pulled from the registry. This is likely due to:
- Incorrect image tag
- Missing registry credentials
- Private registry without imagePullSecrets configured

## Affected Components
- Pod: myapp-deployment-7b8c9d5f4-abc12
- Deployment: myapp-deployment
- Service: myapp-service`,
        },
      },
    },
  ],
  agentConfig: {
    role: "DevOps Log Analyzer",
    goal: "Analyze log files to identify and extract specific issues, errors, and failure patterns",
    backstory:
      "You are a senior DevOps engineer with 10 years of experience in analyzing production logs.",
  },
};
