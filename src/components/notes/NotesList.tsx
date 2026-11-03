"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SUBJECT_MAP } from "@/content/subjects";
import { getNotesRepository, type Note } from "@/lib/storage";
import { useParentGate } from "@/lib/parent-gate";
import { uid } from "@/lib/random";
import { Button } from "@/components/ui/Button";
import { DrawingPreview } from "@/components/draw/DrawingCanvas";
import { useRouter } from "next/navigation";

export function NotesList() {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { unlocked, ready } = useParentGate();
  const router = useRouter();

  useEffect(() => {
    getNotesRepository()
      .list()
      .then(setNotes)
      .catch((e: Error) => setError(e.message));
  }, []);

  const create = () => {
    router.push(`/note/${uid()}?new=1`);
  };

  if (error) return <p className="p-8 text-center font-bold text-danger">Errore: {error}</p>;
  if (!notes || !ready) return <p className="p-8 text-center text-muted">Carico le note…</p>;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 pb-8">
      <div className="flex items-center justify-between">
        <p className="text-muted">
          {notes.length === 0 ? "Nessuna nota ancora." : `${notes.length} ${notes.length === 1 ? "nota" : "note"}`}
        </p>
        <Button size="md" onClick={create}>
          ＋ Nuova nota
        </Button>
      </div>
      {!unlocked && notes.length > 0 && (
        <p className="text-sm text-muted">Le note si possono leggere; per modificarle serve l&apos;area genitori.</p>
      )}
      {notes.map((n) => {
        const s = n.subject ? SUBJECT_MAP[n.subject] : null;
        return (
          <Link
            key={n.id}
            href={`/note/${n.id}`}
            className={`no-select flex items-center gap-4 rounded-3xl ${s?.color ?? "bg-white"} p-4 shadow-md transition active:scale-[0.98]`}
          >
            <span className="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-3xl shadow-sm">
              {n.drawing.length > 0 ? <DrawingPreview strokes={n.drawing} className="h-full w-full" /> : (s?.emoji ?? "📝")}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-xl font-black">{n.title || "Senza titolo"}</span>
              <span className="line-clamp-2 text-sm text-muted">{n.body || "(solo disegno)"}</span>
              <span className="mt-1 text-xs font-semibold text-muted">
                {s ? `${s.emoji} ${s.name} · ` : ""}
                {new Date(n.updatedAt).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </span>
          </Link>
        );
      })}
      {notes.length === 0 && (
        <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
          <div className="text-5xl">📝</div>
          <p className="mt-2 font-bold">Qui scrivi le tue lezioni.</p>
          <p className="text-sm text-muted">Testo, più una lavagna per disegnare e scrivere con Apple Pencil. La bambina potrà rileggerle quando vuole.</p>
        </div>
      )}
    </div>
  );
}
