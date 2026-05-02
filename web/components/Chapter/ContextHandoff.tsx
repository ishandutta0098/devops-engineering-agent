"use client";

import { useEffect, useState } from "react";
import type { ContextHandoffDemo } from "@/lib/schema";
import { useStepRunner } from "@/lib/useStepRunner";
import { Bot, ArrowRight, Play, RotateCcw, Square } from "lucide-react";

const TOTAL_STAGES = 4;

export function ContextHandoff({ demo }: { demo: ContextHandoffDemo }) {
  const [withContext, setWithContext] = useState(true);
  const runner = useStepRunner({ totalSteps: TOTAL_STAGES, stepMs: 700 });

  useEffect(() => {
    runner.reset();
  }, [withContext, runner.reset]);

  const stageReached = (stage: number) => {
    if (runner.state === "idle") return false;
    if (runner.state === "done") return true;
    return runner.currentStep >= stage;
  };

  const stage1AnalyzerFills = stageReached(0);
  const stage2PayloadTravels = stageReached(1);
  const stage3ResearcherFills = stageReached(2);
  const stage4OutputAppears = stageReached(3);

  return (
    <div className="bg-surface-low border border-hairline rounded-xl p-6 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setWithContext(false)}
          className={`px-4 py-2 rounded font-code text-xs tracking-wide border transition-colors ${
            !withContext
              ? "bg-[#FF5F57]/10 border-[#FF5F57]/40 text-[#FF5F57]"
              : "bg-surface border-hairline text-gray3 hover:text-ink"
          }`}
        >
          Without context
        </button>
        <button
          onClick={() => setWithContext(true)}
          className={`px-4 py-2 rounded font-code text-xs tracking-wide border transition-colors ${
            withContext
              ? "bg-amber/15 border-amber/40 text-amber"
              : "bg-surface border-hairline text-gray3 hover:text-ink"
          }`}
        >
          With context
        </button>

        <div className="ml-auto flex items-center gap-3">
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
                {runner.state === "done" ? "Replay" : "Play Handoff"}
              </>
            )}
          </button>
          {runner.state === "done" ? (
            <button
              onClick={runner.reset}
              className="flex items-center gap-2 px-3 py-2.5 rounded font-code text-xs text-gray2 border border-hairline hover:text-ink hover:bg-surface transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-start gap-4">
        <AgentCard
          role="Analyzer Agent"
          tools={["FileReadTool"]}
          headerLabel="Upstream task output"
          body={demo.analyzerOutput}
          filled={stage1AnalyzerFills}
          accent="amber"
        />

        <div className="flex flex-col items-center justify-center min-h-[180px] py-2 w-full md:min-w-[220px]">
          <div className="font-code text-[10px] uppercase tracking-widest text-gray3 mb-2">
            context payload
          </div>
          <div className="relative flex items-center justify-center w-full">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-hairline" aria-hidden />
            <div
              className={`relative px-3 py-2 rounded border font-code text-[11px] whitespace-pre leading-snug max-w-[260px] transition-all duration-700 ${
                withContext
                  ? "bg-amber/10 border-amber/50 text-amber"
                  : "bg-surface border-hairline text-gray3 italic"
              } ${
                stage2PayloadTravels
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-8"
              }`}
            >
              {withContext ? demo.contextPayload : "(no payload — context=[])"}
            </div>
            <ArrowRight
              className={`absolute right-0 w-4 h-4 transition-colors ${
                stage2PayloadTravels && withContext ? "text-amber" : "text-gray3"
              }`}
            />
          </div>
        </div>

        <AgentCard
          role="Researcher Agent"
          tools={["EXASearchTool"]}
          headerLabel="Derived search query"
          body={
            withContext
              ? `EXASearchTool("ImagePullBackOff myapp:v1.2.3 registry auth fix")`
              : `EXASearchTool("kubernetes errors troubleshooting")`
          }
          filled={stage3ResearcherFills}
          accent="amber"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <ResultCard
          tone={withContext ? "muted" : "active"}
          title="Without context — generic answer"
          body={demo.researcherWithoutContext}
          revealed={stage4OutputAppears}
        />
        <ResultCard
          tone={withContext ? "active" : "muted"}
          title="With context — targeted answer"
          body={demo.researcherWithContext}
          revealed={stage4OutputAppears}
        />
      </div>
    </div>
  );
}

function AgentCard({
  role,
  tools,
  headerLabel,
  body,
  filled,
}: {
  role: string;
  tools: string[];
  headerLabel: string;
  body: string;
  filled: boolean;
  accent: "amber";
}) {
  return (
    <div className="bg-surface border border-hairline rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-hairline flex items-center gap-2">
        <Bot className="w-3.5 h-3.5 text-amber" />
        <span className="font-code text-[10px] uppercase tracking-widest text-amber">
          {role}
        </span>
      </div>
      <div className="px-4 py-3 border-b border-hairline flex flex-wrap gap-1.5">
        {tools.map((t) => (
          <span
            key={t}
            className="font-code text-[10px] px-2 py-1 rounded bg-night border border-hairline text-gray2"
          >
            [{t}]
          </span>
        ))}
      </div>
      <div className="px-4 py-3 min-h-[120px]">
        <div className="font-code text-[10px] uppercase tracking-widest text-gray3 mb-2">
          {headerLabel}
        </div>
        {filled ? (
          <pre className="font-code text-xs text-ink whitespace-pre-wrap leading-relaxed">
{body}
          </pre>
        ) : (
          <div className="font-code text-[11px] text-gray3 italic">
            (waiting for run…)
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({
  tone,
  title,
  body,
  revealed,
}: {
  tone: "muted" | "active";
  title: string;
  body: string;
  revealed: boolean;
}) {
  const active = tone === "active";
  return (
    <div
      className={`border rounded-lg overflow-hidden transition-opacity duration-500 ${
        active ? "border-amber/40 bg-amber/5" : "border-hairline bg-surface opacity-60"
      } ${revealed ? "opacity-100" : "opacity-20"}`}
    >
      <div
        className={`px-4 py-3 border-b ${
          active ? "border-amber/30 text-amber" : "border-hairline text-gray3"
        }`}
      >
        <span className="font-code text-[10px] uppercase tracking-widest">{title}</span>
      </div>
      {revealed ? (
        <pre className="px-4 py-3 font-code text-xs text-ink whitespace-pre-wrap leading-relaxed">
{body}
        </pre>
      ) : (
        <div className="px-4 py-3 font-code text-[11px] text-gray3 italic">
          (waiting for run…)
        </div>
      )}
    </div>
  );
}
