import "server-only";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";

/**
 * Database: Neon (via HTTP) oppure qualsiasi Postgres (via pg).
 * L'indirizzo si legge da DATABASE_URL, oppure POSTGRES_URL (Vercel/Neon
 * lo impostano automaticamente con l'integrazione).
 */
export type Query = <T = Record<string, unknown>>(text: string, params?: unknown[]) => Promise<T[]>;

export function databaseUrl(): string | null {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL || null;
}

let cached: { url: string; query: Query } | null = null;

export function getQuery(): Query | null {
  const url = databaseUrl();
  if (!url) return null;
  if (cached?.url === url) return cached.query;
  let query: Query;
  if (/neon\.tech/i.test(url)) {
    const sql = neon(url);
    query = async (text, params = []) => (await sql(text, params)) as never;
  } else {
    const pool = new Pool({ connectionString: url, max: 3 });
    query = async (text, params = []) => (await pool.query(text, params)).rows as never;
  }
  cached = { url, query };
  return query;
}

let schemaReady: Promise<void> | null = null;

/** Crea le tabelle se mancano (nessun SQL da lanciare a mano). */
export function ensureSchema(query: Query): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await query(`create sequence if not exists app_docs_seq`);
      await query(`create table if not exists app_docs (
        collection text not null,
        id text not null,
        data jsonb,
        updated_at timestamptz not null,
        deleted boolean not null default false,
        seq bigint not null default nextval('app_docs_seq'),
        primary key (collection, id)
      )`);
      await query(`create index if not exists app_docs_seq_idx on app_docs (seq)`);
      await query(`create table if not exists app_blobs (
        id text primary key,
        content_type text not null,
        data bytea not null,
        created_at timestamptz not null default now()
      )`);
      // Importa le note della prima versione (tabella "notes"), se esiste.
      try {
        const old = await query<{ exists: boolean }>(`select to_regclass('public.notes') is not null as exists`);
        if (old[0]?.exists) {
          await query(`insert into app_docs (collection, id, data, updated_at)
            select 'notes', n.id,
              jsonb_build_object('id', n.id, 'title', n.title, 'subject', n.subject,
                'createdAt', n.created_at, 'updatedAt', n.updated_at)
              || (to_jsonb(n) - 'id' - 'title' - 'subject' - 'created_at' - 'updated_at'),
              n.updated_at
            from notes n
            on conflict do nothing`);
        }
      } catch {
        /* nessuna vecchia tabella da importare */
      }
    })().catch((e) => {
      schemaReady = null;
      throw e;
    });
  }
  return schemaReady;
}

/**
 * Protezione facoltativa: se su Vercel è impostato FAMILY_CODE, ogni richiesta
 * deve portare lo stesso codice (cookie "li_family" o header "x-family-code").
 */
export function isAuthorized(req: Request): boolean {
  const code = process.env.FAMILY_CODE;
  if (!code) return true;
  const header = req.headers.get("x-family-code");
  if (header && header === code) return true;
  const cookie = req.headers.get("cookie") ?? "";
  const m = cookie.match(/(?:^|;\s*)li_family=([^;]+)/);
  return !!m && decodeURIComponent(m[1]) === code;
}

export function isProtected(): boolean {
  return !!process.env.FAMILY_CODE;
}

export const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "cache-control": "no-store" } });

export function guard(req: Request): { query: Query } | Response {
  const query = getQuery();
  if (!query) return json({ error: "Database non configurato: manca DATABASE_URL." }, 503);
  if (!isAuthorized(req)) return json({ error: "Codice famiglia mancante o sbagliato." }, 401);
  return { query };
}
