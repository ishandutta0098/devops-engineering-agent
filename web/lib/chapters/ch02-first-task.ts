import type { ChapterDef } from "../schema";

export const ch02: ChapterDef = {
  slug: "first-task",
  number: 2,
  title: "Your First Task",
  subtitle: "Give your agent a specific job with a description and expected output",
  objective:
    "Learn how a Task is the unit of work — it tells the agent what to do and what to produce.",
  concepts: [
    {
      id: "description",
      title: "Task Description",
      description:
        "The detailed instruction for the agent. You can embed data directly in the description string.",
      code: `analyze_task = Task(
    description=f"Analyze the following log data to identify issues:\\n{LOG_INPUT}",
    expected_output="""A detailed analysis report containing:
    - Primary issue description
    - Key error messages and codes
    - Timeline of failure events
    - Root cause analysis
    - Affected components""",
    agent=log_analyzer,
)`,
    },
    {
      id: "expected-output",
      title: "Expected Output",
      description:
        "Tells the LLM what format and content you want back. The more specific, the better the result.",
      code: `expected_output="""A detailed analysis report containing:
    - Primary issue description
    - Key error messages and codes
    - Timeline of failure events
    - Root cause analysis
    - Affected components"""`,
    },
  ],
  inputSchema: [
    {
      key: "log_data",
      label: "Log Data",
      kind: "textarea",
      rows: 8,
      placeholder: "[2024-01-15 14:32:15.123] INFO: Starting deployment...",
    },
    {
      key: "expected_output",
      label: "Expected Output Format",
      kind: "textarea",
      rows: 3,
      placeholder: "A detailed analysis report containing...",
    },
  ],
  fixtures: {
    baseline: {
      label: "Vague Expected Output",
      description: "A task with minimal expected_output returns unstructured text",
      log: [
        { tag: "BOOT", text: "Initializing crew with 1 agent, 1 task" },
        { tag: "INFO", text: "Task: Analyze logs" },
        { tag: "INFO", text: "Expected output: 'A report'" },
        { tag: "PROCESS", text: "Agent processing task..." },
        { tag: "OK", text: "Task complete" },
      ],
      output: `There are errors in the deployment logs. The main issue is that the Docker image could not be pulled. This caused the pods to fail and the deployment was rolled back. You should fix the image reference and try deploying again.`,
    },
    enhanced: {
      label: "Detailed Expected Output",
      description:
        "A task with specific expected_output produces structured, comprehensive analysis",
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
- \`Failed to pull image "myapp:v1.2.3": pull access denied\`
- \`Pod status: ImagePullBackOff\`
- \`Deployment rollout failed: exceeded progress deadline\`

## Timeline of Events
1. 14:32:15 — Deployment initiated
2. 14:32:16 — Pod entered Pending state
3. 14:32:17 — Pod failed to start
4. 14:32:18 — Image pull denied (ROOT CAUSE)
5. 14:32:25 — Deployment deadline exceeded
6. 14:32:26 — Service endpoints unavailable
7. 14:32:29 — Rollback initiated

## Root Cause Analysis
The image \`myapp:v1.2.3\` could not be pulled from the registry. This is likely due to:
- Incorrect image tag
- Missing registry credentials
- Private registry without imagePullSecrets configured

## Affected Components
- Pod: myapp-deployment-7b8c9d5f4-abc12
- Deployment: myapp-deployment
- Service: myapp-service`,
    },
  },
  agentConfig: {
    role: "DevOps Log Analyzer",
    goal: "Analyze log files to identify and extract specific issues, errors, and failure patterns",
    backstory:
      "You are a senior DevOps engineer with 10 years of experience in analyzing production logs.",
  },
};
