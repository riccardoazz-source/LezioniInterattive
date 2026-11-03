"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SUBJECT_MAP } from "@/content/subjects";
import { getNotesRepository, noteText, type Note } from "@/lib/storage";
import { uid } from "@/lib/random";
import { Button } from "@/components/ui/Button";
import { DrawingPreview } from "@/components/draw/DrawingCanvas";

export function NotesList() {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    getNotesRepository()
      .list()
      .then(setNotes)
      .catch((e: Error) => setError(e.message));
  }, []);

  const create = () => router.push(`/note/${uid()}?new=1`);

  const remove = async (n: Note) => {
    if (!confirm(`Eliminare il quaderno «${n.title || "Senza titolo"}»?`)) return;
    await getNotesRepository().remove(n.id);
    setNotes((list) => (list ? list.filter((x) => x.id !== n.id) : list));
  };

  if (error) return <p className="p-8 text-center font-bold text-danger">Errore: {error}</p>;
  if (!notes) return <p className="p-8 text-center text-muted">Carico le note…</p>;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 pb-8">
      <div className="flex items-center justify-between">
        <p className="text-muted">
          {notes.length === 0 ? "Nessun quaderno ancora." : `${notes.length} ${notes.length === 1 ? "quaderno" : "quaderni"}`}
        </p>
        <Button size="md" onClick={create}>
          ＋ Nuovo quaderno
        </Button>
      </div>
      {notes.map((n) => {
        const s = n.subject ? SUBJECT_MAP[n.subject] : null;
        const firstDrawing = n.pages.find((p) => p.drawing.length > 0)?.drawing;
        const firstImage = n.pages.find((p) => p.images.length > 0)?.images[0];
        const text = noteText(n);
        return (
          <div key={n.id} className={`flex items-center gap-3 rounded-3xl ${s?.color ?? "bg-white"} p-3 shadow-md`}>
            <Link href={`/note/${n.id}`} className="no-select flex min-w-0 flex-1 items-center gap-4 active:scale-[0.98]">
              <span className="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-3xl shadow-sm">
                {firstImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={firstImage.dataUrl} alt="" className="h-full w-full object-cover" />
                ) : firstDrawing ? (
                  <DrawingPreview strokes={firstDrawing} className="h-full w-full" />
                ) : (
                  (s?.emoji ?? "📓")
                )}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-xl font-black">{n.title || "Senza titolo"}</span>
                <span className="line-clamp-2 text-sm text-muted">{text || "(solo disegni o foto)"}</span>
                <span className="mt-1 text-xs font-semibold text-muted">
                  {s ? `${s.emoji} ${s.name} · ` : ""}
                  {n.pages.length} {n.pages.length === 1 ? "pagina" : "pagine"} ·{" "}
                  {new Date(n.updatedAt).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </span>
            </Link>
            <button
              type="button"
              aria-label="Elimina"
              onClick={() => remove(n)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-xl shadow-sm active:scale-90"
            >
              🗑️
            </button>
          </div>
        );
      })}
      {notes.length === 0 && (
        <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
          <div className="text-5xl">📓</div>
          <p className="mt-2 font-bold">Qui ci sono i quaderni delle lezioni di casa.</p>
          <p className="text-sm text-muted">
            Ogni quaderno ha più pagine: testo, foto e una lavagna per scrivere e disegnare con Apple Pencil. Si possono rileggere e ascoltare quando si vuole.
          </p>
        </div>
      )}
    </div>
  );
}
