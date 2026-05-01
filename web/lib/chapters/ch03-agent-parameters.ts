import type { ChapterDef } from "../schema";

export const ch03: ChapterDef = {
  slug: "agent-parameters",
  number: 3,
  title: "Agent Parameters",
  subtitle: "Control iteration limits, rate limiting, and timeouts",
  objective:
    "Learn the operational knobs that prevent agents from spiraling — max_iter, max_rpm, max_execution_time, and respect_context_window.",
  highlightParam: "max_iter",
  concepts: [
    {
      id: "max-iter",
      title: "max_iter",
      description:
        "Maximum number of reasoning loops the agent can take before it must produce a final answer. Prevents infinite tool-calling spirals.",
      code: `log_analyzer = Agent(
    role="DevOps Log Analyzer",
    goal="Analyze logs to identify issues",
    llm=llm,
    backstory="Senior DevOps engineer...",
    max_iter=15,        # default is 20
    verbose=True,
)`,
    },
    {
      id: "max-rpm",
      title: "max_rpm",
      description:
        "Maximum requests per minute to the LLM API. Prevents rate-limit errors on shared API keys.",
      code: `log_analyzer = Agent(
    role="DevOps Log Analyzer",
    goal="Analyze logs to identify issues",
    llm=llm,
    backstory="Senior DevOps engineer...",
    max_rpm=10,         # throttle to 10 requests/min
    verbose=True,
)`,
    },
    {
      id: "max-execution-time",
      title: "max_execution_time",
      description:
        "Hard timeout in seconds. The agent is killed if it takes longer — essential for production reliability.",
      code: `log_analyzer = Agent(
    role="DevOps Log Analyzer",
    goal="Analyze logs to identify issues",
    llm=llm,
    backstory="Senior DevOps engineer...",
    max_execution_time=300,  # 5-minute hard limit
    verbose=True,
)`,
    },
    {
      id: "respect-context-window",
      title: "respect_context_window",
      description:
        "When True, the agent automatically summarizes conversation history if it approaches the LLM's context limit.",
      code: `log_analyzer = Agent(
    role="DevOps Log Analyzer",
    goal="Analyze logs to identify issues",
    llm=llm,
    backstory="Senior DevOps engineer...",
    respect_context_window=True,
    verbose=True,
)`,
    },
  ],
  inputSchema: [
    {
      key: "max_iter",
      label: "max_iter",
      kind: "select",
      options: ["5", "10", "15", "20", "25"],
    },
    {
      key: "max_rpm",
      label: "max_rpm",
      kind: "select",
      options: ["5", "10", "20", "50", "None"],
    },
    {
      key: "max_execution_time",
      label: "max_execution_time (seconds)",
      kind: "select",
      options: ["60", "120", "300", "600", "None"],
    },
  ],
  fixtures: {
    baseline: {
      label: "No Limits (Defaults)",
      description: "Without explicit limits the agent may over-iterate on complex logs",
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
The deployment failed because the image could not be pulled. 
The agent spent 7 iterations reaching this conclusion — excessive for a straightforward log.

Root cause: ImagePullBackOff on myapp:v1.2.3
Iterations used: 7 of 20 (unbounded)
Time: 45 seconds`,
    },
    enhanced: {
      label: "Tuned Parameters",
      description: "With max_iter=5, the agent is forced to be decisive and efficient",
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
API calls: Within 10 RPM limit`,
    },
  },
  agentConfig: {
    role: "DevOps Log Analyzer",
    goal: "Analyze log files to identify and extract specific issues, errors, and failure patterns",
    backstory:
      "You are a senior DevOps engineer specializing in production incident analysis.",
  },
};
