import type { ChapterDef } from "../schema";

export const ch08: ChapterDef = {
  slug: "crew-orchestration",
  number: 8,
  title: "Crew Orchestration",
  subtitle: "Combine agents, tasks, and process into a working Crew",
  objective:
    "Learn how the Crew object orchestrates multiple agents working together — sequential vs parallel, verbose, caching.",
  concepts: [
    {
      id: "crew-basics",
      title: "Creating a Crew",
      description:
        "A Crew bundles agents and tasks together with a process strategy. Sequential runs tasks in order.",
      code: `crew = Crew(
    agents=[log_analyzer, solution_researcher, plan_writer],
    tasks=[analyze_task, research_task, plan_task],
    process=Process.sequential,
    verbose=True,
)

result = crew.kickoff(inputs={"log_data": LOG_INPUT})`,
    },
    {
      id: "process-sequential",
      title: "Process.sequential",
      description:
        "Tasks run one after another. Each task can use context= to receive output from previous tasks.",
      code: `crew = Crew(
    agents=[log_analyzer, solution_researcher],
    tasks=[analyze_task, research_task],
    process=Process.sequential,  # Task 1 → Task 2 → Task 3
    verbose=True,
)`,
    },
    {
      id: "crew-verbose",
      title: "verbose & cache",
      description:
        "verbose=True prints agent reasoning to stdout. cache=True (default) caches tool outputs to avoid redundant API calls.",
      code: `crew = Crew(
    agents=[log_analyzer],
    tasks=[analyze_task],
    process=Process.sequential,
    verbose=True,   # see agent reasoning
    cache=True,     # cache tool results
)`,
    },
  ],
  inputSchema: [
    {
      key: "num_agents",
      label: "Number of Agents",
      kind: "select",
      options: ["1 (analyzer only)", "2 (analyzer + researcher)", "3 (full pipeline)"],
    },
    {
      key: "verbose",
      label: "Verbose Mode",
      kind: "select",
      options: ["Off", "On"],
    },
  ],
  fixtures: {
    baseline: {
      label: "Single Agent Crew",
      description: "A crew with one agent produces only the analysis — no research or plan",
      log: [
        { tag: "BOOT", text: "Initializing crew: 1 agent, 1 task" },
        { tag: "INFO", text: "Process: sequential, verbose: false" },
        { tag: "PROCESS", text: "Task 1: Log Analyzer analyzing..." },
        { tag: "OK", text: "Crew complete: 1 task finished" },
      ],
      output: `# Crew Output (1 Agent)
## Analysis
ImagePullBackOff on myapp:v1.2.3 — image not found or credentials missing.

---
That's all. No research, no remediation plan.
The crew only knows how to analyze — it can't search or plan.`,
    },
    enhanced: {
      label: "Full 3-Agent Crew",
      description: "Three agents in sequence: analyze → research → write plan",
      log: [
        { tag: "BOOT", text: "Initializing crew: 3 agents, 3 tasks" },
        { tag: "INFO", text: "Process: sequential, verbose: true" },
        { tag: "PROCESS", text: "Task 1/3: Log Analyzer starting..." },
        { tag: "INFO", text: "  Using FileReadTool to read logs" },
        { tag: "OK", text: "Task 1/3 complete: Analysis ready" },
        { tag: "PROCESS", text: "Task 2/3: Solution Researcher starting..." },
        { tag: "INFO", text: "  Context: received analysis from Task 1" },
        { tag: "INFO", text: "  Using EXASearchTool for solutions" },
        { tag: "OK", text: "Task 2/3 complete: Solutions found" },
        { tag: "PROCESS", text: "Task 3/3: Plan Writer starting..." },
        { tag: "INFO", text: "  Context: received analysis + research" },
        { tag: "OK", text: "Task 3/3 complete: Remediation plan written" },
        { tag: "SUCCESS", text: "Crew finished: 3/3 tasks complete" },
      ],
      output: `# DevOps Remediation Plan

## Issue Summary
Production deployment of myapp-deployment failed due to ImagePullBackOff.

## Root Cause
Image \`myapp:v1.2.3\` cannot be pulled — registry credentials missing.

## Remediation Steps

### Immediate (P0)
1. Verify image exists: \`docker manifest inspect myapp:v1.2.3\`
2. Create registry secret:
   \`\`\`bash
   kubectl create secret docker-registry regcred \\
     --docker-server=registry.example.com \\
     --docker-username=$USER --docker-password=$TOKEN
   \`\`\`
3. Patch service account: \`kubectl patch sa default -p '...'\`
4. Redeploy: \`kubectl rollout restart deployment myapp-deployment\`

### Prevention (P1)
- Add image pull secret to Helm chart defaults
- CI pipeline: verify image exists before deploying
- Set up registry credential rotation

## Verification
\`\`\`bash
kubectl get pods -l app=myapp -w
kubectl rollout status deployment myapp-deployment
\`\`\``,
    },
  },
  agentConfig: {
    role: "DevOps Plan Writer",
    goal: "Create clear, actionable remediation plans from analysis and research",
    backstory:
      "You are a senior DevOps lead who writes runbooks and remediation plans.",
  },
};
