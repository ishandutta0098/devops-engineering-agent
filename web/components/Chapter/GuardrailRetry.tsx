"use client";

import { useEffect, useState } from "react";
import type { GuardrailDemo, GuardrailRun } from "@/lib/schema";
import { useStepRunner } from "@/lib/useStepRunner";
import {
  FileText,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  ArrowDown,
  Play,
  Square,
} from "lucide-react";

const TOTAL_STAGES = 5;

export function GuardrailRetry({ demo }: { demo: GuardrailDemo }) {
  const [variant, setVariant] = useState<"code" | "string">("code");
  const run = variant === "code" ? demo.code : demo.string;

  const runner = useStepRunner({ totalSteps: TOTAL_STAGES, stepMs: 700 });

  useEffect(() => {
    runner.reset();
  }, [variant, runner.reset]);

  const stageReached = (stage: number) => {
    if (runner.state === "idle") return false;
    if (runner.state === "done") return true;
    return runner.currentStep >= stage;
  };

  const showAttempt1 = stageReached(0);
  const showFail = stageReached(1);
  const showRetry = stageReached(2);
  const showAttempt2 = stageReached(3);
  const showPass = stageReached(4);

  return (
    <div className="bg-surface-low border border-hairline rounded-xl p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-3.5 h-3.5 text-amber" />
          <span className="font-code text-[10px] uppercase tracking-widest text-amber">
            Tricky log input
          </span>
          <span className="font-code text-[10px] text-gray3 ml-auto">
            cron_silent_failure.log · all INFO
          </span>
        </div>
        <pre className="bg-night border border-hairline rounded p-4 font-code text-[11px] leading-relaxed text-gray2 whitespace-pre-wrap">
{demo.trickyLog}
        </pre>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setVariant("code")}
          className={`px-4 py-2 rounded font-code text-xs tracking-wide border transition-colors ${
            variant === "code"
              ? "bg-amber/15 border-amber/40 text-amber"
              : "bg-surface border-hairline text-gray3 hover:text-ink"
          }`}
        >
          Code Guardrail
        </button>
        <button
          onClick={() => setVariant("string")}
          className={`px-4 py-2 rounded font-code text-xs tracking-wide border transition-colors ${
            variant === "string"
              ? "bg-amber/15 border-amber/40 text-amber"
              : "bg-surface border-hairline text-gray3 hover:text-ink"
          }`}
        >
          String Guardrail
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
                {runner.state === "done" ? "Replay" : "Play Guardrail"}
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

      <RuleCard rule={run.rule} summary={run.ruleSummary} />

      <div className="max-w-2xl mx-auto space-y-3">
        <AttemptCard
          label="Agent · attempt 1"
          attempt={run.attempt1}
          visible={showAttempt1}
        />

        <CheckRow
          status="FAIL"
          visible={showFail}
          feedback={run.attempt1.feedback}
        />

        <RetryArrow visible={showRetry} />

        <AttemptCard
          label="Agent · attempt 2"
          attempt={run.attempt2}
          visible={showAttempt2}
        />

        <CheckRow status="PASS" visible={showPass} />
      </div>

      <div
        className={`bg-[#B8EF43]/5 border border-[#B8EF43]/50 rounded-lg p-4 transition-opacity duration-300 ${
          showPass ? "opacity-100" : "opacity-20"
        }`}
      >
        <div className="font-code text-[10px] uppercase tracking-widest text-[#B8EF43] mb-2">
          Final accepted output
        </div>
        {showPass ? (
          <pre className="font-code text-xs text-ink whitespace-pre-wrap leading-relaxed">
{run.finalOutput}
          </pre>
        ) : (
          <div className="font-code text-[11px] text-gray3 italic">
            (final output appears once guardrail passes)
          </div>
        )}
      </div>
    </div>
  );
}

