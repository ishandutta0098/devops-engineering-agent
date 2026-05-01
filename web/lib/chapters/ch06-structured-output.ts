import type { ChapterDef } from "../schema";

export const ch06: ChapterDef = {
  slug: "structured-output",
  number: 6,
  title: "Structured Output",
  subtitle: "Force the agent to return typed, validated data using Pydantic models",
  objective:
    "Learn how output_pydantic replaces free-text with machine-readable structured data.",
  concepts: [
    {
      id: "pydantic-model",
      title: "Define a Pydantic Model",
      description:
        "Create a BaseModel subclass with typed fields. Each Field gets a description that guides the LLM.",
      code: `from pydantic import BaseModel, Field

class LogAnalysisReport(BaseModel):
    primary_issue: str = Field(
        description="One-line description of the main issue"
    )
    root_cause: str = Field(
        description="Root cause analysis based on log evidence"
    )
    errors: list[str] = Field(
        description="All errors found in the log"
    )
    affected_components: list[str] = Field(
        description="System components affected"
    )
    timeline: list[str] = Field(
        description="Sequence of events leading to failure"
    )`,
    },
    {
      id: "output-pydantic",
      title: "output_pydantic on the Task",
      description:
        "Set output_pydantic=LogAnalysisReport on the Task. CrewAI will force the LLM to return valid JSON matching the schema.",
      code: `analyze_task = Task(
    description="Analyze the following log data: {log_data}",
    expected_output="A structured log analysis report",
    output_pydantic=LogAnalysisReport,
    agent=log_analyzer,
)

result = crew.kickoff(inputs={"log_data": LOG_INPUT})
report = result.pydantic
print(report.primary_issue)  # typed access!`,
    },
  ],
  inputSchema: [
    {
      key: "output_mode",
      label: "Output Mode",
      kind: "select",
      options: ["Raw Text (no schema)", "Pydantic Model (structured)"],
    },
  ],
  fixtures: {
    baseline: {
      label: "Raw Text Output",
      description: "Without output_pydantic, the agent returns free-form markdown — hard to parse programmatically",
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
    enhanced: {
      label: "Pydantic Structured Output",
      description: "With output_pydantic, the agent returns typed JSON matching LogAnalysisReport exactly",
      log: [
        { tag: "BOOT", text: "Initializing crew with Pydantic output" },
        { tag: "INFO", text: "output_pydantic: LogAnalysisReport" },
        { tag: "PROCESS", text: "Agent analyzing logs..." },
        { tag: "PROCESS", text: "LLM constrained to return valid JSON schema..." },
        { tag: "OK", text: "Structured output validated against schema" },
      ],
      output: `{
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
  agentConfig: {
    role: "DevOps Log Analyzer",
    goal: "Analyze log files and produce structured analysis reports",
    backstory:
      "You are a senior DevOps engineer who produces machine-readable analysis reports.",
  },
};
