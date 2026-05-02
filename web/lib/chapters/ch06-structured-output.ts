import type { ChapterDef } from "../schema";
import { KUBERNETES_LOG, DATABASE_LOG, CRON_LOG } from "../log-files";

export const ch06: ChapterDef = {
  slug: "structured-output",
  number: 7,
  phase: "Notebook 02",
  title: "Structured Output",
  subtitle: "Force the agent to return typed, validated data using Pydantic models",
  intro:
    "Notebook 02 starts hardening the working pipeline by replacing fragile free text with typed data. With output_pydantic on a Task, CrewAI forces the LLM to return valid JSON matching your schema — giving you typed fields you can access directly.",
  takeaway:
    "Structured output transforms agent output from a string you have to parse into a typed object you can use directly. report.primary_issue beats regex-parsing a wall of markdown every time.",
  examples: [
    {
      id: "kubernetes",
      title: "Kubernetes ImagePullBackOff",
      summary:
        "output_pydantic=LogAnalysisReport on the K8s log. The agent must return strict JSON with primary_issue, root_cause, errors, affected_components, and timeline.",
      file: "kubernetes_deployment_error.log",
      logFile: KUBERNETES_LOG,
      result: {
        label: "Pydantic LogAnalysisReport · K8s",
        description: "Strict JSON artifact for the K8s rollout failure",
        log: [
          { tag: "BOOT", text: "Initializing crew with Pydantic output" },
          { tag: "INFO", text: "output_pydantic: LogAnalysisReport" },
          { tag: "INFO", text: "Input: kubernetes_deployment_error.log" },
          { tag: "INFO", text: "Artifact: task_outputs/log_analysis.json" },
          { tag: "PROCESS", text: "LLM constrained to schema..." },
          { tag: "OK", text: "Output validated against schema" },
        ],
        output: `task_outputs/log_analysis.json

{
  "primary_issue": "Production deployment failed due to ImagePullBackOff",
  "root_cause": "Image myapp:v1.2.3 not found or registry credentials missing",
  "errors": [
    "Failed to pull image myapp:v1.2.3: pull access denied",
    "Pod status: ImagePullBackOff",
    "Deployment rollout failed: exceeded progress deadline",
    "Production deployment failed - rollback initiated"
  ],
  "affected_components": [
    "Pod: myapp-deployment-7b8c9d5f4-abc12",
    "Deployment: myapp-deployment",
    "Service: myapp-service"
  ],
  "timeline": [
    "14:32:15 - Deployment of myapp:v1.2.3 started",
    "14:32:18 - Image pull access denied",
    "14:32:25 - Deployment deadline exceeded",
    "14:32:29 - Rollback initiated"
  ]
}`,
      },
    },
    {
      id: "database",
      title: "Postgres FATAL auth",
      summary:
        "Same Pydantic schema, applied to a Postgres outage log. The shape is identical — only the field values change.",
      file: "database_connection_error.log",
      logFile: DATABASE_LOG,
      result: {
        label: "Pydantic LogAnalysisReport · DB",
        description: "Same schema, fields filled from the DB log",
        log: [
          { tag: "BOOT", text: "Initializing crew with Pydantic output" },
          { tag: "INFO", text: "output_pydantic: LogAnalysisReport" },
          { tag: "INFO", text: "Input: database_connection_error.log" },
          { tag: "INFO", text: "Artifact: task_outputs/log_analysis.json" },
          { tag: "PROCESS", text: "LLM constrained to schema..." },
          { tag: "OK", text: "Output validated against schema" },
        ],
        output: `task_outputs/log_analysis.json

{
  "primary_issue": "Application startup failed — database connection pool could not authenticate",
  "root_cause": "Invalid credentials for user 'app_user' against postgres-prod",
  "errors": [
    "FATAL: password authentication failed for user 'app_user' (attempt 1/5)",
    "FATAL: password authentication failed for user 'app_user' (attempt 5/5)",
    "All database connection attempts failed (5/5)",
    "Health check endpoint returning 503 Service Unavailable"
  ],
  "affected_components": [
    "Application instance",
    "Database: postgres-prod.cluster-xyz.us-west-2.rds.amazonaws.com",
    "Load balancer (instance marked unhealthy)"
  ],
  "timeline": [
    "09:15:23 - Application startup initiated",
    "09:15:30 - First auth failure (root cause)",
    "09:16:21 - All 5 attempts exhausted",
    "09:16:22 - Process exited with code 1"
  ]
}`,
      },
    },
    {
      id: "cron",
      title: "Cron silent failure",
      summary:
        "Without a guardrail, the LLM happily returns a syntactically-valid JSON with errors=[]. The schema is satisfied, but the content is wrong — exactly the gap the next chapter closes.",
      file: "cron_silent_failure.log",
      logFile: CRON_LOG,
      result: {
        label: "Pydantic LogAnalysisReport · cron",
        description: "Valid schema, empty errors — content is unsafe (next chapter)",
        log: [
          { tag: "BOOT", text: "Initializing crew with Pydantic output" },
          { tag: "INFO", text: "output_pydantic: LogAnalysisReport" },
          { tag: "INFO", text: "Input: cron_silent_failure.log" },
          { tag: "PROCESS", text: "Agent finds no ERROR / CRITICAL entries" },
          { tag: "WARN", text: "Schema is satisfied even though errors list is empty" },
          { tag: "OK", text: "Output validated against schema (content unsafe)" },
        ],
        output: `task_outputs/log_analysis.json

{
  "primary_issue": "No critical issues found",
  "root_cause": "Cron job completed with exit code 0",
  "errors": [],
  "affected_components": [
    "Cron job: scheduled-cleanup"
  ],
  "timeline": [
    "09:01:22 - Cron job started",
    "09:01:27 - Cron job completed successfully"
  ]
}

The schema is satisfied even with errors=[], so the agent returned
a happy report despite the suspicious "0 records processed" and
"94% disk" lines. Structured output guarantees the SHAPE of the
report. The CONTENT still needs a guardrail — that's the next chapter.`,
      },
    },
  ],
  demos: [
    {
      id: "raw-vs-structured",
      question: "Raw text vs Pydantic model — what's the difference?",
      controlLabel: "Output Format",
      options: [
        {
          key: "raw",
          label: "Raw Text (no schema)",
          description: "Agent returns free-form markdown — hard to parse programmatically",
        },
        {
          key: "pydantic",
          label: "Pydantic Model (LogAnalysisReport)",
          description: "Agent returns typed JSON matching the exact schema",
        },
      ],
      defaultLeft: "raw",
      defaultRight: "pydantic",
      variants: {
        raw: {
          label: "Raw Text Output",
          description: "Free-form text — unreliable to parse",
          log: [
            { tag: "BOOT", text: "Initializing crew with raw text output" },
            { tag: "INFO", text: "output_pydantic: None" },
            { tag: "PROCESS", text: "Agent analyzing logs..." },
            { tag: "OK", text: "Raw text output generated" },
          ],
          output: `The main issue is that the deployment failed because the Docker image 
could not be pulled. The image "myapp:v1.2.3" either doesn't exist or 
requires authentication.

Errors found:
- Failed to pull image
- ImagePullBackOff
- Deployment exceeded deadline

The affected components are the pod, deployment, and service.

To access this data programmatically you'd need to parse free text — 
fragile and unreliable.`,
        },
        pydantic: {
          label: "Pydantic Structured Output",
          description: "Typed JSON matching LogAnalysisReport schema",
          log: [
            { tag: "BOOT", text: "Initializing crew with Pydantic output" },
            { tag: "INFO", text: "output_pydantic: LogAnalysisReport" },
            { tag: "INFO", text: "Artifact: task_outputs/log_analysis.json" },
            { tag: "PROCESS", text: "Agent analyzing logs..." },
            { tag: "PROCESS", text: "LLM constrained to return valid JSON schema..." },
            { tag: "OK", text: "Structured output validated against schema" },
          ],
          output: `task_outputs/log_analysis.json

{
  "primary_issue": "Production deployment failed due to ImagePullBackOff",
  "root_cause": "Image myapp:v1.2.3 not found or registry credentials missing",
  "errors": [
    "Failed to pull image myapp:v1.2.3: pull access denied",
    "Pod status: ImagePullBackOff",
    "Deployment rollout failed: exceeded progress deadline",
    "Production deployment failed - rollback initiated"
  ],
  "affected_components": [
    "Pod: myapp-deployment-7b8c9d5f4-abc12",
    "Deployment: myapp-deployment",
    "Service: myapp-service"
  ],
  "timeline": [
    "14:32:15 - Deployment started",
    "14:32:16 - Pod entered Pending state",
    "14:32:17 - Pod failed to start",
    "14:32:18 - Image pull access denied (root cause)",
    "14:32:25 - Deployment deadline exceeded",
    "14:32:29 - Rollback initiated"
  ]
}`,
        },
      },
    },
  ],
  agentConfig: {
    role: "DevOps Log Analyzer",
    goal: "Analyze log files and produce structured analysis reports",
    backstory:
      "You are a senior DevOps engineer who produces machine-readable analysis reports.",
  },
};