function RuleCard({ rule, summary }: { rule: string; summary: string }) {
  return (
    <div className="bg-surface border border-amber/30 rounded-lg overflow-hidden">
      <div className="px-4 py-2 border-b border-amber/30">
        <span className="font-code text-[10px] uppercase tracking-widest text-amber">
          active rule
        </span>
      </div>
      <pre className="px-4 py-3 font-code text-sm text-amber whitespace-pre-wrap">{rule}</pre>
      <div className="px-4 py-2 border-t border-hairline">
        <span className="font-body text-xs text-gray2">{summary}</span>
      </div>
    </div>
  );
}

function AttemptCard({
  label,
  attempt,
  visible,
}: {
  label: string;
  attempt: GuardrailRun["attempt1"];
  visible: boolean;
}) {
  const fail = attempt.status === "FAIL";
  return (
    <div
      className={`border rounded-lg overflow-hidden transition-all duration-500 ${
        fail ? "border-[#FF5F57]/40 bg-[#FF5F57]/5" : "border-[#B8EF43]/40 bg-[#B8EF43]/5"
      } ${visible ? "opacity-100 translate-y-0" : "opacity-25 translate-y-1"}`}
    >
      <div
        className={`px-4 py-2 border-b ${
          fail ? "border-[#FF5F57]/30 text-[#FF5F57]" : "border-[#B8EF43]/30 text-[#B8EF43]"
        }`}
      >
        <span className="font-code text-[10px] uppercase tracking-widest">{label}</span>
      </div>
      {visible ? (
        <pre className="px-4 py-3 font-code text-xs text-ink whitespace-pre-wrap leading-relaxed">
{attempt.output}
        </pre>
      ) : (
        <div className="px-4 py-3 font-code text-[11px] text-gray3 italic">
          (waiting for run…)
        </div>
      )}
    </div>
  );
}

function CheckRow({
  status,
  visible,
  feedback,
}: {
  status: "FAIL" | "PASS";
  visible: boolean;
  feedback?: string;
}) {
  const fail = status === "FAIL";
  return (
    <div
      className={`flex items-stretch gap-3 transition-all duration-300 ${
        visible ? "opacity-100" : "opacity-20"
      }`}
    >
      <div
        className={`shrink-0 flex flex-col items-center justify-center px-4 py-3 rounded-lg border ${
          fail
            ? "border-[#FF5F57]/40 bg-[#FF5F57]/10"
            : "border-[#B8EF43]/50 bg-[#B8EF43]/10"
        }`}
      >
        {fail ? (
          <ShieldAlert className="w-5 h-5 text-[#FF5F57]" />
        ) : (
          <ShieldCheck className="w-5 h-5 text-[#B8EF43]" />
        )}
        <span
          className={`mt-1 font-code text-[10px] uppercase tracking-widest font-bold ${
            fail ? "text-[#FF5F57]" : "text-[#B8EF43]"
          }`}
        >
          guardrail {status}
        </span>
      </div>
      {fail && feedback ? (
        <div className="flex-1 bg-[#FF5F57]/5 border border-[#FF5F57]/30 rounded-lg p-3">
          <div className="font-code text-[10px] uppercase tracking-widest text-[#FF5F57] mb-1">
            feedback to agent
          </div>
          <p className="font-body text-xs text-ink leading-snug">{feedback}</p>
        </div>
      ) : (
        <div className="flex-1 bg-[#B8EF43]/5 border border-[#B8EF43]/30 rounded-lg p-3 flex items-center">
          <span className="font-code text-[11px] text-[#B8EF43] uppercase tracking-widest">
            output accepted — passes downstream
          </span>
        </div>
      )}
    </div>
  );
}

function RetryArrow({ visible }: { visible: boolean }) {
  return (
    <div
      className={`flex flex-col items-center transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-20"
      }`}
    >
      <div className="flex items-center gap-1 text-amber">
        <RotateCcw className="w-3.5 h-3.5" />
        <span className="font-code text-[10px] uppercase tracking-widest">
          retry · agent thinks harder
        </span>
      </div>
      <ArrowDown className="w-4 h-4 text-amber mt-1" />
    </div>
  );
}
