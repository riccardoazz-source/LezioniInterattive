import type { SubjectId } from "@/content/types";

/** Un punto del tratto: coordinate logiche (0..W, 0..H) e pressione 0..1. */
export interface StrokePoint {
  x: number;
  y: number;
  p: number;
}

export interface Stroke {
  color: string;
  width: number;
  /** true = gomma */
  erase?: boolean;
  points: StrokePoint[];
}

/** Dimensione logica della lavagna: i tratti sono salvati in queste unità. */
export const BOARD_W = 1000;
export const BOARD_H = 700;

export interface NoteImage {
  id: string;
  /** immagine compressa (JPEG) come data URL */
  dataUrl: string;
  caption?: string;
}

/** Una pagina del quaderno: testo, foto e lavagna. */
export interface NotePage {
  id: string;
  text: string;
  images: NoteImage[];
  drawing: Stroke[];
}

/** Una nota = un quaderno con più pagine. */
export interface Note {
  id: string;
  title: string;
  subject: SubjectId | null;
  pages: NotePage[];
  createdAt: string;
  updatedAt: string;
}

export interface NotesRepository {
  list(): Promise<Note[]>;
  get(id: string): Promise<Note | null>;
  save(note: Note): Promise<Note>;
  remove(id: string): Promise<void>;
}

export function newPage(id: string): NotePage {
  return { id, text: "", images: [], drawing: [] };
}

/**
 * Accetta anche il vecchio formato (body + drawing, senza pagine) e lo
 * converte in un quaderno con una pagina.
 */
export function normalizeNote(raw: unknown): Note | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<Note> & { body?: string; drawing?: Stroke[] };
  if (typeof r.id !== "string") return null;
  const pages: NotePage[] = Array.isArray(r.pages)
    ? r.pages.map((p, i) => ({
        id: typeof p?.id === "string" ? p.id : `p${i}`,
        text: typeof p?.text === "string" ? p.text : "",
        images: Array.isArray(p?.images) ? p.images : [],
        drawing: Array.isArray(p?.drawing) ? p.drawing : [],
      }))
    : [{ id: "p0", text: r.body ?? "", images: [], drawing: r.drawing ?? [] }];
  const now = new Date().toISOString();
  return {
    id: r.id,
    title: typeof r.title === "string" ? r.title : "",
    subject: (r.subject as SubjectId | null) ?? null,
    pages: pages.length ? pages : [newPage("p0")],
    createdAt: r.createdAt ?? now,
    updatedAt: r.updatedAt ?? now,
  };
}

/** Testo di tutte le pagine (per anteprime e ricerca). */
export function noteText(n: Note): string {
  return n.pages.map((p) => p.text).join("\n").trim();
}
