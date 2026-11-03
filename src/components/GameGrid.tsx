"use client";

import Link from "next/link";
import { GAMES } from "@/content/games";
import { SUBJECT_MAP, SUBJECTS } from "@/content/subjects";
import type { SubjectId } from "@/content/types";
import { useProgress } from "@/lib/progress";

export function GameGrid({ subject }: { subject?: SubjectId }) {
  const [progress] = useProgress();
  const games = subject ? GAMES.filter((g) => g.subject === subject) : GAMES;
  const groups = SUBJECTS.filter((s) => games.some((g) => g.subject === s.id));
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-8">
      {groups.map((s) => (
        <section key={s.id}>
          {!subject && (
            <h2 className={`mb-2 text-lg font-black ${s.accent}`}>
              {s.emoji} {s.name}
            </h2>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {games
              .filter((g) => g.subject === s.id)
              .map((g) => {
                const p = progress.games[g.id];
                return (
                  <Link
                    key={g.id}
                    href={`/gioca/gioco/${g.id}`}
                    className={`no-select flex min-h-36 flex-col items-center justify-center gap-1 rounded-3xl ${SUBJECT_MAP[g.subject].color} p-4 text-center shadow-md transition active:scale-95`}
                  >
                    <span className="text-5xl">{g.emoji}</span>
                    <span className="text-lg font-black">{g.title}</span>
                    <span className="text-xs font-semibold text-muted">{g.description}</span>
                    {p && <span className="mt-1 rounded-full bg-white/80 px-2 text-xs font-bold">🏆 {p.best} · {p.plays}×</span>}
                  </Link>
                );
              })}
          </div>
        </section>
      ))}
    </div>
  );
}
