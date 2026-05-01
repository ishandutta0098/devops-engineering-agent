import type { ChapterDef } from "../schema";

export const ch05: ChapterDef = {
  slug: "task-context",
  number: 5,
  title: "Task Context & Chaining",
  subtitle: "Pass output from one task as input to the next",
  intro:
    "In a multi-agent system, the output of one agent needs to flow into the next. The context parameter on a Task injects upstream task outputs into the downstream agent's prompt automatically — no manual wiring needed.",
  takeaway:
    "Context chaining is what makes multi-agent systems powerful. Without it, each agent works in isolation. With it, downstream agents build on upstream results — producing targeted, specific output instead of generic guesses.",
  demos: [
    {
      id: "context-chaining",
      question: "What happens when the researcher gets context from the analyzer?",
      controlLabel: "Context Chaining",
      options: [
        {
          key: "no-context",
          label: "No Context",
          description: "Researcher works independently — no access to the analysis",
        },
        {
          key: "with-context",
          label: "With Context",
          description: "Researcher receives the analyzer's output via context=[analyze_task]",
        },
      ],
      defaultLeft: "no-context",
      defaultRight: "with-context",
      variants: {
        "no-context": {
          label: "No Context",
          description: "Without context, the researcher starts from scratch",
          log: [
            { tag: "BOOT", text: "Initializing crew: 2 agents, 2 independent tasks" },
            { tag: "PROCESS", text: "Task 1: Log Analyzer analyzing logs..." },
            { tag: "OK", text: "Task 1 complete: Found ImagePullBackOff" },
            { tag: "PROCESS", text: "Task 2: Researcher searching for solutions..." },
            { tag: "WARN", text: "Researcher has NO context from the analysis" },
            { tag: "PROCESS", text: "Researcher guessing what to search for..." },
            { tag: "OK", text: "Task 2 complete: Generic Kubernetes troubleshooting" },
          ],
          output: `# Researcher Output (No Context)
Without the analysis output, I'll provide general deployment guidance.

## Generic Solutions
- Check pod status: kubectl get pods
- Review events: kubectl describe pod <name>
- Check node resources: kubectl top nodes
- Review recent deployments: kubectl rollout history

These are generic suggestions. I don't know the specific error
because the analysis results weren't passed to me.`,
        },
        "with-context": {
          label: "With Context",
          description: "Researcher receives analysis and provides targeted solutions",
          log: [
            { tag: "BOOT", text: "Initializing crew: 2 agents, 2 chained tasks" },
            { tag: "PROCESS", text: "Task 1: Log Analyzer analyzing logs..." },
            { tag: "OK", text: "Task 1 complete: Found ImagePullBackOff" },
            { tag: "INFO", text: "Passing Task 1 output as context to Task 2..." },
            { tag: "PROCESS", text: "Task 2: Researcher received analysis context" },
            { tag: "PROCESS", text: "Searching: 'ImagePullBackOff myapp:v1.2.3 fix'" },
            { tag: "INFO", text: "Found targeted solutions for ImagePullBackOff" },
            { tag: "OK", text: "Task 2 complete: Specific remediation steps" },
          ],
          output: `# Researcher Output (With Context)
Based on the analysis: ImagePullBackOff for image myapp:v1.2.3

## Targeted Solutions

### 1. Verify Image Exists
docker manifest inspect myapp:v1.2.3
# If not found, check your CI/CD pipeline built and pushed this tag

### 2. Fix Registry Credentials
kubectl create secret docker-registry regcred \\
  --docker-server=registry.example.com \\
  --docker-username=$USER \\
  --docker-password=$TOKEN

kubectl patch serviceaccount default \\
  -p '{"imagePullSecrets":[{"name":"regcred"}]}'

### 3. Validate Network Access
Ensure pods can reach the container registry.
Check NetworkPolicies and firewall rules.`,
        },
      },
    },
  ],
  agentConfig: {
    role: "DevOps Solution Researcher",
    goal: "Find proven solutions and best practices for DevOps issues",
    backstory:
      "You are an expert at researching technical solutions from documentation and community resources.",
  },
};
