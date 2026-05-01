import type { ChapterDef } from "../schema";

export const ch02: ChapterDef = {
  slug: "first-task",
  number: 2,
  phase: "Notebook 01",
  phaseTitle: "Build the Pipeline",
  title: "Your First Task",
  subtitle: "Give your agent a specific job with a description and expected output",
  intro:
    "Notebook 01 next turns the agent into useful work with a Task. A Task tells the agent exactly what to do and what to produce. The expected_output field is especially powerful — the more specific you make it, the more structured and useful the result.",
  progression:
    "Now that the analyzer has a persona, give it the same clear log-analysis job the notebook builds toward.",
  takeaway:
    "The expected_output field is your strongest lever for controlling output quality. Vague instructions produce vague results. Specific structure produces specific, actionable analysis.",
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
          label: "Vague Expected Output",
          description: "With minimal expected_output, the agent produces unstructured text",
          log: [
            { tag: "BOOT", text: "Initializing crew with 1 agent, 1 task" },
            { tag: "INFO", text: "Task: Analyze logs" },
            { tag: "INFO", text: "Expected output: 'A report'" },
            { tag: "PROCESS", text: "Agent processing task..." },
            { tag: "OK", text: "Task complete" },
          ],
          output: `There are errors in the deployment logs. The main issue is that the Docker image could not be pulled. This caused the pods to fail and the deployment was rolled back. You should fix the image reference and try deploying again.`,
        },
        detailed: {
          label: "Detailed Expected Output",
          description: "Specific expected_output produces structured, comprehensive analysis",
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
