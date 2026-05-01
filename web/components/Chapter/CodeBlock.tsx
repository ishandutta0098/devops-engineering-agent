import { TerminalWindow } from "@/components/Terminal/Window";

export function CodeBlock({
  code,
  title = "code",
  language = "python",
}: {
  code: string;
  title?: string;
  language?: string;
}) {
  return (
    <TerminalWindow title={title} rightLabel={language}>
      <pre className="text-code-sm text-ink whitespace-pre-wrap leading-relaxed overflow-x-auto">
        {code}
      </pre>
    </TerminalWindow>
  );
}
