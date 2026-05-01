"use client";

import { useState, useCallback } from "react";
import type { LogLine as LogLineType } from "@/lib/schema";
import { ch03 } from "@/lib/chapters/ch03-agent-parameters";
import { runFixture } from "@/lib/runner";
import { TerminalWindow } from "@/components/Terminal/Window";
import { ExecutionStage, type StageState } from "@/components/Terminal/ExecutionStage";
import { Play, RotateCcw } from "lucide-react";

type ParamConfig = {
  max_iter: number;
  max_rpm: number | null;
  max_execution_time: number | null;
};

const demo = ch03.demos[0];

const PARAMETER_HELP: Record<keyof ParamConfig, { label: string; help: string }> = {
  max_iter: {
    label: "Thinking steps",
    help: "How many times the agent can reason, use tools, or revise before it must stop.",
  },
  max_rpm: {
    label: "Request pace",
    help: "How many model/tool requests the agent can make per minute.",
  },
  max_execution_time: {
    label: "Time limit",
    help: "The longest the run can continue before it is stopped.",
  },
};

const PRESETS: {
  label: string;
  description: string;
  config: ParamConfig;
  variantKey: string;
}[] = [
  {
    label: "Too Loose",
    description: "Useful for experimenting, but easy to waste time and requests.",
    config: { max_iter: 20, max_rpm: null, max_execution_time: null },
    variantKey: "unbounded",
  },
  {
    label: "Balanced",
    description: "Best default for this workshop: enough room, clear limits.",
    config: { max_iter: 5, max_rpm: 10, max_execution_time: 120 },
    variantKey: "tight",
  },
  {
    label: "Very Tight",
    description: "Fast and cheap for obvious errors, but too small for deep research.",
    config: { max_iter: 3, max_rpm: 5, max_execution_time: 60 },
    variantKey: "minimal",
  },
];

export function ParameterControls() {
  const [activePreset, setActivePreset] = useState(0);
  const [state, setState] = useState<StageState>("idle");
  const [logs, setLogs] = useState<LogLineType[]>([]);
  const [output, setOutput] = useState("");

  const handleRun = useCallback(async () => {
    setLogs([]);
    setOutput("");
    setState("running");

    const preset = PRESETS[activePreset];
    const fixture = demo.variants[preset.variantKey];

    await runFixture(fixture, {
      onLog: (line) => setLogs((prev) => [...prev, line]),
      onOutputChunk: (chunk) => setOutput((prev) => prev + chunk),
      onDone: () => setState("done"),
    });
  }, [activePreset]);

  const handleReset = () => {
    setState("idle");
    setLogs([]);
    setOutput("");
  };

  const currentConfig = PRESETS[activePreset].config;

  return (
    <div className="space-y-6">
      <TerminalWindow title="parameter_controls" rightLabel="CH.03">
        <div className="space-y-6">
          <div className="flex gap-2 flex-wrap">
            {PRESETS.map((preset, i) => (
              <button
                key={i}
                onClick={() => setActivePreset(i)}
                className={`px-3 py-2 rounded text-left transition-colors ${
                  activePreset === i
                    ? "bg-amber/20 text-amber border border-amber/40"
                    : "bg-surface text-gray3 border border-hairline hover:text-ink"
                }`}
              >
                <span className="block font-code text-xs">{preset.label}</span>
                <span className="block font-body text-[11px] leading-snug mt-1">
                  {preset.description}
                </span>
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-surface rounded p-4 border border-hairline">
              <span className="font-code text-[10px] text-gray3 uppercase tracking-widest block mb-1">
                max_iter
              </span>
              <span className="font-code text-lg text-amber font-bold">
                {currentConfig.max_iter}
              </span>
              <p className="font-headline text-[10px] text-ink uppercase tracking-widest mt-3">
                {PARAMETER_HELP.max_iter.label}
              </p>
              <p className="font-body text-xs text-gray3 leading-relaxed mt-1">
                {PARAMETER_HELP.max_iter.help}
              </p>
            </div>
            <div className="bg-surface rounded p-4 border border-hairline">
              <span className="font-code text-[10px] text-gray3 uppercase tracking-widest block mb-1">
                max_rpm
              </span>
              <span className="font-code text-lg text-amber font-bold">
                {currentConfig.max_rpm ?? "None"}
              </span>
              <p className="font-headline text-[10px] text-ink uppercase tracking-widest mt-3">
                {PARAMETER_HELP.max_rpm.label}
              </p>
              <p className="font-body text-xs text-gray3 leading-relaxed mt-1">
                {PARAMETER_HELP.max_rpm.help}
              </p>
            </div>
            <div className="bg-surface rounded p-4 border border-hairline">
              <span className="font-code text-[10px] text-gray3 uppercase tracking-widest block mb-1">
                max_exec_time
              </span>
              <span className="font-code text-lg text-amber font-bold">
                {currentConfig.max_execution_time ? `${currentConfig.max_execution_time}s` : "None"}
              </span>
              <p className="font-headline text-[10px] text-ink uppercase tracking-widest mt-3">
                {PARAMETER_HELP.max_execution_time.label}
              </p>
              <p className="font-body text-xs text-gray3 leading-relaxed mt-1">
                {PARAMETER_HELP.max_execution_time.help}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRun}
              disabled={state === "running"}
              className="flex items-center gap-2 px-5 py-2.5 rounded font-headline text-label-caps uppercase tracking-widest bg-amber text-night hover:bg-amber-dim transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              Run with These Params
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
  );
}
