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

export interface Note {
  id: string;
  title: string;
  subject: SubjectId | null;
  /** testo della lezione (a capo mantenuti) */
  body: string;
  /** disegno/lavagna fatto con Apple Pencil */
  drawing: Stroke[];
  createdAt: string;
  updatedAt: string;
}

export interface NotesRepository {
  list(): Promise<Note[]>;
  get(id: string): Promise<Note | null>;
  save(note: Note): Promise<Note>;
  remove(id: string): Promise<void>;
}
