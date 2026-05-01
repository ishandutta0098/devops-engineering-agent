import { TerminalWindow } from "@/components/Terminal/Window";

const PREVIEW_LINES = [
  "$ crewai init devops-pipeline",
  "",
  "Creating 3-agent DevOps system...",
  "",
  "  Agent 1: DevOps Log Analyzer",
  "    tools: [FileReadTool]",
  "    max_iter: 10",
  "",
  "  Agent 2: Solution Researcher",
  "    tools: [EXASearchTool]",
  "    max_iter: 15",
  "",
  "  Agent 3: Plan Writer",
  "    output: Pydantic model",
  "    guardrail: validate_log_analysis",
  "",
  "  Pipeline: analyze → research → plan",
  "  Process: sequential",
  "",
  "Ready. Run crew.kickoff() to start.",
];

export function TerminalPreview() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <TerminalWindow title="pipeline_preview" rightLabel="what you'll build">
          <pre className="text-code-sm text-gray2 whitespace-pre leading-relaxed">
            {PREVIEW_LINES.map((line, i) => (
              <span key={i} className="block">
                {line.startsWith("$") ? (
                  <>
                    <span className="text-amber">$</span>
                    <span className="text-ink">{line.slice(1)}</span>
                  </>
                ) : line.startsWith("  Agent") || line.startsWith("  Pipeline") || line.startsWith("  Process") ? (
                  <span className="text-cyan">{line}</span>
                ) : line.includes("tools:") || line.includes("max_iter:") || line.includes("output:") || line.includes("guardrail:") ? (
                  <span className="text-gray3">{line}</span>
                ) : line.startsWith("Ready") ? (
                  <span className="text-volt">{line}</span>
                ) : (
                  line
                )}
              </span>
            ))}
          </pre>
        </TerminalWindow>
      </div>
    </section>
  );
}
