"use client";

import { useState, useCallback } from "react";
import type { LogExample, LogLine as LogLineType } from "@/lib/schema";
import { runFixture } from "@/lib/runner";
import { ExecutionStage, type StageState } from "@/components/Terminal/ExecutionStage";
import { FileText, Play, RotateCcw } from "lucide-react";

export function LogExampleStation({ examples }: { examples: LogExample[] }) {
  const [activeId, setActiveId] = useState<string>(examples[0].id);
  const [state, setState] = useState<StageState>("idle");
  const [logs, setLogs] = useState<LogLineType[]>([]);
  const [output, setOutput] = useState("");

  const selected = examples.find((e) => e.id === activeId) ?? examples[0];

  const handleSelect = (id: string) => {
    if (id === activeId) return;
    setActiveId(id);
    setState("idle");
    setLogs([]);
    setOutput("");
  };

  const handleRun = useCallback(async () => {
    setLogs([]);
    setOutput("");
    setState("running");

    await runFixture(selected.result, {
      onLog: (line) => setLogs((prev) => [...prev, line]),
      onOutputChunk: (chunk) => setOutput((prev) => prev + chunk),
      onDone: () => setState("done"),
    });
  }, [selected]);

  const handleReset = () => {
    setState("idle");
    setLogs([]);
    setOutput("");
  };

  return (
    <div className="space-y-5 bg-surface-low border border-hairline rounded-xl p-6">
      <div className="flex flex-wrap gap-2">
        {examples.map((ex) => {
          const active = ex.id === activeId;
          return (
            <button
              key={ex.id}
              onClick={() => handleSelect(ex.id)}
              className={`px-3 py-2 rounded text-left transition-colors max-w-[260px] ${
                active
                  ? "bg-amber/20 text-amber border border-amber/40"
                  : "bg-surface text-gray3 border border-hairline hover:text-ink"
              }`}
            >
              <span className="block font-code text-xs">{ex.title}</span>
              <span className="block font-body text-[11px] leading-snug mt-1">
                {ex.file}
              </span>
            </button>
          );
        })}
      </div>

      <p className="font-body text-sm text-gray2 leading-relaxed">
        {selected.summary}
      </p>

      <div className="flex gap-3">
        <button
          onClick={handleRun}
          disabled={state === "running"}
          className="flex items-center gap-2 px-5 py-2.5 rounded font-headline text-label-caps uppercase tracking-widest bg-amber text-night hover:bg-amber-dim transition-colors disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5" />
          Run on this log
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

      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-3.5 h-3.5 text-gray3" />
            <span className="font-code text-[10px] tracking-widest uppercase text-gray3">
              {selected.file}
            </span>
          </div>
          <pre className="bg-night/60 border border-hairline rounded p-4 min-h-[420px] max-h-[640px] overflow-auto font-code text-[12px] leading-relaxed text-gray2 whitespace-pre">
            {selected.logFile}
          </pre>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-amber" />
            <span className="font-code text-[10px] tracking-widest uppercase text-amber">
              {selected.result.label}
            </span>
          </div>
          <ExecutionStage
            state={state}
            logs={logs}
            output={output}
            accent="#FFBF00"
            emptyText="[IDLE] Press RUN ON THIS LOG to see the agent process this file."
          />
        </div>
      </div>
    </div>
  );
}
