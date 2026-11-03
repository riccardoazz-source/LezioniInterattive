import { ApiNotesRepository } from "./api";
import { LocalNotesRepository } from "./local";
import type { NotesRepository } from "./types";

export type { Note, Stroke, StrokePoint, NotesRepository } from "./types";
export { BOARD_W, BOARD_H } from "./types";

let repo: NotesRepository | null = null;

/**
 * Scelta del backend:
 *  - default → localStorage (nessun server);
 *  - NEXT_PUBLIC_DATA_BACKEND=api → /api/notes su Neon.
 */
export function getNotesRepository(): NotesRepository {
  if (!repo) {
    repo =
      process.env.NEXT_PUBLIC_DATA_BACKEND === "api"
        ? new ApiNotesRepository()
        : new LocalNotesRepository();
  }
  return repo;
}

export function storageBackendName(): "locale" | "server" {
  return process.env.NEXT_PUBLIC_DATA_BACKEND === "api" ? "server" : "locale";
}
