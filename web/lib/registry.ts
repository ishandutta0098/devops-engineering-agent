import type { ChapterDef } from "./schema";

import { ch01 } from "./chapters/ch01-first-agent";
import { ch02 } from "./chapters/ch02-first-task";
import { ch03 } from "./chapters/ch03-agent-parameters";
import { ch04 } from "./chapters/ch04-tools";
import { ch05 } from "./chapters/ch05-task-context";
import { ch06 } from "./chapters/ch06-structured-output";
import { ch07 } from "./chapters/ch07-guardrails";
import { ch08 } from "./chapters/ch08-crew-orchestration";
import { ch09 } from "./chapters/ch09-full-pipeline";

export const chapters: ChapterDef[] = [
  ch01,
  ch02,
  ch04,
  ch03,
  ch05,
  ch08,
  ch06,
  ch07,
  ch09,
];

export function getChapter(slug: string): ChapterDef | undefined {
  return chapters.find((c) => c.slug === slug);
}

export function getAdjacentChapters(slug: string) {
  const idx = chapters.findIndex((c) => c.slug === slug);
  return {
    prev: idx > 0 ? chapters[idx - 1] : null,
    next: idx < chapters.length - 1 ? chapters[idx + 1] : null,
  };
}
