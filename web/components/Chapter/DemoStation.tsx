"use client";

import { useState, useCallback } from "react";
import type { DemoDef, LogLine as LogLineType } from "@/lib/schema";
import { runFixturesPairwise } from "@/lib/runner";
import { ExecutionStage, type StageState } from "@/components/Terminal/ExecutionStage";
import { Play, RotateCcw } from "lucide-react";

export function DemoStation({ demo }: { demo: DemoDef }) {
  const [leftKey, setLeftKey] = useState(demo.defaultLeft);
  const [rightKey, setRightKey] = useState(demo.defaultRight);

  const [state, setState] = useState<StageState>("idle");
  const [leftLogs, setLeftLogs] = useState<LogLineType[]>([]);
  const [rightLogs, setRightLogs] = useState<LogLineType[]>([]);
  const [leftOutput, setLeftOutput] = useState("");
  const [rightOutput, setRightOutput] = useState("");

  const leftVariant = demo.variants[leftKey];
  const rightVariant = demo.variants[rightKey];

  const handleRun = useCallback(async () => {
    setLeftLogs([]);
    setRightLogs([]);
    setLeftOutput("");
    setRightOutput("");
    setState("running");

    await runFixturesPairwise(
      leftVariant,
      rightVariant,
      {
        onLog: (line) => setLeftLogs((prev) => [...prev, line]),
        onOutputChunk: (chunk) => setLeftOutput((prev) => prev + chunk),
      },
      {
        onLog: (line) => setRightLogs((prev) => [...prev, line]),
        onOutputChunk: (chunk) => setRightOutput((prev) => prev + chunk),
      },
    );

    setState("done");
  }, [leftVariant, rightVariant]);

  const handleReset = () => {
    setState("idle");
    setLeftLogs([]);
    setRightLogs([]);
    setLeftOutput("");
    setRightOutput("");
  };

  const leftOption = demo.options.find((o) => o.key === leftKey);
  const rightOption = demo.options.find((o) => o.key === rightKey);

  return (
    <div className="space-y-5 bg-surface-low border border-hairline rounded-xl p-6">
      <h3 className="font-headline text-headline-sm text-ink">
        {demo.question}
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="font-headline text-[10px] tracking-widest uppercase text-[#FF5F57] font-bold block">
            Left Panel
          </label>
          <select
            value={leftKey}
            onChange={(e) => setLeftKey(e.target.value)}
            disabled={state === "running"}
            className="w-full bg-surface border border-hairline rounded px-3 py-2 font-code text-sm text-ink focus:outline-none focus:border-[#FF5F57] disabled:opacity-60"
          >
            {demo.options.map((opt) => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
          {leftOption && (
            <p className="font-body text-xs text-gray3">{leftOption.description}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="font-headline text-[10px] tracking-widest uppercase text-amber font-bold block">
            Right Panel
          </label>
          <select
            value={rightKey}
            onChange={(e) => setRightKey(e.target.value)}
            disabled={state === "running"}
            className="w-full bg-surface border border-hairline rounded px-3 py-2 font-code text-sm text-ink focus:outline-none focus:border-amber disabled:opacity-60"
          >
            {demo.options.map((opt) => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
          {rightOption && (
            <p className="font-body text-xs text-gray3">{rightOption.description}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleRun}
          disabled={state === "running"}
          className="flex items-center gap-2 px-5 py-2.5 rounded font-headline text-label-caps uppercase tracking-widest bg-amber text-night hover:bg-amber-dim transition-colors disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5" />
          Run Both
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

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#FF5F57]" />
            <span className="font-code text-[10px] tracking-widest uppercase text-[#FF5F57]">
              {leftVariant.label}
            </span>
          </div>
          <ExecutionStage
            state={state}
            logs={leftLogs}
            output={leftOutput}
            accent="#FF5F57"
            emptyText="[IDLE] Select options and press RUN BOTH."
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-amber" />
            <span className="font-code text-[10px] tracking-widest uppercase text-amber">
              {rightVariant.label}
            </span>
          </div>
          <ExecutionStage
            state={state}
            logs={rightLogs}
            output={rightOutput}
            accent="#FFBF00"
            emptyText="[IDLE] Select options and press RUN BOTH."
          />
        </div>
      </div>
    </div>
  );
}
