import { LocalNotesRepository } from "./local";
import type { NotesRepository } from "./types";

export type { Note, NotePage, NoteImage, Stroke, StrokePoint, NotesRepository } from "./types";
export { BOARD_W, BOARD_H, PAGE_W, PAGE_H, newPage, normalizeNote, noteText } from "./types";

let repo: NotesRepository | null = null;

/**
 * Le note stanno sempre nel dispositivo (IndexedDB): l'app funziona anche
 * offline. Se il server è configurato, src/lib/sync le copia avanti e indietro.
 */
export function getNotesRepository(): NotesRepository {
  if (!repo) repo = new LocalNotesRepository();
  return repo;
}
