import type { WebSearchDemo } from "@/lib/schema";
import { Search, Globe, ArrowDown, Bot } from "lucide-react";

export function WebSearchTool({ demo }: { demo: WebSearchDemo }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="font-headline text-headline-md text-ink mb-2">
          Web Search Tool — EXASearchTool
        </h2>
        <p className="font-body text-sm text-gray2">
          Watch how a single agent ask is fanned out into multiple search queries,
          then compiled back into one context bundle the agent can reason over.
        </p>
      </div>

      <div className="bg-surface-low border border-hairline rounded-xl p-6 space-y-6">
        <div>
          <div className="font-code text-[10px] uppercase tracking-widest text-gray3 mb-2">
            Agent input
          </div>
          <div className="bg-night border border-hairline rounded p-4">
            <p className="font-code text-sm text-ink italic">&ldquo;{demo.toolInput}&rdquo;</p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-amber/10 border border-amber/40 rounded px-4 py-2 flex items-center gap-2">
            <Search className="w-4 h-4 text-amber" />
            <span className="font-code text-xs text-amber tracking-wide">EXASearchTool</span>
          </div>
          <div className="w-px h-6 bg-hairline" aria-hidden />
          <div className="font-code text-[10px] uppercase tracking-widest text-gray3">
            fans out into {demo.queries.length} queries
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
          {demo.queries.map((q, i) => (
            <div key={i} className="bg-surface border border-hairline rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-code text-[10px] uppercase tracking-widest text-amber">
                  query {i + 1}
                </span>
              </div>
              <p className="font-code text-sm text-ink mb-4 break-words">&ldquo;{q.query}&rdquo;</p>
              <div className="space-y-2">
                {q.results.map((r, j) => (
                  <div
                    key={j}
                    className="bg-night/60 border border-hairline rounded p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-3 h-3 text-gray3" />
                      <span className="font-code text-[10px] text-gray3 truncate">
                        {r.source}
                      </span>
                    </div>
                    <div className="font-body text-xs text-ink font-medium leading-snug mb-1">
                      {r.title}
                    </div>
                    <div className="font-body text-[11px] text-gray2 leading-snug">
                      {r.snippet}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <ArrowDown className="w-5 h-5 text-amber" />
        </div>

        <div className="bg-amber/5 border border-amber/40 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber" />
            <span className="font-code text-[10px] uppercase tracking-widest text-amber">
              Compiled context — handed to the agent
            </span>
          </div>
          <pre className="font-code text-xs text-ink whitespace-pre-wrap leading-relaxed">
{demo.compiledContext}
          </pre>
        </div>

        <div className="flex items-center justify-center gap-3">
          <ArrowDown className="w-4 h-4 text-gray3" />
          <div className="bg-surface border border-hairline rounded-lg px-4 py-3 flex items-center gap-3">
            <Bot className="w-4 h-4 text-amber" />
            <div>
              <div className="font-code text-[10px] uppercase tracking-widest text-amber">
                Investigator Agent
              </div>
              <div className="font-body text-xs text-gray2">
                Now reasons over compiled web context
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
