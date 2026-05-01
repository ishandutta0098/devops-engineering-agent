import type { ChapterDef } from "../schema";

export const ch01: ChapterDef = {
  slug: "first-agent",
  number: 1,
  title: "Your First Agent",
  subtitle: "Define a specialized AI worker with a role, goal, and backstory",
  objective:
    "Understand how an Agent is the atomic unit of CrewAI — a persona that guides the LLM's behavior.",
  concepts: [
    {
      id: "role",
      title: "Role",
      description:
        "A short title that tells the LLM what kind of expert it should act as. Think job title.",
      code: `log_analyzer = Agent(
    role="DevOps Log Analyzer",
    goal="Analyze log files to identify issues, errors, and failure patterns",
    llm=llm,
    backstory="""You are a senior DevOps engineer with 10 years of 
    experience in analyzing production logs and identifying 
    critical issues.""",
    verbose=True,
)`,
    },
    {
      id: "goal",
      title: "Goal",
      description:
        "A one-liner that defines what success looks like for this agent. The LLM will orient all its reasoning toward this goal.",
      code: `goal="Analyze log files to identify issues, errors, and failure patterns"`,
    },
    {
      id: "backstory",
      title: "Backstory",
      description:
        "Rich context that shapes the agent's expertise and personality. More backstory = more focused output.",
      code: `backstory="""You are a senior DevOps engineer with 10 years of 
    experience in analyzing production logs and identifying 
    critical issues. You excel at parsing through complex log files, 
    identifying error patterns, extracting relevant error messages, 
    and determining the root cause of failures from log data."""`,
    },
  ],
  inputSchema: [
    {
      key: "role",
      label: "Agent Role",
      kind: "text",
      placeholder: "DevOps Log Analyzer",
    },
    {
      key: "goal",
      label: "Agent Goal",
      kind: "textarea",
      placeholder: "Analyze log files to identify issues...",
      rows: 2,
    },
    {
      key: "backstory",
      label: "Agent Backstory",
      kind: "textarea",
      placeholder: "You are a senior DevOps engineer...",
      rows: 4,
    },
  ],
  fixtures: {
    baseline: {
      label: "Generic Role",
      description: "An agent with a vague role produces shallow analysis",
      log: [
        { tag: "BOOT", text: "Initializing agent: 'AI Assistant'" },
        { tag: "INFO", text: "Role set: AI Assistant" },
        { tag: "INFO", text: "Goal: Help with things" },
        { tag: "PROCESS", text: "Analyzing log input..." },
        { tag: "OK", text: "Analysis complete" },
      ],
      output: `The logs show some errors related to a deployment. There appears to be an issue with pulling a Docker image. The deployment eventually failed and a rollback was initiated.

Recommendation: Check the Docker image and try again.`,
    },
    enhanced: {
      label: "Specialized Role",
      description:
        "A well-defined DevOps role with specific backstory produces deep, structured analysis",
      log: [
        { tag: "BOOT", text: "Initializing agent: 'DevOps Log Analyzer'" },
        { tag: "INFO", text: "Role set: DevOps Log Analyzer" },
        { tag: "INFO", text: "Goal: Analyze log files to identify issues, errors, and failure patterns" },
        { tag: "INFO", text: "Backstory loaded: 10 years DevOps experience" },
        { tag: "PROCESS", text: "Parsing Kubernetes deployment logs..." },
        { tag: "PROCESS", text: "Identifying error cascade pattern..." },
        { tag: "PROCESS", text: "Extracting root cause from ImagePullBackOff..." },
        { tag: "OK", text: "Deep analysis complete" },
      ],
      output: `# Log Analysis Report

## Primary Issue
Production deployment failed due to ImagePullBackOff — the container runtime could not pull the image \`myapp:v1.2.3\`.

## Root Cause
The image reference \`myapp:v1.2.3\` either does not exist in the registry or the cluster lacks pull credentials. This triggered a cascade:
1. Pod stuck in Pending → ImagePullBackOff
2. Deployment exceeded progress deadline
3. Service had no healthy endpoints
4. Rollback initiated

## Error Timeline
- 14:32:15 — Deployment started
- 14:32:17 — Pod failed to start
- 14:32:18 — Image pull denied (root cause)
- 14:32:25 — Progress deadline exceeded
- 14:32:29 — Rollback initiated

## Recommendation
1. Verify the image tag \`v1.2.3\` exists in your container registry
2. Check imagePullSecrets on the ServiceAccount
3. Run \`docker login\` on the registry if credentials expired`,
    },
  },
  agentConfig: {
    role: "DevOps Log Analyzer",
    goal: "Analyze log files to identify and extract specific issues, errors, and failure patterns",
    backstory:
      "You are a senior DevOps engineer with 10 years of experience in analyzing production logs and identifying critical issues.",
  },
};
