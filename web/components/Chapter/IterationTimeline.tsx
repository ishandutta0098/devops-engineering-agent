"use client";

import { useEffect, useMemo, useState } from "react";
import type { IterationDemo, IterationStep, IterationCycle } from "@/lib/schema";
import { useStepRunner } from "@/lib/useStepRunner";
import { CheckCircle2, XCircle, RotateCcw, Info, Play, Square } from "lucide-react";

const STATUS_STYLES: Record<IterationStep["status"], { color: string; bg: string; icon: typeof CheckCircle2 }> = {
  OK: { color: "text-[#B8EF43]", bg: "bg-[#B8EF43]/10 border-[#B8EF43]/40", icon: CheckCircle2 },
  RETRY: { color: "text-amber", bg: "bg-amber/10 border-amber/40", icon: RotateCcw },
  FAIL: { color: "text-[#FF5F57]", bg: "bg-[#FF5F57]/10 border-[#FF5F57]/40", icon: XCircle },
  INFO: { color: "text-gray2", bg: "bg-surface border-hairline", icon: Info },
};

const CYCLE_STATUS_STYLES: Record<IterationCycle["status"], { color: string; border: string; label: string }> = {
  OK: { color: "text-[#B8EF43]", border: "border-[#B8EF43]/40", label: "OK" },
  FAIL: { color: "text-[#FF5F57]", border: "border-[#FF5F57]/40", label: "FAIL" },
  CAPPED: { color: "text-[#FF5F57]", border: "border-[#FF5F57]/60", label: "CEILING" },
};

