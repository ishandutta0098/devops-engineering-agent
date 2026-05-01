import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { chapters, getChapter, getAdjacentChapters } from "@/lib/registry";
import { ChapterSidebar } from "@/components/AppShell/ChapterSidebar";
import { ConceptBlock } from "@/components/Chapter/ConceptBlock";
import { BeforeAfterComparison } from "@/components/Chapter/BeforeAfterComparison";
import { ChapterPlayground } from "@/components/Chapter/ChapterPlayground";

export function generateStaticParams() {
  return chapters.map((ch) => ({ slug: ch.slug }));
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) notFound();

  const { prev, next } = getAdjacentChapters(slug);

  return (
    <div className="flex">
      <ChapterSidebar />

      <div className="lg:pl-64 flex-1">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-10">
            <span className="font-code text-amber text-label-caps uppercase tracking-widest">
              Chapter {String(chapter.number).padStart(2, "0")}
            </span>
            <h1 className="font-headline text-headline-lg text-ink mt-2">
              {chapter.title}
            </h1>
            <p className="font-body text-body-lg text-gray2 mt-3">
              {chapter.subtitle}
            </p>
          </div>

          <div className="bg-surface/50 border border-hairline rounded-lg p-6 mb-12">
            <h2 className="font-headline text-label-caps uppercase text-amber tracking-widest mb-2">
              Objective
            </h2>
            <p className="font-body text-body-md text-ink">{chapter.objective}</p>
          </div>

          <section className="space-y-10 mb-16">
            <h2 className="font-headline text-headline-md text-ink">Concepts</h2>
            {chapter.concepts.map((concept) => (
              <ConceptBlock key={concept.id} concept={concept} />
            ))}
          </section>

          <section className="mb-16">
            <h2 className="font-headline text-headline-md text-ink mb-6">
              Before & After
            </h2>
            <BeforeAfterComparison
              baseline={chapter.fixtures.baseline}
              enhanced={chapter.fixtures.enhanced}
            />
          </section>

          <section className="mb-16">
            <h2 className="font-headline text-headline-md text-ink mb-6">
              Interactive Demo
            </h2>
            <ChapterPlayground chapter={chapter} />
          </section>

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
