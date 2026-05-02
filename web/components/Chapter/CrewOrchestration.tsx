"use client";

import { useEffect, useMemo, useState } from "react";
import type { CrewDemo, CrewIteration, CrewIterationKind } from "@/lib/schema";
import { useStepRunner } from "@/lib/useStepRunner";
import {
  Bot,
  Wrench,
  Brain,
  RotateCcw,
  ArrowRight,
  ArrowDown,
  FileText,
  Play,
  Square,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const KIND_META: Record<
  CrewIterationKind,
  { icon: typeof Wrench; color: string; label: string }
> = {
  tool: { icon: Wrench, color: "text-amber", label: "tool_call" },
  reason: { icon: Brain, color: "text-gray2", label: "reason" },
  retry: { icon: RotateCcw, color: "text-amber", label: "retry" },
  context: { icon: ArrowDown, color: "text-amber", label: "context" },
};

type StepKind =
  | { type: "iteration"; agentIndex: number; itIndex: number }
  | { type: "contextOut"; agentIndex: number }
  | { type: "artifacts" };

export function CrewOrchestration({ demo }: { demo: CrewDemo }) {
  const finalArtifacts = ["log_analysis.md", "investigation_report.md", "solution_plan.md"];

  const steps: StepKind[] = useMemo(() => {
    const out: StepKind[] = [];
    demo.agents.forEach((agent, ai) => {
      agent.iterations.forEach((_, ii) =>
        out.push({ type: "iteration", agentIndex: ai, itIndex: ii }),
      );
      out.push({ type: "contextOut", agentIndex: ai });
    });
    out.push({ type: "artifacts" });
    return out;
  }, [demo]);

  const runner = useStepRunner({ totalSteps: steps.length, stepMs: 550 });
  const [manualExpand, setManualExpand] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setManualExpand({});
  }, [demo]);

  const stepIndex = (predicate: (s: StepKind) => boolean) => steps.findIndex(predicate);

  const isStepReached = (predicate: (s: StepKind) => boolean) => {
    if (runner.state === "idle") return false;
    if (runner.state === "done") return true;
    const idx = stepIndex(predicate);
    return idx >= 0 && runner.currentStep >= idx;
  };

  const isAgentActive = (agentIndex: number) =>
    isStepReached((s) => s.type === "iteration" && s.agentIndex === agentIndex && s.itIndex === 0);

  const isIterationVisible = (agentIndex: number, itIndex: number) =>
    isStepReached(
      (s) => s.type === "iteration" && s.agentIndex === agentIndex && s.itIndex === itIndex,
    );

  const isContextOutVisible = (agentIndex: number) =>
    isStepReached((s) => s.type === "contextOut" && s.agentIndex === agentIndex);

  const isArtifactsVisible = isStepReached((s) => s.type === "artifacts");

  const isLaneExpanded = (agentIndex: number) => {
    if (runner.state === "running" || runner.state === "done") {
      if (runner.state === "done" && manualExpand[agentIndex] === false) return false;
      return isAgentActive(agentIndex);
    }
    return manualExpand[agentIndex] ?? false;
  };

  const toggleLane = (agentIndex: number) => {
    setManualExpand((prev) => ({
      ...prev,
      [agentIndex]: !(prev[agentIndex] ?? isAgentActive(agentIndex)),
    }));
  };

  return (
    <div className="bg-surface-low border border-hairline rounded-xl p-6 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-code text-[10px] uppercase tracking-widest text-amber">
          Process.sequential
        </span>
        <span className="font-code text-[10px] text-gray3">
          context flows left-to-right through {demo.agents.length} lanes
        </span>

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
                {runner.state === "done" ? "Replay" : "Play Crew"}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {demo.agents.map((agent, i) => {
          const isLast = i === demo.agents.length - 1;
          const expanded = isLaneExpanded(i);
          const active = isAgentActive(i);
          return (
            <div key={agent.role} className="flex flex-col gap-3">
              <div
                className={`bg-surface border rounded-lg overflow-hidden transition-all duration-300 ${
                  active ? "border-amber/60 ring-1 ring-amber/30" : "border-hairline"
                }`}
              >
                <button
                  onClick={() => toggleLane(i)}
                  className="w-full px-4 py-3 border-b border-hairline flex items-center gap-2 hover:bg-surface-hover transition-colors"
                >
                  <Bot className={`w-3.5 h-3.5 ${active ? "text-amber" : "text-gray2"}`} />
                  <span
                    className={`font-code text-[11px] uppercase tracking-widest ${
                      active ? "text-amber" : "text-gray2"
                    }`}
                  >
                    {agent.role}
                  </span>
                  <span className="ml-auto font-code text-[10px] text-gray3 flex items-center gap-1">
                    {expanded ? (
                      <>
                        <ChevronUp className="w-3 h-3" /> hide
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3" /> show iterations
                      </>
                    )}
                  </span>
                </button>
                <div className="px-4 py-2 border-b border-hairline flex flex-wrap gap-1.5">
                  {agent.tools.length === 0 ? (
                    <span className="font-code text-[10px] text-gray3 italic">no tools</span>
                  ) : (
                    agent.tools.map((t) => (
                      <span
                        key={t}
                        className="font-code text-[10px] px-2 py-1 rounded bg-night border border-hairline text-gray2"
                      >
                        [{t}]
                      </span>
                    ))
                  )}
                </div>
                {expanded ? (
                  <div className="px-4 py-3 space-y-2">
                    <div className="font-code text-[10px] uppercase tracking-widest text-gray3">
                      iterations
                    </div>
                    {agent.iterations.map((it, j) => (
                      <IterationRow
                        key={j}
                        iteration={it}
                        visible={isIterationVisible(i, j) || runner.state === "idle"}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-2 font-code text-[10px] text-gray3 italic">
                    {agent.iterations.length} iteration{agent.iterations.length === 1 ? "" : "s"} ·
                    click header to {runner.state === "idle" ? "preview" : "view"}
                  </div>
                )}
              </div>

              <div
                className={`bg-amber/5 border border-amber/40 rounded-lg p-3 transition-opacity duration-300 ${
                  isContextOutVisible(i) ? "opacity-100" : "opacity-20"
                }`}
              >
                <div className="font-code text-[10px] uppercase tracking-widest text-amber mb-1 flex items-center gap-1">
                  context out
                  <ArrowRight className="w-3 h-3 hidden md:inline" />
                  <ArrowDown className="w-3 h-3 inline md:hidden" />
                  <span className="text-gray3">
                    {isLast ? "final artifacts" : demo.agents[i + 1].role}
                  </span>
                </div>
                {isContextOutVisible(i) ? (
                  <pre className="font-code text-[11px] text-ink whitespace-pre-wrap leading-relaxed">
{agent.contextOut}
                  </pre>
                ) : (
                  <div className="font-code text-[11px] text-gray3 italic">
                    (lane has not produced context yet)
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className={`bg-[#B8EF43]/5 border border-[#B8EF43]/50 rounded-lg p-4 transition-opacity duration-300 ${
          isArtifactsVisible ? "opacity-100" : "opacity-20"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-[#B8EF43]" />
          <span className="font-code text-[10px] uppercase tracking-widest text-[#B8EF43]">
            Final crew artifacts
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {finalArtifacts.map((f) => (
            <span
              key={f}
              className="font-code text-xs px-3 py-1.5 rounded bg-night border border-[#B8EF43]/40 text-[#B8EF43]"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function IterationRow({
  iteration,
  visible,
}: {
  iteration: CrewIteration;
  visible: boolean;
}) {
  const meta = KIND_META[iteration.kind];
  const Icon = meta.icon;
  const dotColor =
    iteration.status === "FAIL"
      ? "bg-[#FF5F57]"
      : iteration.status === "INFO"
      ? "bg-gray3"
      : "bg-[#B8EF43]";

  return (
    <div
      className={`flex items-start gap-2 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-25"
      }`}
    >
      <Icon className={`w-3 h-3 mt-1 ${meta.color} shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-code text-[10px] uppercase tracking-widest ${meta.color}`}>
            {meta.label}
          </span>
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden />
        </div>
        <div className="font-code text-[11px] text-ink break-words leading-snug">
          {iteration.label}
        </div>
        {iteration.detail ? (
          <div className="font-body text-[11px] text-gray2 mt-0.5 leading-snug">
            {iteration.detail}
          </div>
        ) : null}
      </div>
    </div>
  );
}
