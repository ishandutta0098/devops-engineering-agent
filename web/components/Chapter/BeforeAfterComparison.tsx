"use client";

import { useState } from "react";
import type { FixturePair } from "@/lib/schema";
import { TerminalWindow } from "@/components/Terminal/Window";

export function BeforeAfterComparison({
  baseline,
  enhanced,
}: {
  baseline: FixturePair;
  enhanced: FixturePair;
}) {
  const [activeTab, setActiveTab] = useState<"baseline" | "enhanced">("baseline");
  const active = activeTab === "baseline" ? baseline : enhanced;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("baseline")}
          className={`px-4 py-2 rounded font-code text-sm transition-colors ${
            activeTab === "baseline"
              ? "bg-[#FF5F57]/20 text-[#FF5F57] border border-[#FF5F57]/40"
              : "bg-surface text-gray2 border border-hairline hover:text-ink"
          }`}
        >
          {baseline.label}
        </button>
        <button
          onClick={() => setActiveTab("enhanced")}
          className={`px-4 py-2 rounded font-code text-sm transition-colors ${
            activeTab === "enhanced"
              ? "bg-amber/20 text-amber border border-amber/40"
              : "bg-surface text-gray2 border border-hairline hover:text-ink"
          }`}
        >
          {enhanced.label}
        </button>
      </div>

      <p className="font-body text-body-md text-gray2">{active.description}</p>

      <TerminalWindow
        title="output"
        accent={activeTab === "enhanced" ? "#FFBF00" : "#FF5F57"}
        rightLabel={activeTab === "enhanced" ? "ENHANCED" : "BASELINE"}
      >
        <pre className="text-code-sm text-ink whitespace-pre-wrap leading-relaxed">
          {active.output}
        </pre>
      </TerminalWindow>
    </div>
  );
}
