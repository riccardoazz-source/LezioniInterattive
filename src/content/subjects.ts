import type { Level, Subject, SubjectId } from "./types";

export const SUBJECTS: Subject[] = [
  {
    id: "italiano",
    name: "Italiano",
    emoji: "📖",
    color: "bg-rose-100",
    accent: "text-rose-600",
    description: "Lettere, sillabe e parole",
  },
  {
    id: "matematica",
    name: "Matematica",
    emoji: "🔢",
    color: "bg-sky-100",
    accent: "text-sky-600",
    description: "Numeri, conti e forme",
  },
  {
    id: "scienze",
    name: "Scienze",
    emoji: "🔬",
    color: "bg-emerald-100",
    accent: "text-emerald-600",
    description: "Animali, piante e natura",
  },
  {
    id: "inglese",
    name: "Inglese",
    emoji: "🇬🇧",
    color: "bg-violet-100",
    accent: "text-violet-600",
    description: "Le prime parole in inglese",
  },
  {
    id: "mondo",
    name: "Il mondo",
    emoji: "🌍",
    color: "bg-amber-100",
    accent: "text-amber-600",
    description: "Tempo, luoghi e stare insieme",
  },
  {
    id: "arte",
    name: "Arte",
    emoji: "🎨",
    color: "bg-pink-100",
    accent: "text-pink-600",
    description: "Colori, disegno e musica",
  },
];

export const SUBJECT_MAP: Record<SubjectId, Subject> = Object.fromEntries(
  SUBJECTS.map((s) => [s.id, s]),
) as Record<SubjectId, Subject>;

export const LEVELS: { value: Level; label: string; age: string }[] = [
  { value: 1, label: "Prima", age: "5-6 anni" },
  { value: 2, label: "Seconda", age: "7 anni" },
  { value: 3, label: "Terza", age: "8 anni" },
  { value: 4, label: "Quarta", age: "9 anni" },
  { value: 5, label: "Quinta", age: "10 anni" },
];
