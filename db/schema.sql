-- Schema per Neon (Postgres). Eseguilo una volta nella SQL Editor di Neon.

create table if not exists notes (
  id          text primary key,
  title       text not null default '',
  subject     text,
  body        text not null default '',
  drawing     jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists notes_updated_at_idx on notes (updated_at desc);

-- Pronto per il futuro: progressi sincronizzati tra dispositivi.
create table if not exists progress (
  kind        text not null,            -- 'lesson' | 'game'
  item_id     text not null,
  stars       int  not null default 0,
  best        int  not null default 0,
  times       int  not null default 0,
  updated_at  timestamptz not null default now(),
  primary key (kind, item_id)
);
