import type { ChapterDef } from "../schema";

export const ch08: ChapterDef = {
  slug: "crew-orchestration",
  number: 6,
  phase: "Notebook 01",
  phaseTitle: "Build the Pipeline",
  title: "Crew Orchestration",
  subtitle: "Combine agents, tasks, and process into a working Crew",
  intro:
    "Notebook 01 culminates in a complete Crew: three agents, three tasks, `Process.sequential`, context chaining, and saved markdown artifacts. Process.sequential runs tasks in order, letting each build on the previous through context. Adding more specialized agents deepens the output at each stage.",
  progression:
    "This is the Notebook 01 finish line: analysis, investigation, and remediation plan working as one pipeline.",
  takeaway:
    "A 3-agent crew produces fundamentally better output than a single agent trying to do everything. Each agent focuses on its specialty and passes structured results downstream. The whole is greater than the sum of its parts.",
  demos: [
    {
      id: "crew-size",
      question: "How does adding more agents change the final output?",
      controlLabel: "Crew Size",
      options: [
        {
          key: "one-agent",
          label: "1 Agent (Analyzer only)",
          description: "Single agent does analysis but no research or planning",
        },
        {
          key: "two-agents",
          label: "2 Agents (Analyzer + Researcher)",
          description: "Analysis plus targeted solution research",
        },
        {
          key: "three-agents",
          label: "3 Agents (Full Pipeline)",
          description: "Analysis → Research → Remediation Plan",
        },
      ],
      defaultLeft: "one-agent",
      defaultRight: "three-agents",
      variants: {
        "one-agent": {
          label: "1-Agent Crew",
          description: "Only analysis — no research or planning",
          log: [
            { tag: "BOOT", text: "Initializing crew: 1 agent, 1 task" },
            { tag: "INFO", text: "Process: sequential" },
            { tag: "PROCESS", text: "Task 1: Log Analyzer analyzing..." },
            { tag: "OK", text: "Crew complete: 1 task finished" },
          ],
          output: `# Crew Output (1 Agent)

## Analysis
ImagePullBackOff on myapp:v1.2.3 — image not found or credentials missing.
Cascade: Pod Pending → Deadline exceeded → Rollback.

That's all. No research, no remediation plan.
One agent can only do one thing.`,
        },
        "two-agents": {
          label: "2-Agent Crew",
          description: "Analysis plus research, but no structured plan",
          log: [
            { tag: "BOOT", text: "Initializing crew: 2 agents, 2 tasks" },
            { tag: "INFO", text: "Process: sequential" },
            { tag: "PROCESS", text: "Task 1/2: Log Analyzer starting..." },
            { tag: "OK", text: "Task 1/2 complete: Analysis ready" },
            { tag: "PROCESS", text: "Task 2/2: Researcher starting..." },
            { tag: "INFO", text: "  Context: received analysis from Task 1" },
            { tag: "INFO", text: "  Searching for ImagePullBackOff solutions..." },
            { tag: "OK", text: "Task 2/2 complete: Solutions found" },
          ],
          output: `# Crew Output (2 Agents)

## Analysis (Agent 1)
ImagePullBackOff on myapp:v1.2.3 — registry credentials missing.

## Research (Agent 2)
Found solutions for ImagePullBackOff:
- Create imagePullSecret with registry credentials
- Patch ServiceAccount with the secret
- Verify image exists with docker manifest inspect

Better — we have solutions. But no prioritized plan with
verification steps. That needs a third agent.`,
        },
        "three-agents": {
          label: "3-Agent Crew",
          description: "Full pipeline: analyze → research → plan",
          log: [
            { tag: "BOOT", text: "Initializing crew: 3 agents, 3 tasks" },
            { tag: "INFO", text: "Process: sequential, verbose=True, cache=True, max_rpm=30" },
            { tag: "PROCESS", text: "Task 1/3: Log Analyzer starting..." },
            { tag: "OK", text: "Task 1/3 complete: task_outputs/log_analysis.md" },
            { tag: "PROCESS", text: "Task 2/3: Researcher starting..." },
            { tag: "INFO", text: "  Context: received analysis" },
            { tag: "OK", text: "Task 2/3 complete: task_outputs/investigation_report.md" },
            { tag: "PROCESS", text: "Task 3/3: Plan Writer starting..." },
            { tag: "INFO", text: "  Context: analysis + research" },
            { tag: "OK", text: "Task 3/3 complete: task_outputs/solution_plan.md" },
            { tag: "SUCCESS", text: "Crew finished: 3/3 tasks complete" },
          ],
          output: `Generated artifacts:
- task_outputs/log_analysis.md
- task_outputs/investigation_report.md
- task_outputs/solution_plan.md

# task_outputs/log_analysis.md

## Primary Issue
ImagePullBackOff on myapp:v1.2.3 — image not found or registry credentials missing.

## Root Cause
The deployment references a container image the cluster cannot pull. The failure cascades into a rollout deadline and rollback.

# task_outputs/investigation_report.md

## Common Causes
1. Image tag was never pushed by CI/CD
2. Private registry credentials missing or expired
3. ServiceAccount missing imagePullSecrets

## Proven Fixes
- Verify the image exists before redeploying
- Create or refresh the registry secret
- Patch the ServiceAccount used by the deployment

# task_outputs/solution_plan.md

## Incident Summary
Issue: ImagePullBackOff on myapp:v1.2.3
Root Cause: Registry credentials missing/expired
Severity: P0 — Production deployment failed

## Immediate Actions (P0, ETA: 15 min)
1. Verify image exists:
   docker manifest inspect myapp:v1.2.3

2. Create registry secret:
   kubectl create secret docker-registry regcred \\
     --docker-server=registry.example.com \\
     --docker-username=$USER --docker-password=$TOKEN

3. Patch service account:
   kubectl patch sa default \\
     -p '{"imagePullSecrets":[{"name":"regcred"}]}'

4. Redeploy:
   kubectl rollout restart deployment myapp-deployment

## Prevention (P1, ETA: 1 day)
- Add imagePullSecrets to Helm chart defaults
- CI gate: verify image exists before deploy

## Verification
kubectl get pods -l app=myapp -w
kubectl rollout status deployment myapp-deployment`,
        },
      },
    },
  ],
  agentConfig: {
    role: "DevOps Plan Writer",
    goal: "Create clear, actionable remediation plans from analysis and research",
    backstory:
      "You are a senior DevOps lead who writes runbooks and remediation plans.",
  },
};
