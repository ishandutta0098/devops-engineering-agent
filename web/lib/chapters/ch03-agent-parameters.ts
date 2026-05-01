import type { ChapterDef } from "../schema";

export const ch03: ChapterDef = {
  slug: "agent-parameters",
  number: 4,
  phase: "Notebook 01",
  phaseTitle: "Build the Pipeline",
  title: "Agent Parameters",
  subtitle: "Control iteration limits, rate limiting, and timeouts",
  intro:
    "Notebook 01 also tunes the agents so the tool-using pipeline remains controlled. Think of these settings as simple safety rails: max_iter limits how many thinking steps the agent can take, max_rpm limits how quickly it can call the model or tools, and max_execution_time stops the run if it takes too long.",
  progression:
    "After adding file and search tools, choose limits that match the job: small for quick log checks, medium for web research, and larger for production incident work.",
  takeaway:
    "Use parameters to match the size of the job. Simple checks need fewer steps. Research tasks need more room. Production runs need enough time to finish, but still need a clear stop point.",
  examples: [
    {
      title: "Quick log check",
      scenario: "You only need to spot the obvious deployment error in one log file.",
      change: "Use a small `max_iter` because the agent should read, identify the root cause, and stop.",
      outcome: "The answer arrives quickly, with less wasted reasoning and fewer API calls.",
    },
    {
      title: "Research with search",
      scenario: "The agent reads the log and searches for Kubernetes ImagePullBackOff fixes.",
      change: "Use a moderate `max_iter` and `max_rpm` so search has room without hitting rate limits.",
      outcome: "The agent can gather solutions, but it cannot keep searching forever.",
    },
    {
      title: "Production incident",
      scenario: "A full pipeline must analyze logs, research fixes, and produce a remediation plan.",
      change: "Use a longer `max_execution_time` so the run can finish, while still setting a hard stop.",
      outcome: "The pipeline has enough room for useful work but will not hang during an incident.",
    },
  ],
  demos: [
    {
      id: "iteration-limits",
      question: "How do parameter limits change the run?",
      controlLabel: "Parameter Preset",
      options: [
        {
          key: "unbounded",
          label: "Too Loose",
          description: "Lots of room, but the agent may spend time re-checking obvious answers",
        },
        {
          key: "tight",
          label: "Balanced",
          description: "Enough room for a normal log analysis without drifting",
        },
        {
          key: "minimal",
          label: "Very Tight",
          description: "Fast for simple checks, but risky for deeper research",
        },
      ],
      defaultLeft: "unbounded",
      defaultRight: "tight",
      variants: {
        unbounded: {
          label: "Too Loose",
          description: "The agent has more room than this simple log check needs",
          log: [
            { tag: "BOOT", text: "Initializing agent with loose parameters" },
            { tag: "INFO", text: "max_iter=20, max_rpm=None, max_execution_time=None" },
            { tag: "PROCESS", text: "Iteration 1: Reading log data..." },
            { tag: "PROCESS", text: "Iteration 2: Cross-referencing errors..." },
            { tag: "PROCESS", text: "Iteration 3: Searching for similar patterns..." },
            { tag: "PROCESS", text: "Iteration 4: Re-analyzing timeline..." },
            { tag: "PROCESS", text: "Iteration 5: Verifying root cause..." },
            { tag: "PROCESS", text: "Iteration 6: Still cross-referencing..." },
            { tag: "PROCESS", text: "Iteration 7: Redundant re-check..." },
            { tag: "WARN", text: "Agent used 7 iterations for a simple analysis" },
            { tag: "OK", text: "Analysis complete (took longer than necessary)" },
          ],
          output: `# Analysis Report
Root cause: ImagePullBackOff on myapp:v1.2.3

Iterations used: 7 of 20 (unbounded)
Time: 45 seconds
API calls: 14 (unthrottled)

What happened:
- max_iter was high, so the agent kept checking after it already had the answer.
- max_rpm was empty, so there was no speed limit on requests.
- max_execution_time was empty, so there was no hard stop.

The agent reached the right answer but wasted 4 extra iterations re-checking its own work.`,
        },
        tight: {
          label: "Balanced",
          description: "The agent has enough room for normal analysis and a clear stop point",
          log: [
            { tag: "BOOT", text: "Initializing agent with tuned parameters" },
            { tag: "INFO", text: "max_iter=5, max_rpm=10, max_execution_time=120" },
            { tag: "PROCESS", text: "Iteration 1: Scanning for ERROR/CRITICAL entries..." },
            { tag: "PROCESS", text: "Iteration 2: Building failure timeline..." },
            { tag: "PROCESS", text: "Iteration 3: Identifying root cause..." },
            { tag: "OK", text: "Analysis complete in 3 iterations" },
          ],
          output: `# Analysis Report
Root cause: ImagePullBackOff — image myapp:v1.2.3 not found or credentials missing.

Cascade: Image pull failed → Pod Pending → Deadline exceeded → Rollback

Iterations used: 3 of 5 (bounded)
Time: 12 seconds
API calls: 6 (within 10 RPM limit)

What happened:
- max_iter gave the agent enough thinking steps without inviting loops.
- max_rpm slowed requests to a safe pace.
- max_execution_time would stop the run after 120 seconds if something got stuck.`,
        },
        minimal: {
          label: "Very Tight",
          description: "The agent must answer quickly, which only works for simple checks",
          log: [
            { tag: "BOOT", text: "Initializing agent with minimal parameters" },
            { tag: "INFO", text: "max_iter=3, max_rpm=5, max_execution_time=60" },
            { tag: "PROCESS", text: "Iteration 1: Quick scan for critical errors..." },
            { tag: "PROCESS", text: "Iteration 2: Root cause + recommendation..." },
            { tag: "OK", text: "Analysis complete in 2 iterations" },
          ],
          output: `Root cause: ImagePullBackOff on myapp:v1.2.3 — registry auth failure.
Fix: Create imagePullSecret and patch the ServiceAccount.

Iterations: 2 of 3 | Time: 8s | API calls: 4

What happened:
- This is fast and cheap for obvious errors.
- It may be too tight if the agent needs web research or multiple tools.
- Use this preset only when the task is small and predictable.`,
        },
      },
    },
  ],
  agentConfig: {
    role: "DevOps Log Analyzer",
    goal: "Analyze log files to identify and extract specific issues, errors, and failure patterns",
    backstory:
      "You are a senior DevOps engineer specializing in production incident analysis.",
  },
};
