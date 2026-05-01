import type { ChapterDef } from "../schema";

export const ch01: ChapterDef = {
  slug: "first-agent",
  number: 1,
  title: "Your First Agent",
  subtitle: "Define a specialized AI worker with a role, goal, and backstory",
  intro:
    "An Agent is the atomic unit of CrewAI — a persona that guides the LLM's behavior. The role tells it what kind of expert to be, the goal orients its reasoning, and the backstory shapes its depth. Watch how changing these dramatically alters the output.",
  takeaway:
    "A well-defined role, goal, and backstory is the difference between a generic chatbot and a domain expert. The more specific the persona, the deeper and more actionable the output.",
  demos: [
    {
      id: "role-impact",
      question: "How does a specific role change the analysis?",
      controlLabel: "Agent Role",
      options: [
        {
          key: "generic",
          label: "Generic AI Assistant",
          description: "A vague role with no domain expertise",
        },
        {
          key: "devops",
          label: "DevOps Log Analyzer",
          description: "A specialized role with deep infrastructure knowledge",
        },
      ],
      defaultLeft: "generic",
      defaultRight: "devops",
      variants: {
        generic: {
          label: "Generic AI Assistant",
          description: "Vague role produces surface-level analysis",
          log: [
            { tag: "BOOT", text: "Initializing agent: 'AI Assistant'" },
            { tag: "INFO", text: "Role: AI Assistant" },
            { tag: "INFO", text: "Goal: Help with things" },
            { tag: "PROCESS", text: "Analyzing log input..." },
            { tag: "OK", text: "Analysis complete" },
          ],
          output: `The logs show some errors related to a deployment. There appears to be an issue with pulling a Docker image. The deployment eventually failed and a rollback was initiated.

Recommendation: Check the Docker image and try again.`,
        },
        devops: {
          label: "DevOps Log Analyzer",
          description: "Specialized role produces deep, structured analysis",
          log: [
            { tag: "BOOT", text: "Initializing agent: 'DevOps Log Analyzer'" },
            { tag: "INFO", text: "Role: DevOps Log Analyzer" },
            { tag: "INFO", text: "Goal: Analyze log files to identify issues, errors, and failure patterns" },
            { tag: "INFO", text: "Backstory loaded: 10 years DevOps experience" },
            { tag: "PROCESS", text: "Parsing Kubernetes deployment logs..." },
            { tag: "PROCESS", text: "Identifying error cascade pattern..." },
            { tag: "PROCESS", text: "Extracting root cause from ImagePullBackOff..." },
            { tag: "OK", text: "Deep analysis complete" },
          ],
          output: `# Log Analysis Report

## Primary Issue
Production deployment failed due to ImagePullBackOff — the container runtime could not pull the image myapp:v1.2.3.

## Root Cause
The image reference myapp:v1.2.3 either does not exist in the registry or the cluster lacks pull credentials. This triggered a cascade:
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
1. Verify the image tag v1.2.3 exists in your container registry
2. Check imagePullSecrets on the ServiceAccount
3. Run docker login on the registry if credentials expired`,
        },
      },
    },
    {
      id: "backstory-depth",
      question: "What happens when you add a detailed backstory?",
      controlLabel: "Backstory",
      options: [
        {
          key: "none",
          label: "No Backstory",
          description: "Agent has role and goal only",
        },
        {
          key: "detailed",
          label: "Detailed Backstory",
          description: "Agent has 10 years of DevOps expertise described in backstory",
        },
      ],
      defaultLeft: "none",
      defaultRight: "detailed",
      variants: {
        none: {
          label: "No Backstory",
          description: "Without backstory, the agent lacks contextual depth",
          log: [
            { tag: "BOOT", text: "Initializing agent: DevOps Log Analyzer" },
            { tag: "INFO", text: "Backstory: (empty)" },
            { tag: "PROCESS", text: "Analyzing logs..." },
            { tag: "OK", text: "Basic analysis complete" },
          ],
          output: `The deployment failed because the Docker image myapp:v1.2.3 could not be pulled. The pod went into ImagePullBackOff state. The deployment was rolled back.

Fix: Check the image name and registry credentials.`,
        },
        detailed: {
          label: "Detailed Backstory",
          description: "Rich backstory shapes the agent's expertise and analysis depth",
          log: [
            { tag: "BOOT", text: "Initializing agent: DevOps Log Analyzer" },
            { tag: "INFO", text: "Backstory: Senior DevOps engineer, 10 years experience, expert in log analysis" },
            { tag: "PROCESS", text: "Cross-referencing error patterns with known failure modes..." },
            { tag: "PROCESS", text: "Analyzing cascading failure sequence..." },
            { tag: "PROCESS", text: "Checking for credential-related root causes..." },
            { tag: "OK", text: "Expert-level analysis complete" },
          ],
          output: `# Expert Analysis

## Failure Pattern: Registry Authentication Cascade
This is a classic ImagePullBackOff cascade that I've seen hundreds of times in production Kubernetes clusters.

## Root Cause Identification
The error "pull access denied, repository does not exist or may require 'docker login'" is the telltale sign. Two possibilities:
1. Image tag v1.2.3 was never pushed (CI/CD pipeline failure)
2. Registry credentials expired or were never configured

## Cascade Analysis
The failure follows a predictable pattern:
- Image pull fails → Pod stuck in Pending (not CrashLoopBackOff, which would indicate the image exists but the app crashes)
- Kubernetes retries with exponential backoff (ImagePullBackOff)
- Deployment controller's progressDeadlineSeconds exceeded
- Service endpoints become empty → 503s for any traffic

## Immediate Actions
1. kubectl describe pod myapp-deployment-7b8c9d5f4-abc12 (confirm ImagePullBackOff)
2. docker manifest inspect myapp:v1.2.3 (verify image exists)
3. kubectl get secret -o yaml | grep .dockerconfigjson (check credentials)

## Prevention
- Add image existence check to CI/CD gate
- Set up credential rotation alerts
- Use imagePullPolicy: IfNotPresent for stable tags`,
        },
      },
    },
  ],
  agentConfig: {
    role: "DevOps Log Analyzer",
    goal: "Analyze log files to identify and extract specific issues, errors, and failure patterns",
    backstory:
      "You are a senior DevOps engineer with 10 years of experience in analyzing production logs and identifying critical issues.",
  },
};
