import { gunzipSync } from "node:zlib";
import { ensureSchema, guard, json } from "@/lib/db";

export const dynamic = "force-dynamic";

const COLLECTIONS = new Set(["notes", "drawings", "pages", "kv"]);
/** Le risposte di Vercel non possono superare 4,5 MB: si pagina sotto i 3 MB. */
const BUDGET = 3_000_000;

interface Row {
  collection: string;
  id: string;
  data: unknown;
  updated_at: string | Date;
  deleted: boolean;
  seq: string | number;
}

/** GET /api/sync?after=<seq>: tutto quello che è cambiato dopo quel numero. */
export async function GET(req: Request) {
  const g = guard(req);
  if (g instanceof Response) return g;
  await ensureSchema(g.query);
  const after = Number(new URL(req.url).searchParams.get("after") ?? 0) || 0;
  const rows = await g.query<Row>(
    `select collection, id, data, updated_at, deleted, seq from app_docs where seq > $1 order by seq limit 200`,
    [after],
  );
  const docs = [];
  let size = 0;
  let last = after;
  for (const r of rows) {
    const item = { collection: r.collection, id: r.id, data: r.deleted ? null : r.data, updatedAt: new Date(r.updated_at).toISOString(), deleted: r.deleted };
    const len = JSON.stringify(item).length;
    if (docs.length > 0 && size + len > BUDGET) break;
    docs.push(item);
    size += len;
    last = Number(r.seq);
  }
  return json({ docs, last, more: docs.length < rows.length || rows.length === 200 });
}

interface PushDoc {
  collection: string;
  id: string;
  data: unknown;
  updatedAt: string;
  deleted?: boolean;
}

/** POST /api/sync: carica le modifiche (vince la più recente). Corpo JSON, anche gzip. */
export async function POST(req: Request) {
  const g = guard(req);
  if (g instanceof Response) return g;
  await ensureSchema(g.query);
  let body: { docs?: PushDoc[] };
  try {
    const raw = Buffer.from(await req.arrayBuffer());
    const text = req.headers.get("x-gzip") === "1" ? gunzipSync(raw).toString("utf8") : raw.toString("utf8");
    body = JSON.parse(text);
  } catch {
    return json({ error: "Dati non validi." }, 400);
  }
  const docs = Array.isArray(body.docs) ? body.docs : [];
  let saved = 0;
  for (const d of docs) {
    if (!d || !COLLECTIONS.has(d.collection) || typeof d.id !== "string" || !d.id || d.id.length > 200) continue;
    const updatedAt = new Date(d.updatedAt);
    if (Number.isNaN(updatedAt.getTime())) continue;
    const res = await g.query(
      `insert into app_docs (collection, id, data, updated_at, deleted, seq)
       values ($1, $2, $3::jsonb, $4, $5, nextval('app_docs_seq'))
       on conflict (collection, id) do update set
         data = excluded.data, updated_at = excluded.updated_at, deleted = excluded.deleted, seq = nextval('app_docs_seq')
       where app_docs.updated_at <= excluded.updated_at
       returning id`,
      [d.collection, d.id, d.deleted ? null : JSON.stringify(d.data ?? null), updatedAt.toISOString(), !!d.deleted],
    );
    if (res.length) saved++;
  }
  return json({ ok: true, saved });
}
