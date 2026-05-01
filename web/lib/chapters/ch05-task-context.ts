import type { ChapterDef } from "../schema";

export const ch05: ChapterDef = {
  slug: "task-context",
  number: 5,
  title: "Task Context & Chaining",
  subtitle: "Pass output from one task as input to the next",
  objective:
    "Learn how context wires tasks together — the output of Task A becomes context for Task B.",
  concepts: [
    {
      id: "context-param",
      title: "The context Parameter",
      description:
        "Pass a list of tasks whose output should be available to this task. The downstream agent sees the upstream output in its prompt.",
      code: `research_task = Task(
    description="Research solutions for the issues found in the log analysis",
    expected_output="A list of solutions with implementation steps",
    agent=solution_researcher,
    context=[analyze_task],  # receives output from analyze_task
)`,
    },
    {
      id: "chaining-pattern",
      title: "Multi-Task Chaining",
      description:
        "Chain 3 tasks: analyze → research → write remediation plan. Each task builds on the previous.",
      code: `# Task 1: Analyze logs
analyze_task = Task(description="Analyze logs...", agent=log_analyzer)

# Task 2: Research solutions (uses analyze_task output)
research_task = Task(
    description="Research solutions...",
    agent=solution_researcher,
    context=[analyze_task],
)

# Task 3: Write plan (uses both previous outputs)
plan_task = Task(
    description="Write a remediation plan...",
    agent=plan_writer,
    context=[analyze_task, research_task],
)`,
    },
  ],
  inputSchema: [
    {
      key: "chain_mode",
      label: "Task Chain Mode",
      kind: "select",
      options: ["Single Task (no context)", "Chained Tasks (with context)"],
    },
  ],
  fixtures: {
    baseline: {
      label: "No Context",
      description: "Without context, the researcher starts from scratch — no access to the analysis",
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
Without the analysis output, I'll search for general deployment issues.

## Generic Solutions
- Check pod status with \`kubectl get pods\`
- Review events with \`kubectl describe pod <name>\`
- Check node resources with \`kubectl top nodes\`

Note: These are generic suggestions. I don't know the specific error 
because the analysis results weren't passed to me.`,
    },
    enhanced: {
      label: "With Context",
      description:
        "The researcher receives the analyzer's output via context= and provides targeted solutions",
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
Based on the analysis: ImagePullBackOff for image \`myapp:v1.2.3\`

## Targeted Solutions

### 1. Verify Image Exists
\`\`\`bash
docker manifest inspect myapp:v1.2.3
# If not found, check your CI/CD pipeline built and pushed this tag
\`\`\`

### 2. Fix Registry Credentials
\`\`\`bash
kubectl create secret docker-registry regcred \\
  --docker-server=registry.example.com \\
  --docker-username=\$USER \\
  --docker-password=\$TOKEN
kubectl patch serviceaccount default -p '{"imagePullSecrets":[{"name":"regcred"}]}'
\`\`\`

### 3. Validate Network Access
Ensure pods can reach the container registry (check NetworkPolicies, firewall rules).`,
    },
  },
  agentConfig: {
    role: "DevOps Solution Researcher",
    goal: "Find proven solutions and best practices for DevOps issues",
    backstory:
      "You are an expert at researching technical solutions from documentation and community resources.",
  },
};
