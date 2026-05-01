import { Check, X } from "lucide-react";

type Feature = {
  name: string;
  chapter: number;
  enabled: boolean;
};

const FEATURES: Feature[] = [
  { name: "Agent Roles & Backstory", chapter: 1, enabled: true },
  { name: "Task Description & Expected Output", chapter: 2, enabled: true },
  { name: "Agent Parameters (max_iter, etc.)", chapter: 3, enabled: true },
  { name: "Tools (FileRead, EXASearch)", chapter: 4, enabled: true },
  { name: "Task Context Chaining", chapter: 5, enabled: true },
  { name: "Structured Output (Pydantic)", chapter: 6, enabled: true },
  { name: "Code Guardrails", chapter: 7, enabled: true },
  { name: "Crew Orchestration", chapter: 8, enabled: true },
];

export function FeatureChecklist({
  enabledUpTo = 9,
}: {
  enabledUpTo?: number;
}) {
  return (
    <div className="bg-surface rounded-lg border border-hairline p-5">
      <h3 className="font-headline text-label-caps uppercase text-amber tracking-widest mb-4">
        Features Active
      </h3>
      <div className="space-y-2">
        {FEATURES.map((f) => {
          const active = f.chapter <= enabledUpTo;
          return (
            <div
              key={f.name}
              className="flex items-center gap-3 font-code text-xs"
            >
              {active ? (
                <Check className="w-3.5 h-3.5 text-volt shrink-0" />
              ) : (
                <X className="w-3.5 h-3.5 text-gray3 shrink-0" />
              )}
              <span className={active ? "text-ink" : "text-gray3 line-through"}>
                {f.name}
              </span>
              <span className="text-gray3 ml-auto">Ch.{String(f.chapter).padStart(2, "0")}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
