import type { Note, NotesRepository } from "./types";

/**
 * Salva le note sul server (route handlers in /api/notes → Neon Postgres).
 * Si attiva con NEXT_PUBLIC_DATA_BACKEND=api. Stessa interfaccia del
 * repository locale: il resto dell'app non cambia.
 */
export class ApiNotesRepository implements NotesRepository {
  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`API ${res.status}: ${text || res.statusText}`);
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  list() {
    return this.request<Note[]>("/api/notes");
  }

  async get(id: string) {
    try {
      return await this.request<Note>(`/api/notes/${encodeURIComponent(id)}`);
    } catch (e) {
      if (e instanceof Error && e.message.startsWith("API 404")) return null;
      throw e;
    }
  }

  save(note: Note) {
    return this.request<Note>(`/api/notes/${encodeURIComponent(note.id)}`, {
      method: "PUT",
      body: JSON.stringify(note),
    });
  }

  remove(id: string) {
    return this.request<void>(`/api/notes/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  }
}
