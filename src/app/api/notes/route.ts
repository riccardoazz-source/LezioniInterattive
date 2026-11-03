import { dbUnavailable, getDb } from "@/lib/db";
import { normalizeNote, type Note } from "@/lib/storage/types";

export const dynamic = "force-dynamic";

export interface Row {
  id: string;
  title: string;
  subject: string | null;
  pages: Note["pages"];
  created_at: string;
  updated_at: string;
}

export function rowToNote(r: Row): Note {
  return normalizeNote({
    id: r.id,
    title: r.title,
    subject: r.subject,
    pages: r.pages ?? [],
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  }) as Note;
}

export async function GET() {
  const db = getDb();
  if (!db) return dbUnavailable();
  const rows = (await db`select * from notes order by updated_at desc`) as Row[];
  return Response.json(rows.map(rowToNote));
}
