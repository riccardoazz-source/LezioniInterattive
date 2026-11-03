"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { SUBJECTS } from "@/content/subjects";
import type { SubjectId } from "@/content/types";
import { getNotesRepository, newPage, type Note, type NotePage, type Stroke } from "@/lib/storage";
import { compressImage } from "@/lib/image";
import { uid } from "@/lib/random";
import { useSettings } from "@/lib/settings";
import { speak, stopSpeaking } from "@/lib/speech";
import { Button } from "@/components/ui/Button";
import { DrawingBoard, DrawingCanvas } from "@/components/draw/DrawingCanvas";

function emptyNote(id: string): Note {
  const now = new Date().toISOString();
  return { id, title: "", subject: null, pages: [newPage(uid())], createdAt: now, updatedAt: now };
}

/**
 * Il quaderno: una nota con più pagine. Ogni pagina ha testo, foto e lavagna.
 * Modalità lettura (grande, con voce) e modalità modifica (matita in alto).
 */
export function NoteEditor({ id }: { id: string }) {
  const router = useRouter();
  const [settings] = useSettings();
  const [note, setNote] = useState<Note | null>(null);
  const [missing, setMissing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [pageIdx, setPageIdx] = useState(0);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [zoom, setZoom] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    getNotesRepository()
      .get(id)
      .then((n) => {
        if (cancelled) return;
        if (n) setNote(n);
        else if (new URLSearchParams(window.location.search).get("new") === "1") {
          setNote(emptyNote(id));
          setEditing(true);
        } else setMissing(true);
      })
      .catch(() => setMissing(true));
    return () => {
      cancelled = true;
      stopSpeaking();
    };
  }, [id]);

  const persist = useCallback((n: Note) => {
    setSaved("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      getNotesRepository()
        .save(n)
        .then(() => setSaved("saved"))
        .catch(() => setSaved("error"));
    }, 500);
  }, []);

  const patch = (p: Partial<Note>) => {
    if (!note) return;
    const n = { ...note, ...p, updatedAt: new Date().toISOString() };
    setNote(n);
    persist(n);
  };

  const patchPage = (p: Partial<NotePage>) => {
    if (!note) return;
    const pages = note.pages.map((pg, i) => (i === pageIdx ? { ...pg, ...p } : pg));
    patch({ pages });
  };

  const addPage = () => {
    if (!note) return;
    const pages = [...note.pages];
    pages.splice(pageIdx + 1, 0, newPage(uid()));
    patch({ pages });
    setPageIdx(pageIdx + 1);
  };

  const deletePage = () => {
    if (!note || note.pages.length <= 1 || !confirm("Eliminare questa pagina?")) return;
    const pages = note.pages.filter((_, i) => i !== pageIdx);
    patch({ pages });
    setPageIdx(Math.max(0, pageIdx - 1));
  };

  const removeNote = async () => {
    if (!note || !confirm("Eliminare tutto il quaderno?")) return;
    if (timer.current) clearTimeout(timer.current);
    await getNotesRepository().remove(note.id);
    router.replace("/note");
  };

  const addPhotos = async (files: FileList | null) => {
    if (!files || !note) return;
    const images = [...note.pages[pageIdx].images];
    for (const f of Array.from(files)) {
      try {
        images.push({ id: uid(), dataUrl: await compressImage(f) });
      } catch {
        alert("Non riesco a leggere questa immagine.");
      }
    }
    patchPage({ images });
  };

  if (missing) return <p className="p-8 text-center text-muted">Quaderno non trovato.</p>;
  if (!note) return <p className="p-8 text-center text-muted">Carico…</p>;

  const page = note.pages[Math.min(pageIdx, note.pages.length - 1)];
  const nav = (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        aria-label="Pagina precedente"
        disabled={pageIdx === 0}
        onClick={() => {
          stopSpeaking();
          setPageIdx(pageIdx - 1);
        }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow disabled:opacity-30"
      >
        ◀
      </button>
      <span className="min-w-28 text-center font-black">
        Pagina {pageIdx + 1} di {note.pages.length}
      </span>
      <button
        type="button"
        aria-label="Pagina successiva"
        disabled={pageIdx >= note.pages.length - 1}
        onClick={() => {
          stopSpeaking();
          setPageIdx(pageIdx + 1);
        }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow disabled:opacity-30"
      >
        ▶
      </button>
    </div>
  );

  const zoomView = zoom && (
    <button type="button" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setZoom(null)} aria-label="Chiudi">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={zoom} alt="" className="max-h-full max-w-full rounded-2xl object-contain" />
    </button>
  );

  // ---- Modalità lettura ----
  if (!editing) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 pb-8">
        {zoomView}
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-3xl font-black">{note.title || "Senza titolo"}</h2>
          <div className="flex shrink-0 gap-2">
            {page.text && (
              <button
                type="button"
                aria-label="Ascolta"
                onClick={() => speak(`${pageIdx === 0 ? note.title + ". " : ""}${page.text}`)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow"
              >
                🔊
              </button>
            )}
            <button
              type="button"
              aria-label="Modifica"
              onClick={() => setEditing(true)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow"
            >
              ✏️
            </button>
          </div>
        </div>
        {page.text && <p className="whitespace-pre-wrap text-xl leading-relaxed">{page.text}</p>}
        {page.images.length > 0 && (
          <div className={`grid gap-3 ${page.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
            {page.images.map((img) => (
              <button key={img.id} type="button" onClick={() => setZoom(img.dataUrl)} className="overflow-hidden rounded-2xl bg-white shadow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.dataUrl} alt={img.caption ?? ""} className="w-full object-cover" />
              </button>
            ))}
          </div>
        )}
        {page.drawing.length > 0 && (
          <DrawingCanvas strokes={page.drawing} onChange={() => {}} tool={{ color: "#000", width: 8, erase: false }} readOnly />
        )}
        {!page.text && page.images.length === 0 && page.drawing.length === 0 && (
          <p className="text-muted">Questa pagina è vuota.</p>
        )}
        {note.pages.length > 1 && <div className="mt-auto pt-4">{nav}</div>}
      </div>
    );
  }

  // ---- Modalità modifica ----
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3 px-4 pb-8">
      {zoomView}
      <input
        value={note.title}
        onChange={(e) => patch({ title: e.target.value })}
        placeholder="Titolo del quaderno"
        className="rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-2xl font-black outline-none focus:border-primary"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => patch({ subject: null })}
          className={`rounded-full px-3 py-1 text-sm font-bold ${note.subject === null ? "bg-foreground text-white" : "bg-white"}`}
        >
          Nessuna materia
        </button>
        {SUBJECTS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => patch({ subject: s.id as SubjectId })}
            className={`rounded-full px-3 py-1 text-sm font-bold ${note.subject === s.id ? "bg-foreground text-white" : s.color}`}
          >
            {s.emoji} {s.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/70 p-2">
        {nav}
        <div className="flex gap-2">
          <Button variant="secondary" size="md" onClick={addPage}>
            ＋ Pagina
          </Button>
          <Button variant="secondary" size="md" onClick={deletePage} disabled={note.pages.length <= 1}>
            ✕ Pagina
          </Button>
        </div>
      </div>

      <textarea
        key={page.id}
        value={page.text}
        onChange={(e) => patchPage({ text: e.target.value })}
        placeholder="Scrivi qui la lezione di questa pagina…"
        rows={6}
        className="rounded-2xl border-2 border-gray-200 bg-white p-4 text-lg leading-relaxed outline-none focus:border-primary"
      />

      <div className="flex flex-col gap-2 rounded-2xl bg-white/70 p-3">
        <div className="flex items-center justify-between">
          <span className="font-black">📷 Foto</span>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              addPhotos(e.target.files);
              e.target.value = "";
            }}
          />
          <Button variant="secondary" size="md" onClick={() => fileInput.current?.click()}>
            ＋ Aggiungi foto
          </Button>
        </div>
        {page.images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {page.images.map((img) => (
              <div key={img.id} className="relative overflow-hidden rounded-xl bg-white shadow">
                <button type="button" onClick={() => setZoom(img.dataUrl)} className="block w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.dataUrl} alt="" className="aspect-square w-full object-cover" />
                </button>
                <button
                  type="button"
                  aria-label="Rimuovi foto"
                  onClick={() => patchPage({ images: page.images.filter((x) => x.id !== img.id) })}
                  className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sm shadow"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white/70 p-3">
        <span className="font-black">🖊️ Lavagna</span>
        <DrawingBoard
          key={page.id}
          strokes={page.drawing}
          onChange={(drawing: Stroke[]) => patchPage({ drawing })}
          fingerAllowed={settings.fingerDraw}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted">
          {saved === "saving" ? "Salvo…" : saved === "saved" ? "✓ Salvato" : saved === "error" ? "⚠️ Errore di salvataggio" : ""}
        </span>
        <div className="flex gap-2">
          <Button variant="danger" size="md" onClick={removeNote}>
            🗑️ Elimina quaderno
          </Button>
          <Button size="md" onClick={() => setEditing(false)}>
            ✓ Fine
          </Button>
        </div>
      </div>
    </div>
  );
}
