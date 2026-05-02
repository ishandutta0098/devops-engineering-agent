import type { ChapterDef } from "../schema";

export const ch07: ChapterDef = {
  slug: "guardrails",
  number: 8,
  phase: "Notebook 02",
  title: "Guardrails",
  subtitle: "Validate agent output with code-based and natural-language guardrails",
  intro:
    "Notebook 02 then adds quality gates. Structured output guarantees the shape is correct, but not the content. An agent can return a valid LogAnalysisReport with zero errors — even when there ARE errors hiding in INFO-level logs. Guardrails validate the content and force retries when quality is insufficient.",
  takeaway:
    "Guardrails are your quality gate. Code guardrails give you precise programmatic control. String guardrails let you express policies in plain English. Both force the agent to retry until the output meets your standards.",
  demos: [],
  guardrailDemo: {
    trickyLog: `INFO  Cron job 'scheduled-cleanup' started
INFO  Connected to database
INFO  Scanning rows older than 30 days
INFO  0 records processed
INFO  Disk usage at 94% on /var/lib/postgresql/data
INFO  Cron job 'scheduled-cleanup' completed successfully
INFO  Exit code: 0`,
    code: {
      rule: `def validate_log_analysis(result):
    report = result.pydantic
    if len(report.errors) == 0:
        return (False,
                "Found zero errors. Look harder at INFO lines.")
    return (True, report)`,
      ruleSummary:
        "len(report.errors) > 0 — fails an empty list outright, regardless of the schema.",
      attempt1: {
        status: "FAIL",
        output: `LogAnalysisReport(
  primary_issue="No critical issues found",
  errors=[],
  affected_components=["scheduled-cleanup"]
)`,
        feedback: "Found zero errors. Look harder at INFO lines.",
      },
      attempt2: {
        status: "PASS",
        output: `LogAnalysisReport(
  primary_issue="Cleanup processed 0 rows; disk at 94%",
  errors=[
    "0 records processed — cleanup matched nothing",
    "Disk usage 94% on /var/lib/postgresql/data"
  ],
  affected_components=["scheduled-cleanup", "postgres-data-volume"]
)`,
      },
      finalOutput: `# Accepted LogAnalysisReport

primary_issue:
  "Cleanup processed 0 rows; disk at 94%"
errors:
  - "0 records processed — cleanup matched nothing"
  - "Disk usage 94% on /var/lib/postgresql/data"
affected_components:
  - scheduled-cleanup
  - postgres-data-volume

Code guardrail PASS on attempt 2.`,
    },
    string: {
      rule: `task_guardrail = "Solution must include at least
3 copy-pasteable shell commands the
operator can run."`,
      ruleSummary:
        "≥3 copy-pasteable shell commands — natural-language rule, evaluated by an LLM.",
      attempt1: {
        status: "FAIL",
        output: `# Solution

The cleanup job is unhealthy. The on-call
engineer should investigate the cleanup
query, run a vacuum, and consider
extending the storage volume.`,
        feedback:
          "Plan only has prose. Need ≥3 copy-pasteable shell commands the operator can run.",
      },
      attempt2: {
        status: "PASS",
        output: `# Solution

1. Verify the cleanup query still matches:
   psql -c "EXPLAIN <cleanup_query>"

2. Reclaim disk before the next run:
   psql -c "VACUUM FULL <table>;"

3. Extend the volume by 20% to give buffer:
   aws ec2 modify-volume --volume-id vol-xxx --size +20

4. Add an alert so it never goes silent:
   echo "disk > 90% on /var/lib/postgresql/data" \\
     >> alerts.yaml`,
      },
      finalOutput: `# Accepted solution_plan.md

1. psql -c "EXPLAIN <cleanup_query>"
2. psql -c "VACUUM FULL <table>;"
3. aws ec2 modify-volume --volume-id vol-xxx --size +20
4. echo "disk > 90%..." >> alerts.yaml

Found 4 copy-pasteable commands.
String guardrail PASS on attempt 2.`,
    },
  },
  agentConfig: {
    role: "DevOps Quality Validator",
    goal: "Ensure all DevOps analysis and remediation outputs meet quality standards",
    backstory:
      "You are a senior DevOps engineer focused on output quality.",
  },
};
