import { ArrowRight } from "lucide-react";

const STAGES = [
  { label: "Log Analyzer", step: 1 },
  { label: "Researcher", step: 2 },
  { label: "Plan Writer", step: 3 },
];

export function PipelineBar({ activeStep }: { activeStep: number }) {
  return (
    <div className="flex items-center gap-2 py-4">
      {STAGES.map((stage, i) => (
        <div key={stage.step} className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded font-code text-xs transition-colors ${
              stage.step === activeStep
                ? "bg-amber/20 text-amber border border-amber/40"
                : stage.step < activeStep
                  ? "bg-volt/10 text-volt border border-volt/30"
                  : "bg-surface text-gray3 border border-hairline"
            }`}
          >
            <span className="font-bold">{stage.step}</span>
            <span>{stage.label}</span>
          </div>
          {i < STAGES.length - 1 && (
            <ArrowRight className="w-4 h-4 text-gray3 shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}
