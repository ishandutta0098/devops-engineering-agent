import type { ChapterDef } from "../schema";

export const ch09: ChapterDef = {
  slug: "full-pipeline",
  number: 9,
  phase: "Notebook 02",
  phaseTitle: "Harden the Pipeline",
  title: "The Full Pipeline",
  subtitle: "Combine everything into a production-ready DevOps agent system",
  intro:
    "Notebook 02 ends by running the hardened version of the same three-agent system from Notebook 01. Three agents with tools, chained tasks with context, structured output with Pydantic, and guardrails for quality are orchestrated by a single Crew. Compare the base pipeline with the full production version to see what each feature adds.",
  progression:
    "This final chapter should feel like the consolidated notebook cell: one run that produces analysis, investigation, and a validated solution plan.",
  takeaway:
    "Each feature you've learned compounds. Tools give agents capabilities. Context chains their output. Structured output makes it machine-readable. Guardrails ensure quality. Together, they produce a production-grade system that turns raw logs into actionable remediation plans.",
  examples: [
    {
      title: "Base pipeline",
      scenario: "The crew runs with tools and context, but no structured output or guardrails.",
      change: "Each agent can work, but outputs are mostly free text.",
      outcome: "The result is useful, but weaker for automation and quality checks.",
    },
    {
      title: "Structured pipeline",
      scenario: "The analyzer returns `task_outputs/log_analysis.json`.",
      change: "Downstream agents receive a stable issue, root cause, errors, and timeline.",
      outcome: "The plan becomes more specific because upstream data is dependable.",
    },
    {
      title: "Production pipeline",
      scenario: "The full run uses tools, context, structured output, and guardrails.",
      change: "Bad analysis is rejected, and the solution must include runnable commands.",
      outcome: "The final artifact is closer to a real incident runbook.",
    },
  ],
  demos: [
    {
      id: "pipeline-features",
      question: "How does enabling production features change the pipeline output?",
      controlLabel: "Feature Set",
      options: [
        {
          key: "base",
          label: "Base Pipeline",
          description: "Tools and context only — no structured output or guardrails",
        },
        {
          key: "with-structured",
          label: "+ Structured Output",
          description: "Adds Pydantic models for typed, parseable results",
        },
        {
          key: "with-guardrails",
          label: "+ Guardrails",
          description: "Adds code guardrail on analysis and string guardrail on solution",
        },
        {
          key: "full",
          label: "Full Production",
          description: "All features: tools, context, structured output, guardrails",
        },
      ],
      defaultLeft: "base",
      defaultRight: "full",
      variants: {
        base: {
          label: "Base Pipeline",
          description: "Works but fragile — no structure or validation",
          log: [
            { tag: "BOOT", text: "Initializing pipeline (base mode)" },
            { tag: "INFO", text: "Features: tools=yes, structured_output=no, guardrails=no" },
            { tag: "PROCESS", text: "Agent 1 (Analyzer): Reading logs..." },
            { tag: "OK", text: "Agent 1 complete: task_outputs/log_analysis.md" },
            { tag: "PROCESS", text: "Agent 2 (Researcher): Searching..." },
            { tag: "OK", text: "Agent 2 complete: task_outputs/investigation_report.md" },
            { tag: "PROCESS", text: "Agent 3 (Plan Writer): Writing plan..." },
            { tag: "OK", text: "Agent 3 complete: task_outputs/solution_plan.md" },
            { tag: "SUCCESS", text: "Pipeline complete (base)" },
          ],
          output: `Generated artifacts:
- task_outputs/log_analysis.md
- task_outputs/investigation_report.md
- task_outputs/solution_plan.md

# task_outputs/log_analysis.md

## Analysis
The deployment failed. There were image pull errors.

# task_outputs/investigation_report.md

## Solutions Found
- Check the image name
- Add credentials

# task_outputs/solution_plan.md

## Plan
1. Fix the image
2. Redeploy

Without structured output, the analysis is free text.
Without guardrails, subtle issues may be missed.
The plan is vague because upstream data was unstructured.`,
        },
        "with-structured": {
          label: "+ Structured Output",
          description: "Analysis returns typed JSON — downstream agents get structured data",
          log: [
            { tag: "BOOT", text: "Initializing pipeline (+ structured output)" },
            { tag: "INFO", text: "Features: tools=yes, structured_output=yes, guardrails=no" },
            { tag: "PROCESS", text: "Agent 1 (Analyzer): Reading logs..." },
            { tag: "PROCESS", text: "  Constraining output to LogAnalysisReport schema..." },
            { tag: "OK", text: "Agent 1 complete: Structured JSON report" },
            { tag: "PROCESS", text: "Agent 2 (Researcher): Received typed analysis..." },
            { tag: "OK", text: "Agent 2 complete: Targeted solutions" },
            { tag: "PROCESS", text: "Agent 3 (Plan Writer): Building from structured data..." },
            { tag: "OK", text: "Agent 3 complete: Better plan" },
            { tag: "SUCCESS", text: "Pipeline complete (+ structured)" },
          ],
          output: `# Remediation Plan (+ Structured Output)

## Incident (from structured analysis)
Primary Issue: ImagePullBackOff on myapp:v1.2.3
Root Cause: Registry credentials missing
Errors: 4 identified
Components: Pod, Deployment, Service

## Remediation Steps
1. Create registry secret:
   kubectl create secret docker-registry regcred ...

2. Patch service account:
   kubectl patch sa default ...

3. Redeploy:
   kubectl rollout restart deployment myapp-deployment

Better — structured analysis means the plan has specific details.
But still no quality validation on the analysis itself.`,
        },
        "with-guardrails": {
          label: "+ Guardrails",
          description: "Analysis is validated, solutions must include shell commands",
          log: [
            { tag: "BOOT", text: "Initializing pipeline (+ guardrails)" },
            { tag: "INFO", text: "Features: tools=yes, structured_output=yes, guardrails=yes" },
            { tag: "PROCESS", text: "Agent 1 (Analyzer): Reading logs..." },
            { tag: "GUARDRAIL", text: "validate_log_analysis() → PASSED (4 errors)" },
            { tag: "OK", text: "Agent 1 complete: Validated analysis" },
            { tag: "PROCESS", text: "Agent 2 (Researcher): Searching..." },
            { tag: "OK", text: "Agent 2 complete: Research done" },
            { tag: "PROCESS", text: "Agent 3 (Plan Writer): Writing plan..." },
            { tag: "GUARDRAIL", text: "String guardrail: checking for ≥3 shell commands..." },
            { tag: "GUARDRAIL", text: "String guardrail → PASSED" },
            { tag: "OK", text: "Agent 3 complete: Validated plan" },
            { tag: "SUCCESS", text: "Pipeline complete (+ guardrails)" },
          ],
          output: `# Remediation Plan (+ Guardrails)

## Validated Analysis
Primary Issue: ImagePullBackOff on myapp:v1.2.3
Errors: 4 (validated by code guardrail)

## Remediation (validated: ≥3 shell commands)

### Step 1: Verify image
docker manifest inspect myapp:v1.2.3

### Step 2: Create secret
kubectl create secret docker-registry regcred \\
  --docker-server=registry.example.com \\
  --docker-username=$USER --docker-password=$TOKEN

### Step 3: Patch SA
kubectl patch sa default -p '{"imagePullSecrets":[{"name":"regcred"}]}'

### Step 4: Redeploy
kubectl rollout restart deployment myapp-deployment

Guardrails ensured both the analysis quality AND the plan quality.`,
        },
        full: {
          label: "Full Production Pipeline",
          description: "All features active — tools, context, structured output, guardrails",
          log: [
            { tag: "BOOT", text: "Initializing pipeline (FULL PRODUCTION)" },
            { tag: "INFO", text: "Features: ALL ENABLED" },
            { tag: "PROCESS", text: "Agent 1 (Analyzer): FileReadTool reading logs..." },
            { tag: "PROCESS", text: "  output_pydantic=LogAnalysisReport" },
            { tag: "INFO", text: "  Artifact: task_outputs/log_analysis.json" },
            { tag: "GUARDRAIL", text: "validate_log_analysis() → PASSED (4 errors)" },
            { tag: "OK", text: "Agent 1 complete: Structured + validated" },
            { tag: "PROCESS", text: "Agent 2 (Researcher): context from Agent 1" },
            { tag: "INFO", text: "  EXASearchTool: 'ImagePullBackOff fix kubernetes'" },
            { tag: "INFO", text: "  Found 5 targeted solutions with sources" },
            { tag: "OK", text: "Agent 2 complete: task_outputs/investigation_report.md" },
            { tag: "PROCESS", text: "Agent 3 (Plan Writer): context from Agents 1+2" },
            { tag: "GUARDRAIL", text: "String guardrail → PASSED (4 shell commands)" },
            { tag: "OK", text: "Agent 3 complete: task_outputs/solution_plan.md" },
            { tag: "SUCCESS", text: "Pipeline complete — ALL FEATURES ACTIVE" },
          ],
          output: `Generated artifacts:
- task_outputs/log_analysis.json
- task_outputs/investigation_report.md
- task_outputs/solution_plan.md

# task_outputs/log_analysis.json

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
    "14:32:18 - Image pull access denied",
    "14:32:25 - Deployment deadline exceeded",
    "14:32:29 - Rollback initiated"
  ]
}

# task_outputs/investigation_report.md

## Findings
- Kubernetes ImagePullBackOff commonly means the image tag is absent or credentials are invalid.
- Official container image guidance recommends validating the image reference and pull secret configuration.
- The previous working tag suggests a CI/CD publish or registry credential issue.

# task_outputs/solution_plan.md

String guardrail requirement: at least 3 copy-pasteable shell commands.

# Production Remediation Plan

## Incident Summary
| Field | Value |
|-------|-------|
| Primary Issue | ImagePullBackOff on myapp:v1.2.3 |
| Root Cause | Registry credentials missing/expired |
| Severity | P0 — Production down |
| Errors | 4 (validated by guardrail) |
| Affected | Pod, Deployment, Service |

## P0: Immediate (ETA: 15 min)
1. Verify image:
   docker manifest inspect myapp:v1.2.3

2. Create registry secret:
   kubectl create secret docker-registry regcred \\
     --docker-server=registry.example.com \\
     --docker-username=$USER --docker-password=$TOKEN

3. Patch default SA:
   kubectl patch sa default \\
     -p '{"imagePullSecrets":[{"name":"regcred"}]}'

4. Redeploy:
   kubectl rollout restart deployment myapp-deployment

## P1: Prevention (ETA: 1 day)
- Add imagePullSecrets to Helm chart defaults
- CI gate: verify image exists before deploy
- Credential rotation quarterly

## P2: Monitoring (ETA: 1 week)
- Alert on ImagePullBackOff events
- Deployment success rate dashboard
- Runbook link in PagerDuty

## Verification
kubectl get pods -l app=myapp -w
kubectl rollout status deployment myapp-deployment --timeout=120s
curl -f https://myapp.example.com/healthz`,
        },
      },
    },
  ],
  agentConfig: {
    role: "DevOps Plan Writer",
    goal: "Create comprehensive, production-grade remediation plans",
    backstory:
      "You are a senior DevOps lead who orchestrates incident response across the full pipeline.",
  },
};
