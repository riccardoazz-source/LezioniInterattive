"use client";

import Link from "next/link";
import { useState } from "react";
import { LESSONS } from "@/content/lessons";
import { LEVELS, SUBJECT_MAP } from "@/content/subjects";
import type { Level, SubjectId } from "@/content/types";
import { useSettings } from "@/lib/settings";
import { useProgress } from "@/lib/progress";
import { Stars } from "@/components/ui/Stars";

/** Lezioni di una materia, divise per classe (Prima, Seconda, Terza...). */
export function LessonList({ subject }: { subject: SubjectId }) {
  const [settings, , ready] = useSettings();
  const [progress] = useProgress();
  const [chosen, setChosen] = useState<Level | null>(null);
  if (!ready) return null;
  const s = SUBJECT_MAP[subject];
  const all = LESSONS.filter((l) => l.subject === subject);
  const levels = LEVELS.filter((lv) => all.some((l) => l.level === lv.value));
  const wanted = chosen ?? settings.level;
  const level = levels.some((l) => l.value === wanted) ? wanted : (levels[levels.length - 1]?.value ?? 1);
  const lessons = all.filter((l) => l.level === level);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 pb-8">
      <div className="no-select flex flex-wrap justify-center gap-2">
        {levels.map((lv) => {
          const n = all.filter((l) => l.level === lv.value).length;
          const done = all.filter((l) => l.level === lv.value && progress.lessons[l.id]).length;
          return (
            <button
              key={lv.value}
              type="button"
              onClick={() => setChosen(lv.value as Level)}
              className={`flex flex-col items-center rounded-2xl px-4 py-2 font-black shadow-sm transition active:scale-95 ${
                lv.value === level ? "bg-foreground text-white" : "bg-white"
              }`}
            >
              <span>{lv.label}</span>
              <span className={`text-xs font-bold ${lv.value === level ? "text-white/80" : "text-muted"}`}>
                {lv.age} · {done}/{n}
              </span>
            </button>
          );
        })}
      </div>
      {lessons.length === 0 && (
        <p className="mx-auto max-w-md p-8 text-center text-lg text-muted">Non ci sono ancora lezioni di {s.name} per questa classe.</p>
      )}
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
            </span>
            {p ? <Stars value={p.stars} /> : <span className="text-2xl">▶️</span>}
          </Link>
        );
      })}
    </div>
  );
}
