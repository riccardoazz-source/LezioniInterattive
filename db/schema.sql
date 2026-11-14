-- Non serve più lanciare questo file: le tabelle vengono create
-- automaticamente dall'app al primo collegamento (src/lib/db.ts).
-- Resta qui come documentazione.

create sequence if not exists app_docs_seq;

-- Tutti i dati sincronizzati: quaderni, disegni, disegni importati,
-- impostazioni, stelle e palette (collection = notes | drawings | pages | kv).
create table if not exists app_docs (
  collection text not null,
  id         text not null,
  data       jsonb,
  updated_at timestamptz not null,
  deleted    boolean not null default false,
  seq        bigint not null default nextval('app_docs_seq'),
  primary key (collection, id)
);
create index if not exists app_docs_seq_idx on app_docs (seq);

-- Foto dei quaderni e disegni importati (salvati una volta sola).
create table if not exists app_blobs (
  id           text primary key,
  content_type text not null,
  data         bytea not null,
  created_at   timestamptz not null default now()
);
