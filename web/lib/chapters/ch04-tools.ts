import type { ChapterDef } from "../schema";

export const ch04: ChapterDef = {
  slug: "tools",
  number: 4,
  title: "Adding Tools",
  subtitle: "Give agents real-world capabilities with FileReadTool and EXASearchTool",
  objective:
    "Learn how Tools extend what an agent can do — from reading files to searching the web.",
  concepts: [
    {
      id: "file-read-tool",
      title: "FileReadTool",
      description:
        "Lets the agent read any file on disk. Pass the file path as a task input variable.",
      code: `from crewai_tools import FileReadTool

log_reader_tool = FileReadTool()

log_analyzer = Agent(
    role="DevOps Log Analyzer",
    goal="Analyze logs to identify issues",
    llm=llm,
    backstory="Senior DevOps engineer...",
    tools=[log_reader_tool],
    verbose=True,
)`,
    },
    {
      id: "exa-search-tool",
      title: "EXASearchTool",
      description:
        "Web search powered by EXA. The agent can look up documentation, Stack Overflow answers, and known issues.",
      code: `from crewai_tools import EXASearchTool

search_tool = EXASearchTool()

solution_researcher = Agent(
    role="DevOps Solution Researcher",
    goal="Find proven solutions and best practices for DevOps issues",
    llm=llm,
    backstory="Expert at finding solutions from documentation...",
    tools=[search_tool],
    verbose=True,
)`,
    },
    {
      id: "input-variables",
      title: "Input Variables",
      description:
        "Use {variable_name} in task descriptions to pass dynamic data at runtime via crew.kickoff(inputs={...}).",
      code: `analyze_task = Task(
    description="Analyze the log file at {log_file_path}",
    expected_output="A detailed analysis report",
    agent=log_analyzer,
)

crew.kickoff(inputs={"log_file_path": "/var/log/app.log"})`,
    },
  ],
  inputSchema: [
    {
      key: "tool_choice",
      label: "Tool Configuration",
      kind: "select",
      options: ["No Tools", "FileReadTool only", "FileReadTool + EXASearchTool"],
    },
  ],
  fixtures: {
    baseline: {
      label: "No Tools",
      description: "Without tools, the agent can only work with data embedded in the task description",
      log: [
        { tag: "BOOT", text: "Initializing agent: DevOps Log Analyzer" },
        { tag: "INFO", text: "Tools: None" },
        { tag: "PROCESS", text: "Agent reading inline log data from task description..." },
        { tag: "WARN", text: "Agent cannot read external files" },
        { tag: "WARN", text: "Agent cannot search for solutions online" },
        { tag: "OK", text: "Analysis based only on provided text" },
      ],
      output: `# Analysis (No Tools)
Based on the log snippet provided in the task:

Issue: ImagePullBackOff error
Root Cause: Image myapp:v1.2.3 cannot be pulled

Note: I cannot read the full log file or search for related issues. 
My analysis is limited to the data embedded in the task description.`,
    },
    enhanced: {
      label: "FileReadTool + EXASearchTool",
      description:
        "With tools, the agent reads the full log file and searches for known solutions",
      log: [
        { tag: "BOOT", text: "Initializing agent: DevOps Log Analyzer" },
        { tag: "INFO", text: "Tools: FileReadTool, EXASearchTool" },
        { tag: "PROCESS", text: "Using FileReadTool to read /var/log/k8s/deployment.log..." },
        { tag: "INFO", text: "Read 847 lines from log file" },
        { tag: "PROCESS", text: "Identified ImagePullBackOff error pattern" },
        { tag: "PROCESS", text: "Using EXASearchTool: 'Kubernetes ImagePullBackOff troubleshooting'" },
        { tag: "INFO", text: "Found 5 relevant articles and K8s documentation" },
        { tag: "PROCESS", text: "Cross-referencing log errors with known solutions..." },
        { tag: "OK", text: "Comprehensive analysis with solutions complete" },
      ],
      output: `# Analysis (With Tools)

## Log File Analysis
Read 847 lines from /var/log/k8s/deployment.log

## Issue
ImagePullBackOff on pod myapp-deployment-7b8c9d5f4-abc12

## Root Cause
Image \`myapp:v1.2.3\` not found in registry. Confirmed via log entries at 14:32:18.

## Solutions Found (via web search)
1. **Verify image exists**: \`docker manifest inspect myapp:v1.2.3\`
2. **Check credentials**: Ensure imagePullSecrets are configured
3. **Registry access**: Verify network policies allow egress to registry
4. **Kubernetes docs**: https://kubernetes.io/docs/concepts/containers/images/

## Recommended Fix
\`\`\`bash
kubectl create secret docker-registry regcred \\
  --docker-server=<registry> \\
  --docker-username=<user> \\
  --docker-password=<pass>
\`\`\``,
    },
  },
  agentConfig: {
    role: "DevOps Log Analyzer",
    goal: "Analyze log files and find solutions for identified issues",
    backstory:
      "You are a senior DevOps engineer who uses tools to read files and research solutions.",
  },
};
