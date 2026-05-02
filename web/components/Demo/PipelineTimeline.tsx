"use client";

import { useEffect, useMemo, useState } from "react";
import type { PipelineEvent, PipelineEventKind, PipelineTimelineDemo } from "@/lib/schema";
import { useStepRunner } from "@/lib/useStepRunner";
import {
  Wrench,
  Brain,
  ShieldCheck,
  Boxes,
  FileText,
  ArrowRight,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Play,
  RotateCcw,
  Square,
} from "lucide-react";

const KIND_META: Record<
  PipelineEventKind,
  { icon: typeof Wrench; label: string; ringClass: string; tagClass: string; barClass: string }
> = {
  tool: {
    icon: Wrench,
    label: "tool_call",
    ringClass: "border-amber/50",
    tagClass: "text-amber bg-amber/10 border-amber/40",
    barClass: "bg-amber",
  },
  iteration: {
    icon: Brain,
    label: "reason",
    ringClass: "border-hairline",
    tagClass: "text-gray2 bg-surface border-hairline",
    barClass: "bg-gray3",
  },
  guardrail: {
    icon: ShieldCheck,
    label: "guardrail",
    ringClass: "border-magenta/60",
    tagClass: "text-magenta bg-magenta/10 border-magenta/40",
    barClass: "bg-magenta",
  },
  pydantic: {
    icon: Boxes,
    label: "pydantic",
    ringClass: "border-[#B8EF43]/60",
    tagClass: "text-[#B8EF43] bg-[#B8EF43]/10 border-[#B8EF43]/40",
    barClass: "bg-[#B8EF43]",
  },
  artifact: {
    icon: FileText,
    label: "artifact",
    ringClass: "border-[#B8EF43]/60",
    tagClass: "text-[#B8EF43] bg-night border-[#B8EF43]/60",
    barClass: "bg-[#B8EF43]",
  },
  context: {
    icon: ArrowRight,
    label: "context",
    ringClass: "border-amber/40 border-dashed",
    tagClass: "text-amber bg-night border-amber/40 border-dashed",
    barClass: "bg-amber",
  },
};

const AGENT_LABELS: Record<PipelineEvent["agent"], string> = {
  Analyzer: "Analyzer",
  Researcher: "Researcher",
  PlanWriter: "Plan Writer",
};

const AGENT_ORDER: PipelineEvent["agent"][] = ["Analyzer", "Researcher", "PlanWriter"];

type GlobalIndexedEvent = { event: PipelineEvent; globalIndex: number };

