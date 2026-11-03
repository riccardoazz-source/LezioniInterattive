import type { Lesson, Level, SubjectId } from "../types";
import { italiano } from "./italiano";
import { matematica } from "./matematica";
import { scienze } from "./scienze";
import { inglese } from "./inglese";
import { mondo } from "./mondo";
import { arte } from "./arte";

/**
 * Tutte le lezioni. Per aggiungerne di nuove:
 *  1. crea l'oggetto Lesson nel file della materia (o un nuovo file);
 *  2. assicurati che l'`id` sia unico e che `level` sia corretto;
 *  3. `npm run typecheck` ti dice subito se manca qualcosa.
 */
export const LESSONS: Lesson[] = [
  ...italiano,
  ...matematica,
  ...scienze,
  ...inglese,
  ...mondo,
  ...arte,
];

const ids = new Set<string>();
for (const l of LESSONS) {
  if (ids.has(l.id)) throw new Error(`Lezione duplicata: ${l.id}`);
  ids.add(l.id);
}

export const LESSON_MAP: Record<string, Lesson> = Object.fromEntries(
  LESSONS.map((l) => [l.id, l]),
);

/** Lezioni di una materia adatte al livello (livello scelto + precedenti). */
export function lessonsFor(subject: SubjectId, level: Level): Lesson[] {
  return LESSONS.filter((l) => l.subject === subject && l.level <= level).sort(
    (a, b) => a.level - b.level,
  );
}
