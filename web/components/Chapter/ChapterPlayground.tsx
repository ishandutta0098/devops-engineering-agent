"use client";

import { useState, useCallback } from "react";
import type { ChapterDef, LogLine as LogLineType } from "@/lib/schema";
import { runFixture } from "@/lib/runner";
import { TerminalWindow } from "@/components/Terminal/Window";
import { InputPrompt } from "@/components/Terminal/InputPrompt";
import { ExecutionStage, type StageState } from "@/components/Terminal/ExecutionStage";
import { Play, RotateCcw } from "lucide-react";

export function ChapterPlayground({ chapter }: { chapter: ChapterDef }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [fixtureMode, setFixtureMode] = useState<"baseline" | "enhanced">("enhanced");
  const [state, setState] = useState<StageState>("idle");
  const [logs, setLogs] = useState<LogLineType[]>([]);
  const [output, setOutput] = useState("");

  const handleRun = useCallback(async () => {
    setLogs([]);
    setOutput("");
    setState("running");

    const fixture = fixtureMode === "baseline"
      ? chapter.fixtures.baseline
      : chapter.fixtures.enhanced;

    await runFixture(fixture, {
      onLog: (line) => setLogs((prev) => [...prev, line]),
      onOutputChunk: (chunk) => setOutput((prev) => prev + chunk),
      onDone: () => setState("done"),
    });
  }, [chapter, fixtureMode]);

  const handleReset = () => {
    setState("idle");
    setLogs([]);
    setOutput("");
  };

  return (
    <div className="space-y-6">
      <TerminalWindow title="playground" rightLabel={`CH.${String(chapter.number).padStart(2, "0")}`}>
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-headline text-label-caps uppercase text-gray3 tracking-widest">
              Mode:
            </span>
            <button
              onClick={() => setFixtureMode("baseline")}
              className={`px-3 py-1.5 rounded font-code text-xs transition-colors ${
                fixtureMode === "baseline"
                  ? "bg-[#FF5F57]/20 text-[#FF5F57] border border-[#FF5F57]/40"
                  : "bg-surface text-gray3 border border-hairline hover:text-ink"
              }`}
            >
              {chapter.fixtures.baseline.label}
            </button>
            <button
              onClick={() => setFixtureMode("enhanced")}
              className={`px-3 py-1.5 rounded font-code text-xs transition-colors ${
                fixtureMode === "enhanced"
                  ? "bg-amber/20 text-amber border border-amber/40"
                  : "bg-surface text-gray3 border border-hairline hover:text-ink"
              }`}
            >
              {chapter.fixtures.enhanced.label}
            </button>
          </div>

          <InputPrompt
            schema={chapter.inputSchema}
            values={values}
            onChange={(key, val) => setValues((prev) => ({ ...prev, [key]: val }))}
            disabled={state === "running"}
          />

          <div className="flex gap-3">
            <button
              onClick={handleRun}
              disabled={state === "running"}
              className="flex items-center gap-2 px-5 py-2.5 rounded font-headline text-label-caps uppercase tracking-widest bg-amber text-night hover:bg-amber-dim transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              Run Demo
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

      <ExecutionStage
        state={state}
        logs={logs}
        output={output}
      />
    </div>
  );
}