export function PipelineTimeline({ demo }: { demo: PipelineTimelineDemo }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const runner = useStepRunner({ totalSteps: demo.events.length, stepMs: 550 });

  useEffect(() => {
    setExpanded(null);
  }, [demo]);

  useEffect(() => {
    if (runner.state === "running") {
      setExpanded(null);
    }
  }, [runner.state]);

  const lanes = useMemo(() => {
    const map: Record<PipelineEvent["agent"], GlobalIndexedEvent[]> = {
      Analyzer: [],
      Researcher: [],
      PlanWriter: [],
    };
    demo.events.forEach((event, globalIndex) => {
      map[event.agent].push({ event, globalIndex });
    });
    return map;
  }, [demo]);

  const eventVisible = (globalIndex: number) => {
    if (runner.state === "idle") return false;
    if (runner.state === "done") return true;
    return globalIndex <= runner.currentStep;
  };

  const eventActive = (globalIndex: number) =>
    runner.state === "running" && globalIndex === runner.currentStep;

  return (
    <div className="bg-surface-low border border-hairline rounded-xl p-6 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-headline text-headline-sm text-ink">
          End-to-end pipeline timeline
        </h3>

        <div className="ml-auto flex items-center gap-3">
          <span className="font-code text-[10px] text-gray3">
            {runner.state === "idle"
              ? `${demo.events.length} events ready`
              : runner.state === "running"
              ? `Step ${runner.currentStep + 1} / ${demo.events.length}`
              : `Completed · ${demo.events.length} events`}
          </span>
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
                {runner.state === "done" ? "Replay" : "Play Pipeline"}
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

      <div className="space-y-6">
        {AGENT_ORDER.map((agent, ai) => {
          const isLast = ai === AGENT_ORDER.length - 1;
          const events = lanes[agent];
          return (
            <div key={agent} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-code text-[11px] uppercase tracking-widest text-amber font-bold">
                  {AGENT_LABELS[agent]}
                </span>
                <span className="font-code text-[10px] text-gray3">
                  lane {ai + 1} · {events.length} event{events.length === 1 ? "" : "s"}
                </span>
                <span className="flex-1 h-px bg-hairline" aria-hidden />
              </div>

              <div className="overflow-x-auto">
                <div className="flex items-stretch gap-4 pb-2 min-w-max">
                  {events.map(({ event, globalIndex }, j) => (
                    <div key={globalIndex} className="flex items-center gap-2">
                      <EventCard
                        event={event}
                        visible={eventVisible(globalIndex)}
                        active={eventActive(globalIndex)}
                        expanded={expanded === globalIndex}
                        onToggle={() =>
                          setExpanded(expanded === globalIndex ? null : globalIndex)
                        }
                      />
                      {j < events.length - 1 ? (
                        <ArrowRight
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            eventVisible(globalIndex) ? "text-gray2" : "text-gray3 opacity-30"
                          }`}
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              {!isLast ? (
                <div className="flex items-center gap-2 pl-2">
                  <ArrowDown className="w-4 h-4 text-amber" />
                  <span className="font-code text-[10px] uppercase tracking-widest text-amber">
                    context handoff → {AGENT_LABELS[AGENT_ORDER[ai + 1]]}
                  </span>
                  <span className="flex-1 border-t border-dashed border-amber/40" aria-hidden />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {expanded !== null ? (
        <ExpandedPayload
          event={demo.events[expanded]}
          onClose={() => setExpanded(null)}
        />
      ) : null}

      <Legend />
    </div>
  );
}

function EventCard({
  event,
  visible,
  active,
  expanded,
  onToggle,
}: {
  event: PipelineEvent;
  visible: boolean;
  active: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const meta = KIND_META[event.kind];
  const Icon = meta.icon;
  const hasPayload = Boolean(event.payload);

  return (
    <button
      onClick={hasPayload ? onToggle : undefined}
      disabled={!hasPayload}
      className={`relative w-[280px] min-h-[140px] shrink-0 bg-surface border ${meta.ringClass} rounded-lg p-4 text-left transition-all duration-300 flex flex-col gap-2 ${
        hasPayload ? "hover:bg-surface-hover cursor-pointer" : "cursor-default"
      } ${expanded ? "ring-1 ring-amber/60" : ""} ${
        visible ? "opacity-100 translate-y-0" : "opacity-25 translate-y-1"
      } ${active ? "ring-2 ring-amber/60 shadow-[0_0_0_4px_rgba(255,191,0,0.08)]" : ""}`}
    >
      <span
        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${meta.barClass}`}
        aria-hidden
      />
      <div className="flex items-center gap-2 pl-1">
        <span
          className={`font-code text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border ${meta.tagClass}`}
        >
          {meta.label}
        </span>
        {event.status ? (
          <span className="font-code text-[9px] uppercase tracking-widest text-gray3 ml-auto">
            {event.status}
          </span>
        ) : null}
      </div>
      <div className="flex items-start gap-2 pl-1">
        <Icon className="w-4 h-4 text-gray2 mt-0.5 shrink-0" />
        <span className="font-code text-[12px] text-ink leading-snug break-words">
          {event.label}
        </span>
      </div>
      {event.detail ? (
        <p className="font-body text-[11px] text-gray2 leading-snug pl-1">
          {event.detail}
        </p>
      ) : null}
      {hasPayload ? (
        <div className="mt-auto pt-1 flex items-center gap-1 text-amber">
          {expanded ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
          <span className="font-code text-[9px] uppercase tracking-widest">
            {expanded ? "collapse" : "click to expand"}
          </span>
        </div>
      ) : null}
    </button>
  );
}

function ExpandedPayload({
  event,
  onClose,
}: {
  event: PipelineEvent;
  onClose: () => void;
}) {
  const meta = KIND_META[event.kind];
  return (
    <div className="bg-night border border-hairline rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-hairline flex items-center gap-2">
        <span
          className={`font-code text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border ${meta.tagClass}`}
        >
          {meta.label}
        </span>
        <span className="font-code text-[10px] text-gray2">
          {AGENT_LABELS[event.agent]} · {event.label}
        </span>
        <button
          onClick={onClose}
          className="ml-auto font-code text-[10px] text-gray3 hover:text-ink uppercase tracking-widest flex items-center gap-1"
        >
          <ChevronUp className="w-3 h-3" /> collapse
        </button>
      </div>
      <pre className="p-4 font-code text-xs text-ink whitespace-pre-wrap leading-relaxed overflow-auto max-h-[400px]">
{event.payload}
      </pre>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-3 pt-3 border-t border-hairline">
      {(Object.keys(KIND_META) as PipelineEventKind[]).map((k) => {
        const m = KIND_META[k];
        const Icon = m.icon;
        return (
          <div key={k} className="flex items-center gap-1.5">
            <span
              className={`font-code text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded border ${m.tagClass}`}
            >
              <Icon className="inline w-3 h-3 mr-1" />
              {m.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
