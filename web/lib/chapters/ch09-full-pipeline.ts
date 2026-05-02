import type { ChapterDef } from "../schema";

export const ch09: ChapterDef = {
  slug: "full-pipeline",
  number: 9,
  phase: "Notebook 02",
  title: "The Full Pipeline",
  subtitle: "Combine everything into a production-ready DevOps agent system",
  intro:
    "Notebook 02 ends by running the hardened version of the same three-agent system from Notebook 01. Three agents with tools, chained tasks with context, structured output with Pydantic, and guardrails for quality are orchestrated by a single Crew. Compare the base pipeline with the full production version to see what each feature adds.",
  takeaway:
    "Each feature you've learned compounds. Tools give agents capabilities. Context chains their output. Structured output makes it machine-readable. Guardrails ensure quality. Together, they produce a production-grade system that turns raw logs into actionable remediation plans.",
  demos: [],
  pipelineTimeline: {
    events: [
      {
        agent: "Analyzer",
        kind: "tool",
        label: 'FileReadTool("kubernetes_deployment_error.log")',
        detail: "Read 21 lines from disk",
        status: "OK",
        payload: `# FileReadTool input
file_path = "dummy_logs/kubernetes_deployment_error.log"

# Output preview (21 lines)
2024-03-15 14:32:01 [INFO]  Initiating deployment of myapp:v1.2.3
2024-03-15 14:32:09 [ERROR] Failed to pull image "myapp:v1.2.3"
2024-03-15 14:32:09 [ERROR] ImagePullBackOff: back-off pulling image
2024-03-15 14:32:25 [ERROR] progressDeadlineExceeded after 600s
2024-03-15 14:32:29 [WARN]  Rolling back to previous version v1.2.2
2024-03-15 14:32:35 [ERROR] 0/3 ready replicas — service has no endpoints
... (16 more lines)`,
      },
      {
        agent: "Analyzer",
        kind: "iteration",
        label: "Scan ERROR / CRITICAL entries",
        detail: "Identifies ImagePullBackOff and rollback cascade",
        status: "OK",
        payload: `# Reasoning trace
- 4 ERROR lines, 1 WARN line, 16 INFO lines
- Primary signal: ImagePullBackOff at 14:32:09
- Cascade:
    14:32:09  ErrImagePull
    14:32:25  progressDeadlineExceeded
    14:32:29  Rollback to v1.2.2
    14:32:35  0/3 ready replicas
- Hypothesis: tag missing or registry credentials invalid
- Next step: emit structured LogAnalysisReport`,
      },
      {
        agent: "Analyzer",
        kind: "guardrail",
        label: "validate_log_analysis()",
        detail: "Code guardrail · len(errors) ≥ 1",
        status: "OK",
        payload: `def validate_log_analysis(result):
    report = result.pydantic
    if len(report.errors) == 0:
        return (False,
                "Found zero errors. Look harder at INFO lines.")
    return (True, report)

# Attempt 1 — len(errors) = 4 → PASS`,
      },
      {
        agent: "Analyzer",
        kind: "pydantic",
        label: "output_pydantic = LogAnalysisReport",
        detail: "Typed JSON, schema-validated",
        status: "OK",
        payload: `LogAnalysisReport(
  primary_issue =
    "Production deployment failed due to ImagePullBackOff on myapp:v1.2.3",
  errors = [
    "Failed to pull image \\"myapp:v1.2.3\\": pull access denied",
    "ImagePullBackOff",
    "progressDeadlineExceeded after 600s",
    "0/3 ready replicas — service has no endpoints",
  ],
  affected_components = [
    "myapp-deployment",
    "myapp-service",
    "myapp-pods",
  ],
  timeline = [
    "14:32:01 - Image pull initiated",
    "14:32:09 - ErrImagePull",
    "14:32:25 - Deployment deadline exceeded",
    "14:32:29 - Rollback initiated",
  ]
)`,
      },
      {
        agent: "Analyzer",
        kind: "artifact",
        label: "task_outputs/log_analysis.json",
        detail: "Persisted to disk",
        status: "OK",
        payload: `# Saved file: task_outputs/log_analysis.json
{
  "primary_issue": "Production deployment failed due to ImagePullBackOff on myapp:v1.2.3",
  "errors": [
    "Failed to pull image \\"myapp:v1.2.3\\": pull access denied",
    "ImagePullBackOff",
    "progressDeadlineExceeded after 600s",
    "0/3 ready replicas"
  ],
  "affected_components": ["myapp-deployment", "myapp-service", "myapp-pods"],
  "schema_version": "1.0.0"
}`,
      },
      {
        agent: "Researcher",
        kind: "context",
        label: "context = [analyze_task]",
        detail: "Receives Analyzer report",
        status: "INFO",
        payload: `# Inbound context (compacted)

primary_issue: "ImagePullBackOff on myapp:v1.2.3"
errors[4]: ["pull access denied", "ImagePullBackOff",
            "progressDeadlineExceeded",
            "0/3 ready replicas"]`,
      },
      {
        agent: "Researcher",
        kind: "tool",
        label: 'EXASearchTool("ImagePullBackOff myapp:v1.2.3 fix")',
        detail: "5 sources · kubernetes.io · stackoverflow",
        status: "OK",
        payload: `# EXASearchTool — 5 results
1. kubernetes.io/docs/tasks/configure-pod-container
   "Pull an image from a private registry"
2. stackoverflow.com/questions/75120000
   "ImagePullBackOff: pull access denied — verify tag with docker manifest inspect"
3. cloud.google.com/kubernetes-engine/docs/troubleshooting
   "Common ImagePullBackOff causes: missing imagePullSecret, expired token"
4. github.com/kubernetes/kubernetes/issues/75944
   "imagePullSecrets not propagated to ServiceAccount"
5. medium.com/devops-with-kubernetes
   "Rotating registry credentials safely"`,
      },
      {
        agent: "Researcher",
        kind: "tool",
        label: 'EXASearchTool("imagePullSecret rotation serviceaccount")',
        detail: "3 sources · cloud.google.com · kubernetes.io",
        status: "OK",
        payload: `# EXASearchTool — 3 results
1. kubernetes.io/docs/tasks/configure-pod-container
   "Patch a ServiceAccount with imagePullSecrets:
    kubectl patch sa default -p '{\\"imagePullSecrets\\":[{\\"name\\":\\"regcred\\"}]}'"
2. cloud.google.com/kubernetes-engine/docs
   "Recreate the secret then rollout restart"
3. kubernetes.io/docs/concepts/configuration/secret
   "kubernetes.io/dockerconfigjson secret type for registry creds"`,
      },
      {
        agent: "Researcher",
        kind: "iteration",
        label: "Compose investigation_report.md",
        detail: "Common causes + proven fixes",
        status: "OK",
        payload: `# Reasoning trace
- 8 sources gathered across 2 queries
- Common-cause distribution:
    tag missing            : 4 / 8
    stale imagePullSecret  : 5 / 8
    SA not patched         : 3 / 8
- Proven fix sequence emerges:
    1) docker manifest inspect — verify tag
    2) kubectl create secret docker-registry — refresh creds
    3) kubectl patch sa default — bind secret
    4) kubectl rollout restart — pick up new creds
- Drafting investigation_report.md`,
      },
      {
        agent: "Researcher",
        kind: "artifact",
        label: "task_outputs/investigation_report.md",
        detail: "Persisted to disk",
        status: "OK",
        payload: `# investigation_report.md (excerpt)

## Common causes
- Tag never landed in registry (verify with docker manifest inspect)
- ServiceAccount missing imagePullSecret reference
- Stale registry credentials (token expired or rotated)

## Proven fixes
1. docker manifest inspect myapp:v1.2.3
2. kubectl create secret docker-registry regcred ...
3. kubectl patch sa default -p '{"imagePullSecrets":[{"name":"regcred"}]}'
4. kubectl rollout restart deployment myapp

## Sources
kubernetes.io · stackoverflow.com · cloud.google.com · github.com`,
      },
      {
        agent: "PlanWriter",
        kind: "context",
        label: "context = [analyze_task, research_task]",
        detail: "Receives Analyzer + Researcher",
        status: "INFO",
        payload: `# Inbound context (compacted)

# from analyze_task
primary_issue: "ImagePullBackOff on myapp:v1.2.3"
errors[4]: [...]
affected_components[3]: [...]

# from research_task
common_causes[3]: ["tag missing", "stale imagePullSecret",
                   "ServiceAccount not patched"]
proven_fixes[4]: ["docker manifest inspect ...",
                  "kubectl create secret docker-registry ...",
                  "kubectl patch sa default ...",
                  "kubectl rollout restart deployment myapp"]`,
      },
      {
        agent: "PlanWriter",
        kind: "iteration",
        label: "Sequence P0 immediate actions",
        detail: "Verify tag → secret → patch sa → restart",
        status: "OK",
        payload: `# Reasoning trace
- Group fixes by urgency:
    P0 (15 min): unblock the deployment now
    P1 (1 day): prevent recurrence
- Order P0 actions for safety:
    1) Verify tag exists (cheap, read-only)
    2) Recreate secret with current creds
    3) Patch ServiceAccount to reference secret
    4) Rollout restart so pods pick up new creds
- Add a verification step: kubectl rollout status
- Drafting solution_plan.md`,
      },
      {
        agent: "PlanWriter",
        kind: "guardrail",
        label: "string guardrail: ≥3 shell commands",
        detail: "Found 4 copy-pasteable commands",
        status: "OK",
        payload: `Rule: "Solution must include at least 3
       copy-pasteable shell commands."

Found in solution_plan.md:
  1. docker manifest inspect myapp:v1.2.3
  2. kubectl create secret docker-registry regcred ...
  3. kubectl patch sa default ...
  4. kubectl rollout restart deployment myapp

→ PASS on attempt 1`,
      },
      {
        agent: "PlanWriter",
        kind: "artifact",
        label: "task_outputs/solution_plan.md",
        detail: "Final P0 runbook with verification",
        status: "OK",
        payload: `# Solution plan · myapp ImagePullBackOff

## P0 (15 min)
1. docker manifest inspect myapp:v1.2.3
2. kubectl create secret docker-registry regcred \\
     --docker-server=registry.example.com \\
     --docker-username=$USER \\
     --docker-password=$TOKEN
3. kubectl patch sa default \\
     -p '{"imagePullSecrets":[{"name":"regcred"}]}'
4. kubectl rollout restart deployment myapp

## P1 (1 day)
- Add imagePullSecrets to Helm chart defaults
- CI gate: verify image exists before deploy

## Verify
kubectl rollout status deployment myapp`,
      },
    ],
  },
  agentConfig: {
    role: "DevOps Pipeline Coordinator",
    goal: "Orchestrate the complete log analysis and remediation pipeline",
    backstory:
      "You coordinate the production-grade DevOps agent pipeline.",
  },
};
