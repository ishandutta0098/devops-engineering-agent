import type { ChapterDef } from "../schema";

export const ch06: ChapterDef = {
  slug: "structured-output",
  number: 7,
  phase: "Notebook 02",
  phaseTitle: "Harden the Pipeline",
  title: "Structured Output",
  subtitle: "Force the agent to return typed, validated data using Pydantic models",
  intro:
    "Notebook 02 starts hardening the working pipeline by replacing fragile free text with typed data. With output_pydantic on a Task, CrewAI forces the LLM to return valid JSON matching your schema — giving you typed fields you can access directly.",
  progression:
    "Now that the full crew works, upgrade the first task from markdown analysis to a `LogAnalysisReport` JSON artifact.",
  takeaway:
    "Structured output transforms agent output from a string you have to parse into a typed object you can use directly. report.primary_issue beats regex-parsing a wall of markdown every time.",
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
fragile and unreliable.

>>> type(result.raw)
<class 'str'>  # just a string, no structure`,
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
}

>>> report = result.pydantic
>>> report.primary_issue
'Production deployment failed due to ImagePullBackOff'
>>> len(report.errors)
4
>>> type(report)
<class 'LogAnalysisReport'>  # fully typed!`,
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
