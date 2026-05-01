import type { ChapterDef } from "../schema";

export const ch03: ChapterDef = {
  slug: "agent-parameters",
  number: 4,
  phase: "Notebook 01",
  phaseTitle: "Build the Pipeline",
  title: "Agent Parameters",
  subtitle: "Control iteration limits, rate limiting, and timeouts",
  intro:
    "Notebook 01 also tunes the agents so the tool-using pipeline remains controlled. Agents can spiral — calling tools endlessly, burning through API quotas, or running for minutes on a simple task. Parameters like max_iter, max_rpm, and max_execution_time give you operational control to prevent this.",
  progression:
    "After adding file and search tools, cap the agents so the pipeline can run predictably.",
  takeaway:
    "Always set explicit limits in production. max_iter prevents runaway reasoning loops, max_rpm avoids rate-limit errors, and max_execution_time is your hard kill switch. A constrained agent is a reliable agent.",
  demos: [
    {
      id: "iteration-limits",
      question: "How does max_iter affect agent behavior?",
      controlLabel: "Iteration Limit",
      options: [
        {
          key: "unbounded",
          label: "Default (max_iter=20)",
          description: "Agent can take up to 20 reasoning loops — often unnecessary",
        },
        {
          key: "tight",
          label: "Tight (max_iter=5)",
          description: "Forces the agent to be decisive within 5 iterations",
        },
        {
          key: "minimal",
          label: "Very Tight (max_iter=3)",
          description: "Agent must produce a result in 3 iterations or less",
        },
      ],
      defaultLeft: "unbounded",
      defaultRight: "tight",
      variants: {
        unbounded: {
          label: "Default (max_iter=20)",
          description: "Without tight limits the agent over-iterates on simple tasks",
          log: [
            { tag: "BOOT", text: "Initializing agent with default parameters" },
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

The agent reached the right answer but wasted 4 extra iterations re-checking its own work.`,
        },
        tight: {
          label: "Tight (max_iter=5)",
          description: "Constrained agent is focused and efficient",
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
API calls: 6 (within 10 RPM limit)`,
        },
        minimal: {
          label: "Very Tight (max_iter=3)",
          description: "Extremely constrained — agent must be maximally decisive",
          log: [
            { tag: "BOOT", text: "Initializing agent with minimal parameters" },
            { tag: "INFO", text: "max_iter=3, max_rpm=5, max_execution_time=60" },
            { tag: "PROCESS", text: "Iteration 1: Quick scan for critical errors..." },
            { tag: "PROCESS", text: "Iteration 2: Root cause + recommendation..." },
            { tag: "OK", text: "Analysis complete in 2 iterations" },
          ],
          output: `Root cause: ImagePullBackOff on myapp:v1.2.3 — registry auth failure.
Fix: Create imagePullSecret and patch the ServiceAccount.

Iterations: 2 of 3 | Time: 8s | API calls: 4`,
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
