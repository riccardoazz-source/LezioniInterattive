import type { Note, NotesRepository } from "./types";

const KEY = "li:notes";

function readAll(): Note[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Note[]) : [];
  } catch {
    return [];
  }
}

function writeAll(notes: Note[]) {
  window.localStorage.setItem(KEY, JSON.stringify(notes));
}

/** Salva le note nel browser (localStorage). Nessun server necessario. */
export class LocalNotesRepository implements NotesRepository {
  async list(): Promise<Note[]> {
    return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async get(id: string): Promise<Note | null> {
    return readAll().find((n) => n.id === id) ?? null;
  }

  async save(note: Note): Promise<Note> {
    const all = readAll();
    const idx = all.findIndex((n) => n.id === note.id);
    if (idx >= 0) all[idx] = note;
    else all.push(note);
    writeAll(all);
    return note;
  }

  async remove(id: string): Promise<void> {
    writeAll(readAll().filter((n) => n.id !== id));
  }
}
