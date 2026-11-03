import { dbUnavailable, getDb } from "@/lib/db";
import type { Note } from "@/lib/storage/types";
import { rowToNote } from "../route";

export const dynamic = "force-dynamic";

type Ctx = RouteContext<"/api/notes/[id]">;

export async function GET(_req: Request, ctx: Ctx) {
  const db = getDb();
  if (!db) return dbUnavailable();
  const { id } = await ctx.params;
  const rows = await db`select * from notes where id = ${id}`;
  if (rows.length === 0) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(rowToNote(rows[0] as Parameters<typeof rowToNote>[0]));
}

export async function PUT(req: Request, ctx: Ctx) {
  const db = getDb();
  if (!db) return dbUnavailable();
  const { id } = await ctx.params;
  const note = (await req.json()) as Note;
  if (!note || typeof note.title !== "string" || typeof note.body !== "string" || !Array.isArray(note.drawing)) {
    return Response.json({ error: "nota non valida" }, { status: 400 });
  }
  const rows = await db`
    insert into notes (id, title, subject, body, drawing, created_at, updated_at)
    values (${id}, ${note.title}, ${note.subject}, ${note.body}, ${JSON.stringify(note.drawing)}::jsonb,
            ${note.createdAt ?? new Date().toISOString()}, now())
    on conflict (id) do update set
      title = excluded.title,
      subject = excluded.subject,
      body = excluded.body,
      drawing = excluded.drawing,
      updated_at = now()
    returning *`;
  return Response.json(rowToNote(rows[0] as Parameters<typeof rowToNote>[0]));
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const db = getDb();
  if (!db) return dbUnavailable();
  const { id } = await ctx.params;
  await db`delete from notes where id = ${id}`;
  return new Response(null, { status: 204 });
}
