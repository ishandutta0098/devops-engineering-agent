import type { ChapterDef } from "../schema";
import { KUBERNETES_LOG, DATABASE_LOG, CRON_LOG } from "../log-files";

const KUBERNETES_LOG_PREVIEW = KUBERNETES_LOG.split("\n").slice(0, 8).join("\n") + "\n  ... 13 more lines ...";

export const ch04: ChapterDef = {
  slug: "tools",
  number: 3,
  phase: "Notebook 01",
  title: "Adding Tools",
  subtitle: "Give agents real-world capabilities with FileReadTool",
  intro:
    "Without tools, agents can only work with data you paste into the task description. The FileReadTool lets the agent open a file from disk on its own — the difference between a chat assistant and an autonomous worker.",
  takeaway:
    "Tools transform agents from text processors into autonomous workers. Without FileReadTool, the agent never even sees the log. With it, the same agent reads the file from disk and produces a real analysis.",
  examples: [
    {
      id: "kubernetes",
      title: "Kubernetes ImagePullBackOff",
      summary:
        "FileReadTool loads the K8s log from disk so the agent can actually see ImagePullBackOff and the rollback cascade.",
      file: "kubernetes_deployment_error.log",
      logFile: KUBERNETES_LOG,
      result: {
        label: "FileReadTool · K8s",
        description: "Reads the K8s log and analyses the dominant error",
        log: [
          { tag: "BOOT", text: "Initializing agent: DevOps Log Analyzer" },
          { tag: "INFO", text: "Tools: [FileReadTool]" },
          { tag: "PROCESS", text: "FileReadTool('kubernetes_deployment_error.log')" },
          { tag: "INFO", text: "Read 21 lines from log file" },
          { tag: "PROCESS", text: "Scanning ERROR / CRITICAL entries..." },
          { tag: "OK", text: "FileReadTool-driven analysis complete" },
        ],
        output: `# FileReadTool Analysis · K8s

## Read from disk (FileReadTool)
kubernetes_deployment_error.log — 21 lines

## Dominant error
Failed to pull image "myapp:v1.2.3": pull access denied → ImagePullBackOff

## Cascade
ImagePullBackOff → progress deadline exceeded → 0/3 ready replicas →
service has no endpoints → rollback to v1.2.2.

## Recommendation
1. Verify the image exists: docker manifest inspect myapp:v1.2.3
2. Refresh / create the imagePullSecret on the ServiceAccount
3. Re-run the rollout once the secret is patched`,
      },
    },
    {
      id: "database",
      title: "Postgres FATAL auth",
      summary:
        "Same FileReadTool, applied to a Postgres connection log. The agent reads the file and traces the auth-failure cascade to the 503.",
      file: "database_connection_error.log",
      logFile: DATABASE_LOG,
      result: {
        label: "FileReadTool · DB",
        description: "Reads the DB log and identifies the FATAL auth pattern",
        log: [
          { tag: "BOOT", text: "Initializing agent: DevOps Log Analyzer" },
          { tag: "INFO", text: "Tools: [FileReadTool]" },
          { tag: "PROCESS", text: "FileReadTool('database_connection_error.log')" },
          { tag: "INFO", text: "Read 21 lines from log file" },
          { tag: "PROCESS", text: "Scanning FATAL / ERROR entries..." },
          { tag: "OK", text: "FileReadTool-driven analysis complete" },
        ],
        output: `# FileReadTool Analysis · Postgres

## Read from disk (FileReadTool)
database_connection_error.log — 21 lines

## Dominant error
FATAL: password authentication failed for user "app_user" (×5 attempts)

## Cascade
Auth failure × 5 → connection pool init failed → /healthz 503 →
load balancer marks instance unhealthy → process exit 1.

## Recommendation
1. Confirm the in-cluster secret matches the DB password
2. Rotate the credential and re-apply the secret
3. Roll the deployment so pods pick up the new secret`,
      },
    },
    {
      id: "cron",
      title: "Cron silent failure",
      summary:
        "FileReadTool still loads the file, even when no errors are logged. The agent has to read between the INFO lines to find the soft signals.",
      file: "cron_silent_failure.log",
      logFile: CRON_LOG,
      result: {
        label: "FileReadTool · cron",
        description: "Reads an all-INFO log and surfaces the soft signals",
        log: [
          { tag: "BOOT", text: "Initializing agent: DevOps Log Analyzer" },
          { tag: "INFO", text: "Tools: [FileReadTool]" },
          { tag: "PROCESS", text: "FileReadTool('cron_silent_failure.log')" },
          { tag: "INFO", text: "Read 11 lines — no ERROR / CRITICAL entries" },
          { tag: "PROCESS", text: "Looking deeper at INFO line semantics..." },
          { tag: "OK", text: "FileReadTool-driven analysis complete" },
        ],
        output: `# FileReadTool Analysis · Cron

## Read from disk (FileReadTool)
cron_silent_failure.log — 11 lines, all INFO

## Soft signals
- 0 records processed — cleanup matched nothing
- Disk usage: 94% on /var/lib/postgresql/data — over safe threshold

## Take
The exit code is 0, but the operational signal says the next run will
likely fail. Without FileReadTool the agent never sees these lines.`,
      },
    },
  ],
  demos: [
    {
      id: "tools-impact",
      question: "Same input file, same agent. What does the FileReadTool unlock?",
      controlLabel: "Tool Configuration",
      inputFile: {
        filename: "kubernetes_deployment_error.log",
        preview: KUBERNETES_LOG_PREVIEW,
      },
      options: [
        {
          key: "no-tools",
          label: "No Tools",
          description: "Agent has no way to open the file on disk",
        },
        {
          key: "file-read",
          label: "FileReadTool",
          description: "Agent can read log files from disk autonomously",
        },
      ],
      defaultLeft: "no-tools",
      defaultRight: "file-read",
      variants: {
        "no-tools": {
          label: "No Tools — agent cannot read the file",
          description: "The file path is in the task, but the agent has no way to open it",
          log: [
            { tag: "BOOT", text: "Initializing agent: DevOps Log Analyzer" },
            { tag: "INFO", text: "Tools: []" },
            { tag: "INFO", text: "Task input: kubernetes_deployment_error.log" },
            { tag: "PROCESS", text: "Agent attempts to access the file path..." },
            { tag: "ERROR", text: "Cannot read file: agent has no FileReadTool" },
            { tag: "ERROR", text: "Iteration 1/3 failed — no tool to open kubernetes_deployment_error.log" },
            { tag: "ERROR", text: "Iteration 2/3 failed — agent retries with the same missing tool" },
            { tag: "ERROR", text: "Iteration 3/3 failed — exhausted retries" },
            { tag: "WARN", text: "Task aborted — analysis not produced" },
          ],
          output: `# Run aborted

Tools attached: []
Task input: kubernetes_deployment_error.log

The agent had a file path in its task description, but no tool that could
actually open the file. Each iteration ended the same way:

  ERROR  FileReadTool not available — cannot read kubernetes_deployment_error.log

After 3 iterations the run was aborted. No analysis, no root cause,
no recommendation — because the agent never saw the contents of the log.`,
        },
        "file-read": {
          label: "FileReadTool — agent reads and analyses the file",
          description: "Same agent, same file. With FileReadTool it actually opens the log.",
          log: [
            { tag: "BOOT", text: "Initializing agent: DevOps Log Analyzer" },
            { tag: "INFO", text: "Tools: [FileReadTool]" },
            { tag: "INFO", text: "Task input: kubernetes_deployment_error.log" },
            { tag: "PROCESS", text: "FileReadTool('kubernetes_deployment_error.log')" },
            { tag: "INFO", text: "Read 21 lines from kubernetes_deployment_error.log" },
            { tag: "PROCESS", text: "Scanning ERROR / CRITICAL entries..." },
            { tag: "PROCESS", text: "Building the failure timeline..." },
            { tag: "OK", text: "Analysis complete in 2 iterations" },
          ],
          output: `# Analysis (FileReadTool)
Read 21 lines from kubernetes_deployment_error.log

## Primary Issue
Production deployment of myapp:v1.2.3 failed — pods stuck in ImagePullBackOff.

## Root Cause
The container runtime could not pull myapp:v1.2.3:
"pull access denied for myapp, repository does not exist or may require 'docker login'"
Either the tag is missing from the registry, or the cluster has no valid imagePullSecret.

## Cascade
ImagePullBackOff → progressDeadlineSeconds exceeded → 0/3 ready replicas
→ Service has no endpoints → rollback to v1.2.2.

## Recommendation
1. Verify the tag exists: docker manifest inspect myapp:v1.2.3
2. Check the cluster's imagePullSecrets on the ServiceAccount
3. Re-run the rollout once the secret is patched`,
        },
      },
    },
  ],
  agentConfig: {
    role: "DevOps Log Analyzer",
    goal: "Analyze log files and find solutions for identified issues",
    backstory:
      "You are a senior DevOps engineer who uses tools to read files and research solutions.",
  },
};
