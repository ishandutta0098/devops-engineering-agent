import type { ChapterDef } from "../schema";

export const ch03: ChapterDef = {
  slug: "agent-parameters",
  number: 4,
  phase: "Notebook 01",
  title: "Agent Parameters",
  subtitle: "Control iteration limits, rate limiting, and timeouts",
  intro:
    "Notebook 01 also tunes the agents so the tool-using pipeline remains controlled. Think of these settings as simple safety rails: max_iter limits how many thinking steps the agent can take, max_rpm limits how quickly it can call the model or tools, and max_execution_time stops the run if it takes too long.",
  takeaway:
    "Use parameters to match the size of the job. Simple checks need fewer steps. Research tasks need more room. Production runs need enough time to finish, but still need a clear stop point.",
  demos: [],
  iterationDemo: {
    question: "How do parameter limits change a single run?",
    runs: [
      {
        key: "tight",
        label: "Very Tight",
        description: "max_iter=2, max_rpm=3, max_execution_time=20s — fast and cheap, but no room to recover from a failed tool call.",
        params: { max_iter: 2, max_rpm: 3, max_execution_time: 20 },
        iterations: [
          {
            label: "Iter 1 / 2",
            status: "FAIL",
            steps: [
              {
                label: "FileReadTool('kubernetes_deployment_error.log')",
                detail: "Tool errored: registry timeout while reading file",
                status: "FAIL",
                duration: "0.6s",
              },
              {
                label: "Reason: retry the read",
                detail: "Agent decides to retry on the next iteration",
                status: "RETRY",
                duration: "0.4s",
              },
            ],
          },
          {
            label: "Iter 2 / 2",
            status: "CAPPED",
            steps: [
              {
                label: "FileReadTool('kubernetes_deployment_error.log')",
                detail: "Tool errored again — transient registry issue",
                status: "FAIL",
                duration: "0.7s",
              },
              {
                label: "Iteration ceiling reached",
                detail: "max_iter=2 hit — no further steps allowed",
                status: "FAIL",
                duration: "—",
              },
            ],
          },
        ],
        verdict: {
          status: "FAILED",
          summary:
            "Agent unable to complete the task. Tool calls failed twice and max_iter=2 left no room for a third attempt or a fallback reasoning step.",
        },
      },
      {
        key: "decent",
        label: "Decent",
        description: "max_iter=5, max_rpm=10, max_execution_time=120s — enough room to recover and finish in 3 iterations.",
        params: { max_iter: 5, max_rpm: 10, max_execution_time: 120 },
        iterations: [
          {
            label: "Iter 1 / 5",
            status: "OK",
            steps: [
              {
                label: "FileReadTool('kubernetes_deployment_error.log')",
                detail: "Read 21 lines from disk",
                status: "OK",
                duration: "0.5s",
              },
            ],
          },
          {
            label: "Iter 2 / 5",
            status: "OK",
            steps: [
              {
                label: "Reason: scan ERROR / CRITICAL entries",
                detail: "Agent identifies ImagePullBackOff and rollback cascade",
                status: "OK",
                duration: "1.2s",
              },
            ],
          },
          {
            label: "Iter 3 / 5",
            status: "OK",
            steps: [
              {
                label: "Reason: build root-cause summary",
                detail: "Compiles report with primary issue, cascade, and recommendation",
                status: "OK",
                duration: "1.4s",
              },
              {
                label: "Final answer ready",
                detail: "Within budget — 3 of 5 iterations used, 6 API calls",
                status: "OK",
                duration: "0.2s",
              },
            ],
          },
        ],
        verdict: {
          status: "SUCCESS",
          summary:
            "Analysis returned in 3 of 5 iterations, 6 API calls (well under 10 RPM), 3.3s of 120s. Budget gave the agent room to act, but a clear stop point.",
        },
      },
    ],
  },
  webSearchDemo: {
    toolInput: "Investigate ImagePullBackOff for myapp:v1.2.3",
    queries: [
      {
        query: "ImagePullBackOff registry auth pull access denied",
        results: [
          {
            title: "Pull an Image from a Private Registry",
            source: "kubernetes.io/docs/tasks/configure-pod-container",
            snippet:
              "Create a Secret of type kubernetes.io/dockerconfigjson and reference it via imagePullSecrets on the ServiceAccount.",
          },
          {
            title: "ImagePullBackOff — pull access denied",
            source: "stackoverflow.com/questions/75120000",
            snippet:
              "Verify the tag exists with `docker manifest inspect` before debugging cluster-side auth.",
          },
        ],
      },
      {
        query: "kubernetes imagePullSecret rotation serviceaccount",
        results: [
          {
            title: "Patch a ServiceAccount with imagePullSecrets",
            source: "kubernetes.io/docs/tasks/configure-pod-container",
            snippet:
              "kubectl patch sa default -p '{\"imagePullSecrets\":[{\"name\":\"regcred\"}]}'",
          },
          {
            title: "Rotating registry credentials safely",
            source: "cloud.google.com/kubernetes-engine/docs",
            snippet:
              "Recreate the secret then `rollout restart` the affected deployments to pick up the new value.",
          },
        ],
      },
      {
        query: "docker manifest inspect tag missing v1.2.3",
        results: [
          {
            title: "docker manifest inspect — verify a tag exists",
            source: "docs.docker.com/engine/reference/commandline/manifest",
            snippet:
              "Returns the manifest of an image in a registry without pulling. Failure means the tag never landed.",
          },
        ],
      },
    ],
    compiledContext: `{
  "queries": [
    "ImagePullBackOff registry auth pull access denied",
    "kubernetes imagePullSecret rotation serviceaccount",
    "docker manifest inspect tag missing v1.2.3"
  ],
  "top_sources": [
    "kubernetes.io/docs/tasks/configure-pod-container",
    "stackoverflow.com/questions/75120000",
    "docs.docker.com/engine/reference/commandline/manifest"
  ],
  "summary": "ImagePullBackOff with 'pull access denied' usually means either the tag is missing from the registry (verify with docker manifest inspect) or the cluster's ServiceAccount has no valid imagePullSecret. Common fix: recreate the docker-registry secret and patch the ServiceAccount, then rollout restart the deployment.",
  "suggested_commands": [
    "docker manifest inspect myapp:v1.2.3",
    "kubectl create secret docker-registry regcred --docker-server=... --docker-username=... --docker-password=...",
    "kubectl patch sa default -p '{\\"imagePullSecrets\\":[{\\"name\\":\\"regcred\\"}]}'",
    "kubectl rollout restart deployment myapp"
  ]
}`,
  },
  agentConfig: {
    role: "DevOps Log Analyzer",
    goal: "Analyze log files to identify and extract specific issues, errors, and failure patterns",
    backstory:
      "You are a senior DevOps engineer specializing in production incident analysis.",
  },
};
