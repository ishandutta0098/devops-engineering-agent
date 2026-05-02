import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { chapters, getChapter, getAdjacentChapters } from "@/lib/registry";
import { ChapterSidebar } from "@/components/AppShell/ChapterSidebar";
import { DemoStation } from "@/components/Chapter/DemoStation";
import { LogExampleStation } from "@/components/Chapter/LogExampleStation";
import { IterationTimeline } from "@/components/Chapter/IterationTimeline";
import { WebSearchTool } from "@/components/Chapter/WebSearchTool";
import { ContextHandoff } from "@/components/Chapter/ContextHandoff";
import { CrewOrchestration } from "@/components/Chapter/CrewOrchestration";
import { GuardrailRetry } from "@/components/Chapter/GuardrailRetry";
import { TypedAccessSection } from "@/components/Chapter/TypedAccessSection";
import { PipelineTimeline } from "@/components/Demo/PipelineTimeline";
import type { ChapterDef } from "@/lib/schema";

export function generateStaticParams() {
  return chapters.map((ch) => ({ slug: ch.slug }));
}

function SpecializedPlayground({ chapter }: { chapter: ChapterDef }) {
  if (chapter.slug === "agent-parameters") {
    return (
      <div className="space-y-12">
        {chapter.iterationDemo && <IterationTimeline demo={chapter.iterationDemo} />}
        {chapter.webSearchDemo && <WebSearchTool demo={chapter.webSearchDemo} />}
      </div>
    );
  }
  if (chapter.slug === "task-context" && chapter.contextHandoff) {
    return <ContextHandoff demo={chapter.contextHandoff} />;
  }
  if (chapter.slug === "crew-orchestration" && chapter.crewDemo) {
    return <CrewOrchestration demo={chapter.crewDemo} />;
  }
  if (chapter.slug === "guardrails" && chapter.guardrailDemo) {
    return <GuardrailRetry demo={chapter.guardrailDemo} />;
  }
  if (chapter.slug === "full-pipeline" && chapter.pipelineTimeline) {
    return <PipelineTimeline demo={chapter.pipelineTimeline} />;
  }
  return null;
}

const SPECIALIZED_SLUGS = new Set([
  "agent-parameters",
  "task-context",
  "crew-orchestration",
  "guardrails",
  "full-pipeline",
]);

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) notFound();

  const { prev, next } = getAdjacentChapters(slug);
  const hasSpecialized = SPECIALIZED_SLUGS.has(slug);

  return (
    <div className="flex">
      <ChapterSidebar />

      <div className="lg:pl-64 flex-1">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="mb-10">
            <span className="font-code text-amber text-label-caps uppercase tracking-widest">
              {chapter.phase} / Chapter {String(chapter.number).padStart(2, "0")}
            </span>
            <h1 className="font-headline text-headline-lg text-ink mt-2">
              {chapter.title}
            </h1>
            <p className="font-body text-body-lg text-gray2 mt-3">
              {chapter.subtitle}
            </p>
          </div>

          <div className="bg-surface/50 border border-hairline rounded-lg p-6 mb-12">
            <p className="font-body text-body-md text-ink leading-relaxed">
              {chapter.intro}
            </p>
          </div>

          {chapter.examples?.length ? (
            <section className="mb-12">
              <div className="mb-5">
                <h2 className="font-headline text-headline-md text-ink">
                  Try It on Real Logs
                </h2>
                <p className="font-body text-sm text-gray2 mt-2">
                  Pick a log file. Watch how this chapter&apos;s idea changes
                  the result.
                </p>
              </div>
              <LogExampleStation examples={chapter.examples} />
            </section>
          ) : null}

          {chapter.demos.length ? (
            <section className="space-y-12 mb-16">
              {chapter.demos.map((demo) => (
                <DemoStation key={demo.id} demo={demo} />
              ))}
            </section>
          ) : null}

          {slug === "structured-output" && (
            <section className="mb-16">
              <TypedAccessSection />
            </section>
          )}

          {hasSpecialized && (
            <section className="mb-16">
              <h2 className="font-headline text-headline-md text-ink mb-6">
                {slug === "agent-parameters"
                  ? "Iteration Timeline"
                  : slug === "task-context"
                  ? "Context Handoff"
                  : slug === "crew-orchestration"
                  ? "Crew in Motion"
                  : slug === "guardrails"
                  ? "Guardrail Retry Loop"
                  : "Pipeline Timeline"}
              </h2>
              <SpecializedPlayground chapter={chapter} />
            </section>
          )}

          <div className="bg-surface/50 border border-amber/20 rounded-lg p-6 mb-12">
            <h2 className="font-headline text-label-caps uppercase text-amber tracking-widest mb-2">
              Key Takeaway
            </h2>
            <p className="font-body text-body-md text-ink leading-relaxed">
              {chapter.takeaway}
            </p>
          </div>

          <nav className="flex items-center justify-between border-t border-hairline pt-8">
            {prev ? (
              <Link
                href={`/curriculum/${prev.slug}`}
                className="flex items-center gap-2 font-code text-sm text-gray2 hover:text-amber transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>
                  {String(prev.number).padStart(2, "0")}. {prev.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                href={`/curriculum/${next.slug}`}
                className="flex items-center gap-2 font-code text-sm text-gray2 hover:text-amber transition-colors"
              >
                <span>
                  {String(next.number).padStart(2, "0")}. {next.title}
                </span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <div />
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
