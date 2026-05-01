import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { chapters } from "@/lib/registry";

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
          Each chapter introduces one concept, shows the code, and lets you
          compare baseline vs enhanced output in an interactive demo.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {chapters.map((ch) => (
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
    </div>
  );
}
