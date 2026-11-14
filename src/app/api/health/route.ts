import { databaseUrl, ensureSchema, getQuery, isAuthorized, isProtected, json } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Stato del server: usato dall'app per decidere se sincronizzare. */
export async function GET(req: Request) {
  const build = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "locale";
  if (!databaseUrl()) return json({ ok: true, database: "non configurato", protected: isProtected(), authorized: true, build });
  const authorized = isAuthorized(req);
  try {
    const query = getQuery()!;
    await ensureSchema(query);
    const rows = await query<{ n: string }>(`select count(*)::text as n from app_docs where not deleted`);
    return json({ ok: true, database: "ok", protected: isProtected(), authorized, docs: authorized ? Number(rows[0]?.n ?? 0) : undefined, build });
  } catch (e) {
    return json({ ok: false, database: "errore", detail: e instanceof Error ? e.message : String(e), protected: isProtected(), authorized, build }, 500);
  }
}
