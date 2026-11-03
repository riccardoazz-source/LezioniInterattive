"use client";

import Link from "next/link";
import { lessonsFor } from "@/content/lessons";
import { LEVELS, SUBJECT_MAP } from "@/content/subjects";
import type { SubjectId } from "@/content/types";
import { useSettings } from "@/lib/settings";
import { useProgress } from "@/lib/progress";
import { Stars } from "@/components/ui/Stars";

export function LessonList({ subject }: { subject: SubjectId }) {
  const [settings, , ready] = useSettings();
  const [progress] = useProgress();
  if (!ready) return null;
  const lessons = lessonsFor(subject, settings.level);
  const s = SUBJECT_MAP[subject];
  if (lessons.length === 0) {
    return (
      <p className="mx-auto max-w-md p-8 text-center text-lg text-muted">
        Non ci sono ancora lezioni di {s.name} per questo livello. Arriveranno presto!
      </p>
    );
  }
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 pb-8">
      {lessons.map((l) => {
        const p = progress.lessons[l.id];
        return (
          <Link
            key={l.id}
            href={`/impara/${subject}/${l.id}`}
            className={`no-select flex items-center gap-4 rounded-3xl ${s.color} p-4 shadow-md transition active:scale-[0.98]`}
          >
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-4xl shadow-sm">{l.emoji}</span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-xl font-black">{l.title}</span>
              <span className="truncate text-sm font-semibold text-muted">{l.description}</span>
              {l.level !== settings.level && (
                <span className="mt-1 w-fit rounded-full bg-white/70 px-2 text-xs font-bold text-muted">
                  {LEVELS.find((x) => x.value === l.level)?.label}
                </span>
              )}
            </span>
            {p ? <Stars value={p.stars} /> : <span className="text-2xl">▶️</span>}
          </Link>
        );
      })}
    </div>
  );
}
