/** Categorie dei disegni da colorare (cartelle in public/colora e importazioni dall'app). */
export interface ColoringCategory {
  id: string;
  name: string;
  emoji: string;
  /** classe Tailwind per lo sfondo della card */
  color: string;
}

export const COLORING_CATEGORIES: ColoringCategory[] = [
  { id: "pop", name: "Stelle pop", emoji: "🎤", color: "bg-rose-100" },
  { id: "fate", name: "Fate magiche", emoji: "🧚", color: "bg-fuchsia-100" },
  { id: "principesse", name: "Principesse", emoji: "👑", color: "bg-pink-100" },
  { id: "cuccioli", name: "Cuccioli", emoji: "🐶", color: "bg-orange-100" },
  { id: "gattini", name: "Gattini", emoji: "🐱", color: "bg-yellow-100" },
  { id: "coniglietti", name: "Coniglietti", emoji: "🐰", color: "bg-pink-100" },
  { id: "animali", name: "Animali", emoji: "🐾", color: "bg-emerald-100" },
  { id: "uccelli", name: "Uccelli", emoji: "🐦", color: "bg-cyan-100" },
  { id: "angeli", name: "Angeli", emoji: "👼", color: "bg-indigo-100" },
  { id: "unicorni", name: "Unicorni", emoji: "🦄", color: "bg-purple-100" },
  { id: "natura", name: "Natura e paesaggi", emoji: "🌳", color: "bg-lime-100" },
  { id: "fiori", name: "Fiori", emoji: "🌸", color: "bg-pink-100" },
  { id: "natale", name: "Natale", emoji: "🎄", color: "bg-red-100" },
  { id: "moda", name: "Moda", emoji: "👗", color: "bg-fuchsia-100" },
  { id: "mondo", name: "Viaggi nel mondo", emoji: "🌍", color: "bg-amber-100" },
  { id: "eroi", name: "Eroi", emoji: "🦸", color: "bg-violet-100" },
  { id: "alfabeto", name: "Alfabeto", emoji: "🔤", color: "bg-rose-100" },
  { id: "numeri", name: "Numeri", emoji: "🔢", color: "bg-sky-100" },
  { id: "altro", name: "Altro", emoji: "🎨", color: "bg-amber-100" },
];

export function categoryInfo(id: string): ColoringCategory {
  return COLORING_CATEGORIES.find((c) => c.id === id) ?? { id, name: id.charAt(0).toUpperCase() + id.slice(1), emoji: "🖍️", color: "bg-white" };
}

export function categoryOrder(id: string): number {
  const i = COLORING_CATEGORIES.findIndex((c) => c.id === id);
  return i === -1 ? 99 : i;
}

/** Tavolozza per colorare: tanti colori, anche pastello. */
export const COLORING_PALETTE = [
  "#ffffff", "#2b2d42", "#ef476f", "#ff7b54", "#ffb703", "#fff176", "#06d6a0", "#4caf50",
  "#118ab2", "#64b5f6", "#8338ec", "#f8a5c2", "#a1887f", "#ffe0b2",
];
