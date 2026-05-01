import type { ChapterDef } from "../schema";

export const ch09: ChapterDef = {
  slug: "full-pipeline",
  number: 9,
  title: "The Full Pipeline",
  subtitle: "Combine everything into a production-ready DevOps agent system",
  objective:
    "See all concepts working together — agents with tools, chained tasks with context, structured output, guardrails, and crew orchestration.",
  concepts: [
    {
      id: "architecture",
      title: "Pipeline Architecture",
      description:
        "Three agents form a pipeline: Log Analyzer → Solution Researcher → Plan Writer. Each has specialized tools, structured output, and guardrails.",
      code: `# Agent 1: Log Analyzer
log_analyzer = Agent(
    role="DevOps Log Analyzer",
    tools=[FileReadTool()],
    max_iter=10,
    max_execution_time=120,
)

# Agent 2: Solution Researcher
solution_researcher = Agent(
    role="DevOps Solution Researcher",
    tools=[EXASearchTool()],
    max_iter=15,
)

# Agent 3: Plan Writer
plan_writer = Agent(
    role="DevOps Plan Writer",
    max_iter=10,
)`,
    },
    {
      id: "full-crew",
      title: "Production Crew",
      description:
        "The crew wires everything together — structured output on the analysis task, guardrails for validation, context chaining between tasks.",
      code: `analyze_task = Task(
    description="Analyze logs at {log_file_path}",
    output_pydantic=LogAnalysisReport,
    guardrail=validate_log_analysis,
    agent=log_analyzer,
)

research_task = Task(
    description="Research solutions for identified issues",
    agent=solution_researcher,
    context=[analyze_task],
)

plan_task = Task(
    description="Write a remediation plan",
    agent=plan_writer,
    context=[analyze_task, research_task],
)

crew = Crew(
    agents=[log_analyzer, solution_researcher, plan_writer],
    tasks=[analyze_task, research_task, plan_task],
    process=Process.sequential,
    verbose=True,
    cache=True,
)`,
    },
  ],
  inputSchema: [
    {
      key: "log_data",
      label: "Log Input",
      kind: "textarea",
      rows: 8,
      placeholder: "Paste Kubernetes, Docker, or application logs here...",
    },
    {
      key: "features",
      label: "Enabled Features",
      kind: "select",
      options: [
        "Base Pipeline (no extras)",
        "With Structured Output",
        "With Guardrails",
        "Full Production (all features)",
      ],
    },
  ],
  fixtures: {
    baseline: {
      label: "Base Pipeline",
      description: "The pipeline without structured output or guardrails — works but fragile",
      log: [
        { tag: "BOOT", text: "Initializing full pipeline (base mode)" },
        { tag: "INFO", text: "Features: tools=yes, structured_output=no, guardrails=no" },
        { tag: "PROCESS", text: "Agent 1 (Log Analyzer): Reading and analyzing logs..." },
        { tag: "OK", text: "Agent 1 complete: Raw text analysis" },
        { tag: "PROCESS", text: "Agent 2 (Researcher): Searching for solutions..." },
        { tag: "OK", text: "Agent 2 complete: Solutions found" },
        { tag: "PROCESS", text: "Agent 3 (Plan Writer): Writing remediation plan..." },
        { tag: "OK", text: "Agent 3 complete: Plan written" },
        { tag: "SUCCESS", text: "Pipeline complete (base mode)" },
      ],
      output: `# Remediation Plan (Base Pipeline)

## Analysis
The deployment failed. There were image pull errors.

## Solutions
- Check the image name
- Add credentials

## Plan
1. Fix the image
2. Redeploy

---
Note: Without structured output, the analysis is free text.
Without guardrails, subtle issues may be missed.
The plan is vague because upstream data was unstructured.`,
    },
    enhanced: {
      label: "Full Production Pipeline",
      description: "All features enabled — structured output, guardrails, tools, and context chaining",
      log: [
        { tag: "BOOT", text: "Initializing full pipeline (production mode)" },
        { tag: "INFO", text: "Features: tools=yes, structured_output=yes, guardrails=yes" },
        { tag: "PROCESS", text: "Agent 1 (Log Analyzer): Reading logs with FileReadTool..." },
        { tag: "INFO", text: "  Using output_pydantic=LogAnalysisReport" },
        { tag: "PROCESS", text: "  Constraining output to JSON schema..." },
        { tag: "GUARDRAIL", text: "validate_log_analysis() → PASSED (4 errors found)" },
        { tag: "OK", text: "Agent 1 complete: Structured report validated" },
        { tag: "PROCESS", text: "Agent 2 (Researcher): Context received from Agent 1" },
        { tag: "INFO", text: "  Searching: 'ImagePullBackOff fix kubernetes'" },
        { tag: "INFO", text: "  Found 5 targeted solutions" },
        { tag: "OK", text: "Agent 2 complete: Research with citations" },
        { tag: "PROCESS", text: "Agent 3 (Plan Writer): Context from Agents 1+2" },
        { tag: "INFO", text: "  Building prioritized remediation plan..." },
        { tag: "OK", text: "Agent 3 complete: Production-grade plan" },
        { tag: "SUCCESS", text: "Pipeline complete — all features active" },
      ],
      output: `# Production Remediation Plan

## Incident Summary
| Field | Value |
|-------|-------|
| Primary Issue | ImagePullBackOff on myapp:v1.2.3 |
| Root Cause | Registry credentials missing/expired |
| Severity | P0 — Production down |
| Affected | Pod, Deployment, Service |

## Structured Analysis (from Pydantic output)
\`\`\`json
{
  "primary_issue": "Production deployment failed due to ImagePullBackOff",
  "errors": ["Image pull denied", "ImagePullBackOff", "Deadline exceeded", "Rollback initiated"],
  "affected_components": ["Pod", "Deployment", "Service"]
}
\`\`\`

## Remediation Steps

### P0: Immediate (ETA: 15 min)
1. Create registry secret:
   \`\`\`bash
   kubectl create secret docker-registry regcred \\
     --docker-server=registry.example.com \\
     --docker-username=$USER --docker-password=$TOKEN
   \`\`\`
2. Patch default SA: \`kubectl patch sa default -p '{"imagePullSecrets":[{"name":"regcred"}]}'\`
3. Redeploy: \`kubectl rollout restart deployment myapp-deployment\`

### P1: Prevention (ETA: 1 day)
- Add imagePullSecrets to Helm chart defaults
- CI gate: verify image exists before deploy
- Rotate registry credentials quarterly

### P2: Monitoring (ETA: 1 week)
- Alert on ImagePullBackOff events
- Dashboard for deployment success rate
- Runbook link in PagerDuty

## Verification
\`\`\`bash
kubectl get pods -l app=myapp -w
kubectl rollout status deployment myapp-deployment --timeout=120s
curl -f https://myapp.example.com/healthz
\`\`\``,
    },
  },
  agentConfig: {
    role: "DevOps Plan Writer",
    goal: "Create comprehensive, production-grade remediation plans",
    backstory:
      "You are a senior DevOps lead who orchestrates incident response across the full pipeline.",
  },
};
