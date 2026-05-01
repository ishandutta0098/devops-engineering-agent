import { Bot } from "lucide-react";

export function AgentCard({
  role,
  goal,
  tools,
  isActive,
}: {
  role: string;
  goal: string;
  tools?: string[];
  isActive?: boolean;
}) {
  return (
    <div
      className={`bg-surface rounded-lg border p-5 transition-colors ${
        isActive ? "border-amber/60 shadow-[0_0_20px_rgba(255,191,0,0.1)]" : "border-hairline"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
            isActive ? "bg-amber/20" : "bg-surface-hover"
          }`}
        >
          <Bot className={`w-4 h-4 ${isActive ? "text-amber" : "text-gray3"}`} />
        </div>
        <div className="min-w-0">
          <h4 className="font-headline text-sm text-ink font-semibold">{role}</h4>
          <p className="font-body text-xs text-gray2 mt-1">{goal}</p>
          {tools && tools.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {tools.map((tool) => (
                <span
                  key={tool}
                  className="px-2 py-0.5 rounded bg-surface-hover font-code text-[10px] text-cyan"
                >
                  {tool}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
