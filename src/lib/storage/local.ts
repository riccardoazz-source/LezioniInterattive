import { idb, STORES } from "./idb";
import { normalizeNote, type Note, type NotesRepository } from "./types";

/**
 * Salvataggio nel browser con IndexedDB (capienza grande, adatta alle foto).
 * Le note create con la prima versione (localStorage) vengono importate
 * automaticamente la prima volta.
 */
const LEGACY_KEY = "li:notes";
const tx = <T,>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>) => idb(STORES.notes, mode, fn);

async function migrateLegacy() {
  try {
    const raw = window.localStorage.getItem(LEGACY_KEY);
    if (!raw) return;
    const old = JSON.parse(raw) as unknown[];
    for (const item of old) {
      const n = normalizeNote(item);
      if (n) await tx("readwrite", (s) => s.put(n));
    }
    window.localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* niente da migrare */
  }
}

export class LocalNotesRepository implements NotesRepository {
  private migrated: Promise<void> | null = null;

  private ready() {
    if (!this.migrated) this.migrated = migrateLegacy();
    return this.migrated;
  }

  async list(): Promise<Note[]> {
    await this.ready();
    const all = await tx<unknown[]>("readonly", (s) => s.getAll());
    return all
      .map(normalizeNote)
      .filter((n): n is Note => n !== null)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async get(id: string): Promise<Note | null> {
    await this.ready();
    const raw = await tx<unknown>("readonly", (s) => s.get(id));
    return normalizeNote(raw);
  }

  async save(note: Note): Promise<Note> {
    await this.ready();
    await tx("readwrite", (s) => s.put(note));
    return note;
  }

  async remove(id: string): Promise<void> {
    await this.ready();
    await tx("readwrite", (s) => s.delete(id));
  }
}
