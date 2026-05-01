"use client";

import { useState, useCallback } from "react";
import type { LogLine as LogLineType } from "@/lib/schema";
import { ch07 } from "@/lib/chapters/ch07-guardrails";
import { runFixture } from "@/lib/runner";
import { TerminalWindow } from "@/components/Terminal/Window";
import { ExecutionStage, type StageState } from "@/components/Terminal/ExecutionStage";
import { Play, RotateCcw, ShieldCheck, ShieldOff } from "lucide-react";

const demo = ch07.demos[0];

export function GuardrailPlayground() {
  const [guardrailEnabled, setGuardrailEnabled] = useState(false);
  const [state, setState] = useState<StageState>("idle");
  const [logs, setLogs] = useState<LogLineType[]>([]);
  const [output, setOutput] = useState("");

  const handleRun = useCallback(async () => {
    setLogs([]);
    setOutput("");
    setState("running");

    const fixture = guardrailEnabled
      ? demo.variants["code-guardrail"]
      : demo.variants["no-guardrail"];

    await runFixture(fixture, {
      onLog: (line) => setLogs((prev) => [...prev, line]),
      onOutputChunk: (chunk) => setOutput((prev) => prev + chunk),
      onDone: () => setState("done"),
    });
  }, [guardrailEnabled]);

  const handleReset = () => {
    setState("idle");
    setLogs([]);
    setOutput("");
  };

  return (
    <div className="space-y-6">
      <TerminalWindow title="guardrail_demo" rightLabel="CH.07">
        <div className="space-y-6">
          <div className="bg-surface rounded p-4 border border-hairline">
            <span className="font-code text-[10px] text-gray3 uppercase tracking-widest block mb-3">
              Input: Tricky All-INFO Logs
            </span>
            <pre className="font-code text-xs text-gray2 whitespace-pre-wrap leading-relaxed">
{`[2024-01-15 09:01:22.100] INFO: Cron job scheduled-cleanup started
[2024-01-15 09:01:23.200] INFO: Connected to database cluster (primary)
[2024-01-15 09:01:24.300] INFO: Processing batch 1 of 1
[2024-01-15 09:01:25.400] INFO: 0 records processed
[2024-01-15 09:01:26.500] INFO: Disk usage at 94%
[2024-01-15 09:01:27.600] INFO: Cron job completed successfully`}
            </pre>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setGuardrailEnabled(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded font-code text-sm transition-colors ${
                !guardrailEnabled
                  ? "bg-[#FF5F57]/20 text-[#FF5F57] border border-[#FF5F57]/40"
                  : "bg-surface text-gray3 border border-hairline hover:text-ink"
              }`}
            >
              <ShieldOff className="w-4 h-4" />
              No Guardrail
            </button>
            <button
              onClick={() => setGuardrailEnabled(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded font-code text-sm transition-colors ${
                guardrailEnabled
                  ? "bg-amber/20 text-amber border border-amber/40"
                  : "bg-surface text-gray3 border border-hairline hover:text-ink"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Code Guardrail
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRun}
              disabled={state === "running"}
              className="flex items-center gap-2 px-5 py-2.5 rounded font-headline text-label-caps uppercase tracking-widest bg-amber text-night hover:bg-amber-dim transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              Run Analysis
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
