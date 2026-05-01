"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { chapters } from "@/lib/registry";

export function ChapterSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 bg-surface-low border-r border-hairline overflow-y-auto">
      <div className="p-4">
        <h2 className="font-headline text-label-caps uppercase text-gray3 mb-4 tracking-widest">
          Chapters
        </h2>
        <nav className="space-y-1">
          {chapters.map((ch) => {
            const href = `/curriculum/${ch.slug}`;
            const isActive = pathname === href;
            return (
              <Link
                key={ch.slug}
                href={href}
                className={`flex items-start gap-3 px-3 py-2.5 rounded transition-colors ${
                  isActive
                    ? "bg-surface text-amber"
                    : "text-gray2 hover:text-ink hover:bg-surface"
                }`}
              >
                <span
                  className={`font-code text-[11px] font-bold mt-0.5 shrink-0 ${
                    isActive ? "text-amber" : "text-gray3"
                  }`}
                >
                  {String(ch.number).padStart(2, "0")}
                </span>
                <span className="font-body text-sm leading-snug">{ch.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
