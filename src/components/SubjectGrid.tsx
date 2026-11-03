"use client";

import { SUBJECTS } from "@/content/subjects";
import { Tile } from "@/components/ui/Tile";
import { lessonsFor } from "@/content/lessons";
import { GAMES } from "@/content/games";
import { useSettings } from "@/lib/settings";
import { useProgress } from "@/lib/progress";

export function SubjectGrid({ base }: { base: "/impara" | "/gioca" }) {
  const [settings, , ready] = useSettings();
  const [progress] = useProgress();
  return (
    <div className="mx-auto grid w-full max-w-3xl grid-cols-2 gap-4 px-4 pb-8 sm:grid-cols-3">
      {SUBJECTS.map((s) => {
        const count =
          base === "/impara"
            ? lessonsFor(s.id, settings.level).length
            : GAMES.filter((g) => g.subject === s.id).length;
        if (base === "/gioca" && count === 0) return null;
        const done =
          base === "/impara"
            ? lessonsFor(s.id, settings.level).filter((l) => progress.lessons[l.id]).length
            : 0;
        return (
          <Tile
            key={s.id}
            href={`${base}/${s.id}`}
            emoji={s.emoji}
            title={s.name}
            subtitle={
              !ready
                ? s.description
                : base === "/impara"
                  ? `${done}/${count} lezioni fatte`
                  : `${count} ${count === 1 ? "gioco" : "giochi"}`
            }
            colorClass={s.color}
          />
        );
      })}
    </div>
  );
}
