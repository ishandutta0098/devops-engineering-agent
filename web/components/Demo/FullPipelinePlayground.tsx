"use client";

import { useState, useCallback } from "react";
import type { LogLine as LogLineType } from "@/lib/schema";
import { ch09 } from "@/lib/chapters/ch09-full-pipeline";
import { runFixture } from "@/lib/runner";
import { TerminalWindow } from "@/components/Terminal/Window";
import { ExecutionStage, type StageState } from "@/components/Terminal/ExecutionStage";
import { AgentCard } from "./AgentCard";
import { PipelineBar } from "./PipelineBar";
import { FeatureChecklist } from "./FeatureChecklist";
import { Play, RotateCcw } from "lucide-react";

const demo = ch09.demos[0];

const AGENTS = [
  {
    role: "DevOps Log Analyzer",
    goal: "Analyze logs to identify issues and failure patterns",
    tools: ["FileReadTool"],
  },
  {
    role: "Solution Researcher",
    goal: "Find proven solutions from documentation and community",
    tools: ["EXASearchTool"],
  },
  {
    role: "Plan Writer",
    goal: "Create actionable remediation plans",
    tools: [],
  },
];

const MODE_MAP: Record<string, { variantKey: string; featureUpTo: number }> = {
  base: { variantKey: "base", featureUpTo: 4 },
  full: { variantKey: "full", featureUpTo: 9 },
};

export function FullPipelinePlayground() {
  const [mode, setMode] = useState<"base" | "full">("full");
  const [state, setState] = useState<StageState>("idle");
  const [logs, setLogs] = useState<LogLineType[]>([]);
  const [output, setOutput] = useState("");
  const [activeStep, setActiveStep] = useState(0);

  const handleRun = useCallback(async () => {
    setLogs([]);
    setOutput("");
    setState("running");
    setActiveStep(1);

    const fixture = demo.variants[MODE_MAP[mode].variantKey];

    await runFixture(fixture, {
      onLog: (line) => {
        setLogs((prev) => [...prev, line]);
        if (line.text.includes("Agent 2") || line.text.includes("Task 2")) setActiveStep(2);
        if (line.text.includes("Agent 3") || line.text.includes("Task 3")) setActiveStep(3);
      },
      onOutputChunk: (chunk) => setOutput((prev) => prev + chunk),
      onDone: () => setState("done"),
    });
  }, [mode]);

  const handleReset = () => {
    setState("idle");
    setLogs([]);
    setOutput("");
    setActiveStep(0);
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        {AGENTS.map((agent, i) => (
          <AgentCard
            key={agent.role}
            {...agent}
            isActive={activeStep === i + 1}
          />
        ))}
      </div>

      <PipelineBar activeStep={activeStep} />

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <TerminalWindow title="full_pipeline" rightLabel="CH.09">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="font-headline text-label-caps uppercase text-gray3 tracking-widest">
                  Mode:
                </span>
                <button
                  onClick={() => setMode("base")}
                  className={`px-3 py-1.5 rounded font-code text-xs transition-colors ${
                    mode === "base"
                      ? "bg-[#FF5F57]/20 text-[#FF5F57] border border-[#FF5F57]/40"
                      : "bg-surface text-gray3 border border-hairline hover:text-ink"
                  }`}
                >
                  Base Pipeline
                </button>
                <button
                  onClick={() => setMode("full")}
                  className={`px-3 py-1.5 rounded font-code text-xs transition-colors ${
                    mode === "full"
                      ? "bg-amber/20 text-amber border border-amber/40"
                      : "bg-surface text-gray3 border border-hairline hover:text-ink"
                  }`}
                >
                  Full Production
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRun}
                  disabled={state === "running"}
                  className="flex items-center gap-2 px-5 py-2.5 rounded font-headline text-label-caps uppercase tracking-widest bg-amber text-night hover:bg-amber-dim transition-colors disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  Run Pipeline
                </button>
                {state === "done" && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2.5 rounded font-code text-xs text-gray2 border border-hairline hover:text-ink hover:bg-surface transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                )}
              </div>
            </div>
          </TerminalWindow>

          <ExecutionStage state={state} logs={logs} output={output} />
        </div>

        <FeatureChecklist enabledUpTo={MODE_MAP[mode].featureUpTo} />
      </div>
    </div>
  );
}
