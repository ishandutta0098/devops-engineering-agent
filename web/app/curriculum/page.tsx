import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { chapters } from "@/lib/registry";

const phaseGroups = [
  {
    phase: "Notebook 01",
    title: "Build the Pipeline",
    description: "Create the three-agent CrewAI flow from agents, tasks, tools, context, and orchestration.",
    chapters: chapters.filter((chapter) => chapter.phase === "Notebook 01"),
  },
  {
    phase: "Notebook 02",
    title: "Harden the Pipeline",
    description: "Add structured output and guardrails to make the same pipeline production-ready.",
    chapters: chapters.filter((chapter) => chapter.phase === "Notebook 02"),
  },
];

export default function CurriculumPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <span className="font-code text-amber text-label-caps uppercase tracking-widest">
          Curriculum
        </span>
        <h1 className="font-headline text-headline-lg text-ink mt-2">
          9 Chapters to Production
        </h1>
        <p className="font-body text-body-lg text-gray2 mt-3">
          Each chapter introduces one concept and lets you compare baseline vs
          enhanced output in an interactive demo.
        </p>
      </div>

      <div className="space-y-12">
        {phaseGroups.map((group) => (
          <section key={group.phase}>
            <div className="mb-5">
              <span className="font-code text-amber text-label-caps uppercase tracking-widest">
                {group.phase}
              </span>
              <h2 className="font-headline text-headline-md text-ink mt-2">
                {group.title}
              </h2>
              <p className="font-body text-sm text-gray2 mt-2">
                {group.description}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {group.chapters.map((ch) => (
                <Link
                  key={ch.slug}
                  href={`/curriculum/${ch.slug}`}
                  className="group bg-surface border border-hairline rounded-lg p-6 hover:border-amber/40 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-code text-amber text-xs font-bold">
                      {String(ch.number).padStart(2, "0")}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray3 group-hover:text-amber transition-colors" />
                  </div>
                  <h3 className="font-headline text-headline-sm text-ink mb-2">
                    {ch.title}
                  </h3>
                  <p className="font-body text-sm text-gray2 line-clamp-3">
                    {ch.subtitle}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
