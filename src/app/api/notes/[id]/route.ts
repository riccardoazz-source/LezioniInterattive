import { dbUnavailable, getDb } from "@/lib/db";
import { normalizeNote } from "@/lib/storage/types";
import { rowToNote, type Row } from "../route";

export const dynamic = "force-dynamic";

type Ctx = RouteContext<"/api/notes/[id]">;

export async function GET(_req: Request, ctx: Ctx) {
  const db = getDb();
  if (!db) return dbUnavailable();
  const { id } = await ctx.params;
  const rows = (await db`select * from notes where id = ${id}`) as Row[];
  if (rows.length === 0) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(rowToNote(rows[0]));
}

export async function PUT(req: Request, ctx: Ctx) {
  const db = getDb();
  if (!db) return dbUnavailable();
  const { id } = await ctx.params;
  const note = normalizeNote({ ...(await req.json()), id });
  if (!note) return Response.json({ error: "nota non valida" }, { status: 400 });
  const rows = (await db`
    insert into notes (id, title, subject, pages, created_at, updated_at)
    values (${id}, ${note.title}, ${note.subject}, ${JSON.stringify(note.pages)}::jsonb, ${note.createdAt}, now())
    on conflict (id) do update set
      title = excluded.title,
      subject = excluded.subject,
      pages = excluded.pages,
      updated_at = now()
    returning *`) as Row[];
  return Response.json(rowToNote(rows[0]));
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const db = getDb();
  if (!db) return dbUnavailable();
  const { id } = await ctx.params;
  await db`delete from notes where id = ${id}`;
  return new Response(null, { status: 204 });
}