export function IterationTimeline({ demo }: { demo: IterationDemo }) {
  const [activeKey, setActiveKey] = useState(demo.runs[0]?.key);
  const run = demo.runs.find((r) => r.key === activeKey) ?? demo.runs[0];

  const flatSteps = useMemo(() => {
    const items: { cycleIndex: number; stepIndex: number }[] = [];
    run.iterations.forEach((cycle, ci) => {
      cycle.steps.forEach((_, si) => items.push({ cycleIndex: ci, stepIndex: si }));
    });
    return items;
  }, [run]);

  const runner = useStepRunner({ totalSteps: flatSteps.length, stepMs: 600 });

  useEffect(() => {
    runner.reset();
  }, [activeKey, runner.reset]);

  const stepGlobalIndex = (cycleIndex: number, stepIndex: number) =>
    flatSteps.findIndex((s) => s.cycleIndex === cycleIndex && s.stepIndex === stepIndex);

  const cycleStartIndex = (cycleIndex: number) =>
    flatSteps.findIndex((s) => s.cycleIndex === cycleIndex);

  const cycleVisible = (cycleIndex: number) => {
    if (runner.state === "idle") return false;
    if (runner.state === "done") return true;
    return runner.currentStep >= cycleStartIndex(cycleIndex);
  };

  const verdictVisible = runner.state === "done";

  return (
    <div className="bg-surface-low border border-hairline rounded-xl p-6 space-y-6">
      <h3 className="font-headline text-headline-sm text-ink">{demo.question}</h3>

      <div className="flex flex-wrap gap-2">
        {demo.runs.map((r) => {
          const active = r.key === activeKey;
          return (
            <button
              key={r.key}
              onClick={() => setActiveKey(r.key)}
              disabled={runner.state === "running"}
              className={`px-4 py-2.5 rounded text-left transition-colors max-w-[280px] disabled:opacity-60 ${
                active
                  ? "bg-amber/20 text-amber border border-amber/40"
                  : "bg-surface text-gray3 border border-hairline hover:text-ink"
              }`}
            >
              <span className="block font-code text-xs">{r.label}</span>
              <span className="block font-body text-[11px] leading-snug mt-1">
                {r.description}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <ParamCard label="max_iter" value={String(run.params.max_iter)} />
        <ParamCard
          label="max_rpm"
          value={run.params.max_rpm === null ? "None" : String(run.params.max_rpm)}
        />
        <ParamCard
          label="max_execution_time"
          value={run.params.max_execution_time === null ? "None" : `${run.params.max_execution_time}s`}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={runner.state === "running" ? runner.reset : runner.start}
          className="flex items-center gap-2 px-5 py-2.5 rounded font-headline text-label-caps uppercase tracking-widest bg-amber text-night hover:bg-amber-dim transition-colors"
        >
          {runner.state === "running" ? (
            <>
              <Square className="w-3.5 h-3.5" />
              Stop
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              {runner.state === "done" ? "Replay" : "Play Run"}
            </>
          )}
        </button>
        {runner.state === "done" ? (
          <button
            onClick={runner.reset}
            className="flex items-center gap-2 px-4 py-2.5 rounded font-code text-xs text-gray2 border border-hairline hover:text-ink hover:bg-surface transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        ) : null}
        <span className="font-code text-[11px] text-gray3 ml-auto">
          {runner.state === "idle"
            ? "Press Play to step through this run"
            : runner.state === "running"
            ? `Iteration ${
                run.iterations.findIndex((_, ci) =>
                  runner.currentStep < cycleStartIndex(ci) + run.iterations[ci].steps.length,
                ) + 1
              } of ${run.iterations.length}`
            : `Completed ${run.iterations.length} iteration${run.iterations.length === 1 ? "" : "s"}`}
        </span>
      </div>

      <div className="space-y-4">
        {run.iterations.map((cycle, ci) => {
          const visible = cycleVisible(ci);
          const stat = CYCLE_STATUS_STYLES[cycle.status];
          return (
            <div
              key={ci}
              className={`border rounded-lg overflow-hidden transition-opacity duration-300 ${
                visible ? "opacity-100" : "opacity-30"
              } ${stat.border}`}
            >
              <div
                className={`px-4 py-2.5 flex items-center gap-3 border-b ${stat.border} bg-surface`}
              >
                <span className="font-code text-[11px] uppercase tracking-widest text-amber">
                  {cycle.label}
                </span>
                <span className={`font-code text-[10px] uppercase tracking-widest ${stat.color}`}>
                  · {stat.label}
                </span>
              </div>
              <div className="p-3 space-y-2">
                {cycle.steps.map((step, si) => {
                  const gi = stepGlobalIndex(ci, si);
                  const stepVisible = runner.isVisible(gi);
                  const stepActive = runner.isActive(gi);
                  return (
                    <TimelineRow
                      key={si}
                      step={step}
                      visible={stepVisible}
                      active={stepActive}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {verdictVisible ? (
        <VerdictCard status={run.verdict.status} summary={run.verdict.summary} />
      ) : (
        <div className="border border-hairline rounded-lg p-4 opacity-30">
          <span className="font-code text-[10px] uppercase tracking-widest text-gray3">
            verdict — appears after run completes
          </span>
        </div>
      )}
    </div>
  );
}

function ParamCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface border border-hairline rounded p-3">
      <span className="font-code text-[10px] uppercase tracking-widest text-gray3 block">
        {label}
      </span>
      <span className="font-code text-base text-amber font-bold mt-1 block">{value}</span>
    </div>
  );
}

function TimelineRow({
  step,
  visible,
  active,
}: {
  step: IterationStep;
  visible: boolean;
  active: boolean;
}) {
  const s = STATUS_STYLES[step.status];
  const Icon = s.icon;
  return (
    <div
      className={`border rounded p-3 flex items-start gap-3 transition-all duration-300 ${s.bg} ${
        visible ? "opacity-100 translate-y-0" : "opacity-30 translate-y-1"
      } ${active ? "ring-1 ring-amber/60" : ""}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={`w-3.5 h-3.5 ${s.color}`} />
          <span className={`font-code text-[10px] uppercase tracking-widest ${s.color}`}>
            {step.status}
          </span>
          {step.duration ? (
            <span className="font-code text-[10px] text-gray3 ml-auto">{step.duration}</span>
          ) : null}
        </div>
        <div className="font-code text-sm text-ink break-words">{step.label}</div>
        {step.detail ? (
          <div className="font-body text-xs text-gray2 mt-1">{step.detail}</div>
        ) : null}
      </div>
    </div>
  );
}

function VerdictCard({ status, summary }: { status: "SUCCESS" | "FAILED"; summary: string }) {
  const success = status === "SUCCESS";
  return (
    <div
      className={`border rounded-lg p-4 ${
        success ? "border-[#B8EF43]/50 bg-[#B8EF43]/5" : "border-[#FF5F57]/50 bg-[#FF5F57]/5"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        {success ? (
          <CheckCircle2 className="w-4 h-4 text-[#B8EF43]" />
        ) : (
          <XCircle className="w-4 h-4 text-[#FF5F57]" />
        )}
        <span
          className={`font-code text-[11px] uppercase tracking-widest font-bold ${
            success ? "text-[#B8EF43]" : "text-[#FF5F57]"
          }`}
        >
          {status}
        </span>
      </div>
      <p className="font-body text-sm text-ink leading-relaxed">{summary}</p>
    </div>
  );
}
