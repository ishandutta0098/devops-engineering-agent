import type { ChapterDef } from "../schema";

export const ch07: ChapterDef = {
  slug: "guardrails",
  number: 7,
  title: "Guardrails",
  subtitle: "Validate agent output with code-based and natural-language guardrails",
  objective:
    "Learn how guardrails catch bad output before it reaches the next agent — and force the agent to retry.",
  concepts: [
    {
      id: "code-guardrail",
      title: "Code Guardrail",
      description:
        "A Python function that receives the TaskOutput and returns (True, data) to pass or (False, reason) to fail. On failure, the agent retries.",
      code: `from crewai import TaskOutput

def validate_log_analysis(result: TaskOutput) -> tuple[bool, any]:
    """Ensures the analysis found actual errors."""
    report = result.pydantic
    if not report or not report.errors:
        return (False, "Must identify at least one error")
    return (True, report)

analyze_task = Task(
    description="Analyze logs: {log_data}",
    expected_output="A structured log analysis report",
    output_pydantic=LogAnalysisReport,
    agent=log_analyzer,
    guardrail=validate_log_analysis,  # attach the guardrail
)`,
    },
    {
      id: "tricky-input",
      title: "The Tricky Input Problem",
      description:
        "Some logs look clean (all INFO) but hide real problems — 0 records processed, 94% disk. Without a guardrail, the agent returns an empty error list and the pipeline continues with bad data.",
      code: `TRICKY_LOG_INPUT = """
[2024-01-15 09:01:22.100] INFO: Cron job scheduled-cleanup started
[2024-01-15 09:01:23.200] INFO: Connected to database cluster (primary)
[2024-01-15 09:01:24.300] INFO: Processing batch 1 of 1
[2024-01-15 09:01:25.400] INFO: 0 records processed
[2024-01-15 09:01:26.500] INFO: Disk usage at 94%
[2024-01-15 09:01:27.600] INFO: Cron job completed successfully
"""`,
    },
    {
      id: "string-guardrail",
      title: "Natural Language Guardrail",
      description:
        "Instead of code, pass a plain string. CrewAI uses an LLM to evaluate the output against your criteria.",
      code: `analyze_task = Task(
    description="Analyze logs: {log_data}",
    expected_output="A structured log analysis report",
    output_pydantic=LogAnalysisReport,
    agent=log_analyzer,
    guardrail="Verify the report identifies at least one error. "
              "Zero-record processing and high disk usage (>90%) "
              "should be flagged as errors even if log level is INFO.",
)`,
    },
  ],
  inputSchema: [
    {
      key: "guardrail_mode",
      label: "Guardrail Mode",
      kind: "select",
      options: ["No Guardrail", "Code Guardrail", "String Guardrail"],
    },
    {
      key: "log_type",
      label: "Log Input",
      kind: "select",
      options: ["Standard Errors (easy)", "Tricky All-INFO (hidden issues)"],
    },
  ],
  fixtures: {
    baseline: {
      label: "No Guardrail + Tricky Logs",
      description:
        "The agent sees all-INFO logs and returns zero errors. Bad data flows downstream unchecked.",
      log: [
        { tag: "BOOT", text: "Initializing crew — NO guardrail" },
        { tag: "INFO", text: "Processing tricky all-INFO log input" },
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

>>> report.errors
[]  # WRONG! "0 records processed" and "94% disk" ARE problems
>>> len(report.errors) > 0
False  # This bad report goes straight to the next agent`,
    },
    enhanced: {
      label: "Code Guardrail + Tricky Logs",
      description:
        "The guardrail catches the empty errors list, forces a retry, and the agent looks deeper",
      log: [
        { tag: "BOOT", text: "Initializing crew — CODE guardrail attached" },
        { tag: "INFO", text: "Processing tricky all-INFO log input" },
        { tag: "PROCESS", text: "Agent analyzing logs (attempt 1)..." },
        { tag: "PROCESS", text: "All log entries are INFO level..." },
        { tag: "GUARDRAIL", text: "validate_log_analysis() → FAILED" },
        { tag: "ERROR", text: "Reason: 'Must identify at least one error'" },
        { tag: "RETRY", text: "Agent retrying with feedback..." },
        { tag: "PROCESS", text: "Agent analyzing logs (attempt 2)..." },
        { tag: "PROCESS", text: "Looking deeper: '0 records processed' is anomalous" },
        { tag: "PROCESS", text: "Looking deeper: '94% disk' exceeds safe threshold" },
        { tag: "GUARDRAIL", text: "validate_log_analysis() → PASSED" },
        { tag: "SUCCESS", text: "Output validated — 1 error found" },
      ],
      output: `{
  "primary_issue": "Cron job processed zero records despite successful completion status",
  "root_cause": "Potential database query failure or data unavailability, compounded by critically high disk usage at 94%",
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

>>> report.errors
['0 records processed — indicates processing failure']
>>> len(report.errors) > 0
True  # Guardrail forced the agent to look deeper!`,
    },
  },
  agentConfig: {
    role: "DevOps Log Analyzer",
    goal: "Analyze log files and identify ALL issues, including subtle ones hidden in INFO-level logs",
    backstory:
      "You are a senior DevOps engineer who catches issues that others miss — even when logs appear clean.",
  },
};
