import { idb, STORES } from "./idb";
import type { Stroke } from "./types";

/** Un riempimento a secchiello su un'immagine: punto toccato e colore. */
export interface PaintOp {
  x: number;
  y: number;
  color: string;
}

/** Un disegno salvato: libero, pagina SVG da colorare o immagine da colorare. */
export interface SavedDrawing {
  id: string;
  kind: "free" | "coloring" | "image";
  /** id della pagina da colorare (coloring / image) */
  pageId?: string;
  title: string;
  strokes: Stroke[];
  /** colori delle zone (solo coloring SVG): id zona → colore */
  fills: Record<string, string>;
  /** riempimenti a secchiello (solo image), da rieseguire in ordine */
  paintOps?: PaintOp[];
  /** miniatura JPEG (solo image) per la galleria */
  thumbnail?: string;
  /** segnato come finito dalla bambina */
  completed?: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Tutte le versioni colorate di una pagina, dalla più recente. */
export async function listWorksForPage(pageId: string): Promise<SavedDrawing[]> {
  const all = await listDrawings();
  return all.filter((d) => d.kind === "image" && d.pageId === pageId);
}

/** Un disegno da colorare importato dall'utente (immagine). */
export interface CustomPage {
  id: string;
  title: string;
  category: string;
  /** immagine (data URL) */
  dataUrl: string;
  createdAt: string;
}

export async function listCustomPages(): Promise<CustomPage[]> {
  const all = await idb<CustomPage[]>(STORES.pages, "readonly", (s) => s.getAll());
  return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function getCustomPage(id: string): Promise<CustomPage | undefined> {
  return idb<CustomPage | undefined>(STORES.pages, "readonly", (s) => s.get(id));
}

export async function saveCustomPage(p: CustomPage): Promise<void> {
  await idb(STORES.pages, "readwrite", (s) => s.put(p));
}

export async function removeCustomPage(id: string): Promise<void> {
  await idb(STORES.pages, "readwrite", (s) => s.delete(id));
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
