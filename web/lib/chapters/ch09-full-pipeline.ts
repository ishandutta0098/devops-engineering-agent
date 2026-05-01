import type { ChapterDef } from "../schema";

export const ch09: ChapterDef = {
  slug: "full-pipeline",
  number: 9,
  title: "The Full Pipeline",
  subtitle: "Combine everything into a production-ready DevOps agent system",
  intro:
    "This is where every concept comes together. Three agents with tools, chained tasks with context, structured output with Pydantic, and guardrails for quality — all orchestrated by a single Crew. Compare the base pipeline with the full production version to see what each feature adds.",
  takeaway:
    "Each feature you've learned compounds. Tools give agents capabilities. Context chains their output. Structured output makes it machine-readable. Guardrails ensure quality. Together, they produce a production-grade system that turns raw logs into actionable remediation plans.",
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
            { tag: "OK", text: "Agent 1 complete: Raw text analysis" },
            { tag: "PROCESS", text: "Agent 2 (Researcher): Searching..." },
            { tag: "OK", text: "Agent 2 complete: Solutions found" },
            { tag: "PROCESS", text: "Agent 3 (Plan Writer): Writing plan..." },
            { tag: "OK", text: "Agent 3 complete: Plan written" },
            { tag: "SUCCESS", text: "Pipeline complete (base)" },
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
            { tag: "GUARDRAIL", text: "validate_log_analysis() → PASSED (4 errors)" },
            { tag: "OK", text: "Agent 1 complete: Structured + validated" },
            { tag: "PROCESS", text: "Agent 2 (Researcher): context from Agent 1" },
            { tag: "INFO", text: "  EXASearchTool: 'ImagePullBackOff fix kubernetes'" },
            { tag: "INFO", text: "  Found 5 targeted solutions with sources" },
            { tag: "OK", text: "Agent 2 complete: Research with citations" },
            { tag: "PROCESS", text: "Agent 3 (Plan Writer): context from Agents 1+2" },
            { tag: "GUARDRAIL", text: "String guardrail → PASSED (4 shell commands)" },
            { tag: "OK", text: "Agent 3 complete: Production-grade plan" },
            { tag: "SUCCESS", text: "Pipeline complete — ALL FEATURES ACTIVE" },
          ],
          output: `# Production Remediation Plan

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
