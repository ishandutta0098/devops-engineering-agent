import type { ChapterDef } from "../schema";

export const ch08: ChapterDef = {
  slug: "crew-orchestration",
  number: 6,
  phase: "Notebook 01",
  title: "Crew Orchestration",
  subtitle: "Combine agents, tasks, and process into a working Crew",
  intro:
    "Notebook 01 culminates in a complete Crew: three agents, three tasks, `Process.sequential`, context chaining, and saved markdown artifacts. Process.sequential runs tasks in order, letting each build on the previous through context. Adding more specialized agents deepens the output at each stage.",
  takeaway:
    "A 3-agent crew produces fundamentally better output than a single agent trying to do everything. Each agent focuses on its specialty and passes structured results downstream. The whole is greater than the sum of its parts.",
  demos: [],
  crewDemo: {
    agents: [
      {
        role: "Analyzer",
        tools: ["FileReadTool"],
        iterations: [
          {
            kind: "tool",
            label: 'FileReadTool("kubernetes_deployment_error.log")',
            detail: "Read 21 lines from disk",
            status: "OK",
          },
          {
            kind: "reason",
            label: "Scan ERROR / CRITICAL entries",
            detail: "Identifies ImagePullBackOff and rollback cascade",
            status: "OK",
          },
          {
            kind: "reason",
            label: "Compose log_analysis.md",
            detail: "Primary issue · root cause · cascade",
            status: "OK",
          },
        ],
        contextOut: `{
  primary_issue:
    "ImagePullBackOff on myapp:v1.2.3",
  root_cause:
    "Registry auth missing",
  cascade: ["progressDeadlineExceeded",
            "0/3 ready replicas",
            "rollback to v1.2.2"]
}`,
      },
      {
        role: "Researcher",
        tools: ["EXASearchTool"],
        iterations: [
          {
            kind: "context",
            label: "Receive Analyzer findings",
            detail: "context=[analyze_task]",
            status: "INFO",
          },
          {
            kind: "tool",
            label: 'EXASearchTool("ImagePullBackOff myapp:v1.2.3 fix")',
            detail: "5 sources · kubernetes.io · stackoverflow",
            status: "OK",
          },
          {
            kind: "retry",
            label: 'EXASearchTool("imagePullSecret rotation serviceaccount")',
            detail: "Refines query for credential angle",
            status: "OK",
          },
          {
            kind: "reason",
            label: "Compose investigation_report.md",
            detail: "Common causes + proven fixes",
            status: "OK",
          },
        ],
        contextOut: `{
  common_causes: [
    "tag missing in registry",
    "stale imagePullSecret",
    "ServiceAccount not patched"
  ],
  proven_fixes: [
    "docker manifest inspect ...",
    "kubectl create secret docker-registry ...",
    "kubectl patch sa default ..."
  ]
}`,
      },
      {
        role: "Plan Writer",
        tools: [],
        iterations: [
          {
            kind: "context",
            label: "Receive Analyzer + Researcher context",
            detail: "context=[analyze_task, research_task]",
            status: "INFO",
          },
          {
            kind: "reason",
            label: "Sequence the immediate actions",
            detail: "Verify tag → create secret → patch sa → restart",
            status: "OK",
          },
          {
            kind: "reason",
            label: "Add prevention + verification",
            detail: "Helm defaults · CI gate · rollout status check",
            status: "OK",
          },
          {
            kind: "reason",
            label: "Compose solution_plan.md",
            detail: "P0 immediate · P1 prevention · verification",
            status: "OK",
          },
        ],
        contextOut: `# Solution plan

P0 (15 min):
1. docker manifest inspect myapp:v1.2.3
2. kubectl create secret docker-registry regcred ...
3. kubectl patch sa default \\
   -p '{"imagePullSecrets":[{"name":"regcred"}]}'
4. kubectl rollout restart deployment myapp

P1 (1 day):
- Add imagePullSecrets to Helm chart
- CI gate: verify image exists before deploy

Verify:
  kubectl rollout status deployment myapp`,
      },
    ],
  },
  agentConfig: {
    role: "DevOps Plan Writer",
    goal: "Create clear, actionable remediation plans from analysis and research",
    backstory:
      "You are a senior DevOps lead who writes runbooks and remediation plans.",
  },
};
