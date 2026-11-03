import { idb, STORES } from "./idb";
import type { Stroke } from "./types";

/** Un disegno salvato: libero oppure una pagina da colorare. */
export interface SavedDrawing {
  id: string;
  kind: "free" | "coloring";
  /** id della pagina da colorare (solo kind = coloring) */
  pageId?: string;
  title: string;
  strokes: Stroke[];
  /** colori delle zone (solo coloring): id zona → colore */
  fills: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export async function listDrawings(): Promise<SavedDrawing[]> {
  const all = await idb<SavedDrawing[]>(STORES.drawings, "readonly", (s) => s.getAll());
  return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getDrawing(id: string): Promise<SavedDrawing | undefined> {
  return idb<SavedDrawing | undefined>(STORES.drawings, "readonly", (s) => s.get(id));
}

export async function saveDrawing(d: SavedDrawing): Promise<void> {
  await idb(STORES.drawings, "readwrite", (s) => s.put(d));
}

export async function removeDrawing(id: string): Promise<void> {
  await idb(STORES.drawings, "readwrite", (s) => s.delete(id));
}
