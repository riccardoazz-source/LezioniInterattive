import { neon } from "@neondatabase/serverless";

/**
 * Connessione a Neon (Postgres serverless). Si attiva solo se esiste
 * DATABASE_URL: senza, le API rispondono 503 e l'app usa il salvataggio locale.
 */
export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export function dbUnavailable() {
  return Response.json(
    { error: "Database non configurato: imposta DATABASE_URL (vedi README)." },
    { status: 503 },
  );
}
