import type { ChapterDef } from "../schema";

export const ch07: ChapterDef = {
  slug: "guardrails",
  number: 8,
  phase: "Notebook 02",
  phaseTitle: "Harden the Pipeline",
  title: "Guardrails",
  subtitle: "Validate agent output with code-based and natural-language guardrails",
  intro:
    "Notebook 02 then adds quality gates. Structured output guarantees the shape is correct, but not the content. An agent can return a valid LogAnalysisReport with zero errors — even when there ARE errors hiding in INFO-level logs. Guardrails validate the content and force retries when quality is insufficient.",
  progression:
    "After making the analysis machine-readable, add retries for bad analysis and require concrete commands in the solution.",
  takeaway:
    "Guardrails are your quality gate. Code guardrails give you precise programmatic control. String guardrails let you express policies in plain English. Both force the agent to retry until the output meets your standards.",
  demos: [
    {
      id: "tricky-logs-guardrail",
      question: "Can the agent catch hidden issues in all-INFO logs?",
      controlLabel: "Guardrail",
      options: [
        {
          key: "no-guardrail",
          label: "No Guardrail",
          description: "Agent output is accepted without validation",
        },
        {
          key: "code-guardrail",
          label: "Code Guardrail",
          description: "validate_log_analysis() checks that errors list is non-empty",
        },
      ],
      defaultLeft: "no-guardrail",
      defaultRight: "code-guardrail",
      variants: {
        "no-guardrail": {
          label: "No Guardrail + Tricky Logs",
          description: "Agent sees all-INFO logs and returns zero errors — bad data flows downstream",
          log: [
            { tag: "BOOT", text: "Initializing crew — NO guardrail" },
            { tag: "INFO", text: "Input: tricky all-INFO log (0 records processed, 94% disk)" },
            { tag: "PROCESS", text: "Agent analyzing logs..." },
            { tag: "PROCESS", text: "All log entries are INFO level..." },
            { tag: "WARN", text: "Agent found 0 errors (incorrect!)" },
            { tag: "OK", text: "Output accepted without validation" },
          ],
          output: `{
  "primary_issue": "No critical issues found",
  "root_cause": "Disk usage at 94% may need monitoring",
  "errors": [],
  "affected_components": ["disk"],
  "timeline": [
    "09:01:22 - Cron job started",
    "09:01:27 - Cron job completed successfully"
  ]
}

Errors found: 0
Would pass guardrail? NO

The agent saw all-INFO logs and returned zero errors.
But "0 records processed" and "94% disk" ARE problems.
Without a guardrail, this empty report goes straight to the next agent.`,
        },
        "code-guardrail": {
          label: "Code Guardrail + Tricky Logs",
          description: "Guardrail catches the empty errors list, forces retry, agent looks deeper",
          log: [
            { tag: "BOOT", text: "Initializing crew — CODE guardrail attached" },
            { tag: "INFO", text: "Input: tricky all-INFO log (0 records processed, 94% disk)" },
            { tag: "PROCESS", text: "Agent analyzing logs (attempt 1)..." },
            { tag: "PROCESS", text: "All log entries are INFO level..." },
            { tag: "GUARDRAIL", text: "validate_log_analysis() → FAILED" },
            { tag: "ERROR", text: "Reason: 'Must identify at least one error'" },
            { tag: "RETRY", text: "Agent retrying with feedback..." },
            { tag: "PROCESS", text: "Agent analyzing logs (attempt 2)..." },
            { tag: "PROCESS", text: "Looking deeper: '0 records processed' is anomalous" },
            { tag: "PROCESS", text: "Looking deeper: '94% disk' exceeds safe threshold" },
            { tag: "GUARDRAIL", text: "validate_log_analysis() → PASSED" },
            { tag: "SUCCESS", text: "Output validated — 1 error found on retry" },
          ],
          output: `{
  "primary_issue": "Cron job processed zero records despite successful status",
  "root_cause": "Database query failure or data unavailability, compounded by 94% disk usage",
  "errors": [
    "0 records processed — indicates processing failure or empty dataset"
  ],
  "affected_components": [
    "Cron job: scheduled-cleanup",
    "Database cluster (primary)",
    "Disk storage (94% utilized)"
  ],
  "timeline": [
    "09:01:22 - Cron job started",
    "09:01:23 - Connected to database",
    "09:01:25 - 0 records processed (ANOMALY)",
    "09:01:26 - Disk at 94% (WARNING)",
    "09:01:27 - Job reported success (MISLEADING)"
  ]
}

Errors found: 1
Guardrail forced the agent to look deeper and catch the hidden issue!`,
        },
      },
    },
    {
      id: "guardrail-types",
      question: "Code guardrail vs string guardrail — how do they differ?",
      controlLabel: "Guardrail Type",
      options: [
        {
          key: "code",
          label: "Code Guardrail",
          description: "Python function that checks report.errors is non-empty",
        },
        {
          key: "string",
          label: "String Guardrail",
          description: "Plain English policy evaluated by an LLM",
        },
      ],
      defaultLeft: "code",
      defaultRight: "string",
      variants: {
        code: {
          label: "Code Guardrail",
          description: "Precise programmatic validation — you control the logic",
          log: [
            { tag: "BOOT", text: "Using code guardrail: validate_log_analysis()" },
            { tag: "INFO", text: "Logic: if not report.errors → (False, 'Must identify at least one error')" },
            { tag: "PROCESS", text: "Agent produces output..." },
            { tag: "GUARDRAIL", text: "Running validate_log_analysis()..." },
            { tag: "GUARDRAIL", text: "Check: len(report.errors) > 0 → True" },
            { tag: "SUCCESS", text: "Code guardrail PASSED" },
          ],
          output: `Code Guardrail: validate_log_analysis()

How it works:
- Receives the TaskOutput object
- Extracts the Pydantic model: report = result.pydantic
- Checks: if not report.errors → return (False, reason)
- If errors exist → return (True, report)

Pros:
- Precise control over validation logic
- Can check specific fields, counts, patterns
- Fast execution (no LLM call)

Cons:
- Must write a new function for each validation
- Only checks what you explicitly code`,
        },
        string: {
          label: "String Guardrail",
          description: "Natural language policy — LLM evaluates the output",
          log: [
            { tag: "BOOT", text: "Using string guardrail (natural language)" },
            { tag: "INFO", text: "Policy: 'Verify ≥3 copy-pasteable shell commands...'" },
            { tag: "PROCESS", text: "Agent produces solution output..." },
            { tag: "GUARDRAIL", text: "LLM Guardrail Agent evaluating output..." },
            { tag: "GUARDRAIL", text: "Checking: Does output contain ≥3 shell commands?" },
            { tag: "GUARDRAIL", text: "Found: kubectl create secret, kubectl patch, kubectl rollout" },
            { tag: "SUCCESS", text: "String guardrail PASSED" },
          ],
          output: `String Guardrail: "Verify the solution includes at least 3 
copy-pasteable shell commands that an engineer can run immediately."

How it works:
- CrewAI sends your string + the agent output to a Guardrail Agent
- The LLM evaluates whether the output meets the criteria
- If it fails, the original agent retries with feedback

Pros:
- No code needed — write policies in plain English
- Can check semantic quality, not just structure
- Easy to add new policies

Cons:
- Costs an extra LLM call per check
- Less deterministic than code
- Slower evaluation`,
        },
      },
    },
  ],
  agentConfig: {
    role: "DevOps Log Analyzer",
    goal: "Analyze log files and identify ALL issues, including subtle ones",
    backstory:
      "You are a senior DevOps engineer who catches issues that others miss.",
  },
};
