import { ensureSchema, guard, json } from "@/lib/db";

export const dynamic = "force-dynamic";

type Ctx = RouteContext<"/api/blobs/[id]">;

const valid = (id: string) => /^[A-Za-z0-9_-]{1,120}$/.test(id);

/** Le foto e i disegni importati, salvati una volta sola e mai modificati. */
export async function GET(req: Request, ctx: Ctx) {
  const g = guard(req);
  if (g instanceof Response) return g;
  const { id } = await ctx.params;
  if (!valid(id)) return json({ error: "id non valido" }, 400);
  await ensureSchema(g.query);
  const rows = await g.query<{ content_type: string; data: Buffer | string }>(`select content_type, data from app_blobs where id = $1`, [id]);
  if (!rows.length) return json({ error: "non trovato" }, 404);
  const raw = rows[0].data;
  // Neon via HTTP restituisce bytea come stringa "\\x..."
  const buf = typeof raw === "string" ? Buffer.from(raw.replace(/^\\x/, ""), "hex") : Buffer.from(raw);
  return new Response(new Uint8Array(buf), {
    headers: { "content-type": rows[0].content_type, "cache-control": "private, max-age=31536000, immutable" },
  });
}

export async function PUT(req: Request, ctx: Ctx) {
  const g = guard(req);
  if (g instanceof Response) return g;
  const { id } = await ctx.params;
  if (!valid(id)) return json({ error: "id non valido" }, 400);
  const type = req.headers.get("content-type") ?? "application/octet-stream";
  if (!/^image\//.test(type)) return json({ error: "solo immagini" }, 400);
  const buf = Buffer.from(await req.arrayBuffer());
  if (buf.length === 0 || buf.length > 4_000_000) return json({ error: "immagine troppo grande" }, 413);
  await ensureSchema(g.query);
  await g.query(
    `insert into app_blobs (id, content_type, data) values ($1, $2, decode($3, 'hex')) on conflict (id) do nothing`,
    [id, type, buf.toString("hex")],
  );
  return json({ ok: true, url: `/api/blobs/${id}` });
}
