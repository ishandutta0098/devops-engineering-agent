import type { ChapterDef } from "../schema";

export const ch04: ChapterDef = {
  slug: "tools",
  number: 3,
  phase: "Notebook 01",
  phaseTitle: "Build the Pipeline",
  title: "Adding Tools",
  subtitle: "Give agents real-world capabilities with FileReadTool and EXASearchTool",
  intro:
    "Notebook 01 then gives the pipeline real inputs. Without tools, agents can only work with data you paste into the task description. Tools like FileReadTool and EXASearchTool let agents read files, search the web, and access real-world data autonomously.",
  progression:
    "Move from prompt-only analysis to the notebook's actual DevOps setup: log files on disk and web research for remediation.",
  takeaway:
    "Tools transform agents from text processors into autonomous workers. FileReadTool lets them read any file, EXASearchTool lets them research solutions. The combination of both produces analysis with real, cited solutions.",
  examples: [
    {
      title: "Inline snippet",
      scenario: "You paste only five log lines into the task prompt.",
      change: "The agent has no file tool and can only use what you pasted.",
      outcome: "It can guess the issue, but it cannot see earlier successful deployments.",
    },
    {
      title: "Full log file",
      scenario: "The agent reads the complete Kubernetes deployment log from disk.",
      change: "FileReadTool gives it the before-and-after context around the failure.",
      outcome: "It notices the image changed from v1.2.2 to v1.2.3.",
    },
    {
      title: "Research-backed fix",
      scenario: "The agent also searches for ImagePullBackOff remediation patterns.",
      change: "EXASearchTool adds documentation and community fixes to the analysis.",
      outcome: "The answer moves from diagnosis to practical commands.",
    },
  ],
  demos: [
    {
      id: "tools-impact",
      question: "How do tools change what the agent can do?",
      controlLabel: "Tool Configuration",
      options: [
        {
          key: "no-tools",
          label: "No Tools",
          description: "Agent can only work with data in the task description",
        },
        {
          key: "file-read",
          label: "FileReadTool",
          description: "Agent can read log files from disk autonomously",
        },
        {
          key: "file-and-search",
          label: "FileReadTool + EXASearchTool",
          description: "Agent reads files and searches the web for solutions",
        },
      ],
      defaultLeft: "no-tools",
      defaultRight: "file-and-search",
      variants: {
        "no-tools": {
          label: "No Tools",
          description: "Without tools, analysis is limited to embedded data",
          log: [
            { tag: "BOOT", text: "Initializing agent: DevOps Log Analyzer" },
            { tag: "INFO", text: "Tools: None" },
            { tag: "PROCESS", text: "Reading inline log data from task description..." },
            { tag: "WARN", text: "Cannot read external files" },
            { tag: "WARN", text: "Cannot search for solutions online" },
            { tag: "OK", text: "Analysis based only on provided text" },
          ],
          output: `# Analysis (No Tools)
Based on the log snippet provided in the task:

Issue: ImagePullBackOff error
Root Cause: Image myapp:v1.2.3 cannot be pulled

I cannot read the full log file or search for related issues.
My analysis is limited to the data embedded in the task description.`,
        },
        "file-read": {
          label: "FileReadTool Only",
          description: "Agent reads the full log but can't research solutions",
          log: [
            { tag: "BOOT", text: "Initializing agent: DevOps Log Analyzer" },
            { tag: "INFO", text: "Tools: FileReadTool" },
            { tag: "PROCESS", text: "Using FileReadTool to read /var/log/k8s/deployment.log..." },
            { tag: "INFO", text: "Read 847 lines from log file" },
            { tag: "PROCESS", text: "Analyzing full log context..." },
            { tag: "PROCESS", text: "Identified ImagePullBackOff with surrounding context" },
            { tag: "OK", text: "Full-context analysis complete" },
          ],
          output: `# Analysis (FileReadTool)
Read 847 lines from /var/log/k8s/deployment.log

## Issue
ImagePullBackOff on pod myapp-deployment-7b8c9d5f4-abc12

## Full Context (from log file)
The log shows 3 previous successful deployments before this failure.
The image tag changed from v1.2.2 (working) to v1.2.3 (failing).
No other pods in the namespace are affected.

## Root Cause
Image myapp:v1.2.3 does not exist or credentials are missing.
The previous tag v1.2.2 worked, suggesting a CI/CD build issue.

## Recommendation
Check if v1.2.3 was actually pushed to the registry.`,
        },
        "file-and-search": {
          label: "FileReadTool + EXASearchTool",
          description: "Agent reads files AND searches for solutions",
          log: [
            { tag: "BOOT", text: "Initializing agent: DevOps Log Analyzer" },
            { tag: "INFO", text: "Tools: FileReadTool, EXASearchTool" },
            { tag: "PROCESS", text: "Using FileReadTool to read /var/log/k8s/deployment.log..." },
            { tag: "INFO", text: "Read 847 lines from log file" },
            { tag: "PROCESS", text: "Identified ImagePullBackOff error pattern" },
            { tag: "PROCESS", text: "Using EXASearchTool: 'Kubernetes ImagePullBackOff troubleshooting'" },
            { tag: "INFO", text: "Found 5 relevant articles and K8s documentation" },
            { tag: "PROCESS", text: "Cross-referencing errors with known solutions..." },
            { tag: "OK", text: "Comprehensive analysis with solutions" },
          ],
          output: `# Analysis (FileReadTool + EXASearchTool)
Read 847 lines from /var/log/k8s/deployment.log
Searched: "Kubernetes ImagePullBackOff troubleshooting"

## Issue
ImagePullBackOff on pod myapp-deployment-7b8c9d5f4-abc12

## Root Cause
Image myapp:v1.2.3 not found in registry (previous v1.2.2 worked).

## Solutions Found (via web search)

### 1. Verify Image Exists
docker manifest inspect myapp:v1.2.3

### 2. Fix Registry Credentials
kubectl create secret docker-registry regcred \\
  --docker-server=registry.example.com \\
  --docker-username=$USER \\
  --docker-password=$TOKEN

kubectl patch serviceaccount default \\
  -p '{"imagePullSecrets":[{"name":"regcred"}]}'

### 3. Validate Network Access
Check NetworkPolicies allow egress to container registry.

### Sources
- kubernetes.io/docs/concepts/containers/images/
- stackoverflow.com/questions/kubernetes-imagepullbackoff`,
        },
      },
    },
  ],
  agentConfig: {
    role: "DevOps Log Analyzer",
    goal: "Analyze log files and find solutions for identified issues",
    backstory:
      "You are a senior DevOps engineer who uses tools to read files and research solutions.",
  },
};
