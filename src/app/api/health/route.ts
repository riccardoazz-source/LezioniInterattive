import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();
  if (!db) return Response.json({ ok: true, database: "non configurato" });
  try {
    const rows = await db`select now() as now`;
    return Response.json({ ok: true, database: "ok", now: rows[0]?.now });
  } catch (e) {
    return Response.json({ ok: false, database: "errore", detail: String(e) }, { status: 500 });
  }
}
