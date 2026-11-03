import { dbUnavailable, getDb } from "@/lib/db";
import type { Note } from "@/lib/storage/types";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  title: string;
  subject: string | null;
  body: string;
  drawing: Note["drawing"];
  created_at: string;
  updated_at: string;
}

export function rowToNote(r: Row): Note {
  return {
    id: r.id,
    title: r.title,
    subject: r.subject as Note["subject"],
    body: r.body,
    drawing: r.drawing ?? [],
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}

export async function GET() {
  const db = getDb();
  if (!db) return dbUnavailable();
  const rows = (await db`select * from notes order by updated_at desc`) as Row[];
  return Response.json(rows.map(rowToNote));
}
