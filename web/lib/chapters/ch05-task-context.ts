import type { ChapterDef } from "../schema";

export const ch05: ChapterDef = {
  slug: "task-context",
  number: 5,
  phase: "Notebook 01",
  title: "Task Context & Chaining",
  subtitle: "Pass output from one task as input to the next",
  intro:
    "Notebook 01's second agent only works well when it receives the first agent's findings. In a multi-agent system, the output of one agent needs to flow into the next. The context parameter on a Task injects upstream task outputs into the downstream agent's prompt automatically — no manual wiring needed.",
  takeaway:
    "Context chaining is what makes multi-agent systems powerful. Without it, each agent works in isolation. With it, downstream agents build on upstream results — producing targeted, specific output instead of generic guesses.",
  demos: [],
  contextHandoff: {
    analyzerOutput: `{
  primary_issue: "ImagePullBackOff on myapp:v1.2.3",
  root_cause:    "Registry auth missing / tag not pushed",
  errors: [
    "ImagePullBackOff",
    "progressDeadlineExceeded",
    "0/3 ready replicas",
    "rollback to v1.2.2"
  ]
}`,
    contextPayload: `{ primary_issue,
  root_cause,
  errors[4] }`,
    researcherWithoutContext: `# Researcher (no context)

The Researcher agent has no upstream
findings to anchor on. Its query is a
generic placeholder, and the answer is
the same kubectl bookmark list anyone
would get for "kubernetes errors".

- kubectl get pods -A
- kubectl describe pod <name>
- kubectl top nodes
- kubectl rollout history deployment

I don't know which image, which
namespace, or which error to chase —
because nothing was passed to me.`,
    researcherWithContext: `# Researcher (with context)

Anchored on Analyzer output, the query
becomes specific:

  EXASearchTool(
    "ImagePullBackOff myapp:v1.2.3
     registry auth fix")

# Targeted plan
1. Verify the tag exists:
   docker manifest inspect myapp:v1.2.3
2. Refresh the registry secret on the
   ServiceAccount:
   kubectl patch sa default -p \\
     '{"imagePullSecrets":[{"name":"regcred"}]}'
3. kubectl rollout restart deployment myapp
   to pick up the new secret.`,
  },
  agentConfig: {
    role: "DevOps Solution Researcher",
    goal: "Find proven solutions and best practices for DevOps issues",
    backstory:
      "You are an expert at researching technical solutions from documentation and community resources.",
  },
};
