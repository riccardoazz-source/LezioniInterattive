"use client";

import { useConfirmDelete } from "@/components/ui/ConfirmDelete";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { SUBJECTS } from "@/content/subjects";
import type { SubjectId } from "@/content/types";
import { getNotesRepository, newPage, type Note, type NoteImage, type NotePage, type Stroke } from "@/lib/storage";
import { compressImage } from "@/lib/image";
import { uid } from "@/lib/random";
import { useSettings } from "@/lib/settings";
import { speak, stopSpeaking } from "@/lib/speech";
import { BRUSHES, PEN_COLORS, PEN_WIDTHS, type Tool } from "@/components/draw/DrawingCanvas";
import { NotebookSheet, type SheetMode } from "./NotebookSheet";

function emptyNote(id: string): Note {
  const now = new Date().toISOString();
  return { id, title: "", subject: null, pages: [newPage(uid())], createdAt: now, updatedAt: now };
}

/**
 * Il quaderno: fogli a righe a tutta pagina. Si scrive direttamente sul
 * foglio con la Pencil o con la tastiera, si mettono foto, si sfogliano le
 * pagine con le frecce (o con due dita ai lati).
 */
export function NoteEditor({ id }: { id: string }) {
  const router = useRouter();
  const [settings] = useSettings();
  const [note, setNote] = useState<Note | null>(null);
  const [missing, setMissing] = useState(false);
  const [pageIdx, setPageIdx] = useState(0);
  const [mode, setMode] = useState<SheetMode>("pen");
  const [tool, setTool] = useState<Tool>({ color: "#1b2a4a", width: PEN_WIDTHS[0], erase: false });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showTitle, setShowTitle] = useState(false);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [maxHeight, setMaxHeight] = useState(800);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [confirmDelete, deleteDialog] = useConfirmDelete();

  useEffect(() => {
    let cancelled = false;
    getNotesRepository()
      .get(id)
      .then((n) => {
        if (cancelled) return;
        if (n) setNote(n);
        else if (new URLSearchParams(window.location.search).get("new") === "1") {
          setNote(emptyNote(id));
          setShowTitle(true);
        } else setMissing(true);
      })
      .catch(() => setMissing(true));
    return () => {
      cancelled = true;
      stopSpeaking();
    };
  }, [id]);

  // Altezza disponibile per il foglio: schermo meno header e barre.
  useEffect(() => {
    const calc = () => setMaxHeight(Math.max(420, window.innerHeight - 230));
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

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
    patch({ pages: note.pages.map((pg, i) => (i === pageIdx ? { ...pg, ...p } : pg)) });
  };

  const goTo = (i: number) => {
    stopSpeaking();
    setSelectedImage(null);
    setPageIdx(i);
  };
  const addPage = () => {
    if (!note) return;
    const pages = [...note.pages];
    pages.splice(pageIdx + 1, 0, newPage(uid()));
    patch({ pages });
    goTo(pageIdx + 1);
  };
  const deletePage = async () => {
    if (!note || note.pages.length <= 1 || !(await confirmDelete("Eliminare questa pagina?"))) return;
    patch({ pages: note.pages.filter((_, i) => i !== pageIdx) });
    goTo(Math.max(0, pageIdx - 1));
  };
  const removeNote = async () => {
    if (!note || !(await confirmDelete("Eliminare tutto il quaderno?"))) return;
    if (timer.current) clearTimeout(timer.current);
    await getNotesRepository().remove(note.id);
    router.replace("/note");
  };

  const addPhotos = async (files: FileList | null) => {
    if (!files || !note) return;
    const images = [...note.pages[pageIdx].images];
    let i = 0;
    for (const f of Array.from(files)) {
      try {
        images.push({ id: uid(), dataUrl: await compressImage(f), x: 150 + i * 40, y: 120 + i * 40, w: 700 });
        i++;
      } catch {
        alert("Non riesco a leggere questa immagine.");
      }
    }
    patchPage({ images });
    setMode("photo");
    setSelectedImage(images[images.length - 1]?.id ?? null);
  };

  const resizeImage = (factor: number) => {
    if (!note || !selectedImage) return;
    patchPage({
      images: note.pages[pageIdx].images.map((im) =>
        im.id === selectedImage ? { ...im, w: Math.round(Math.max(150, Math.min(1000, im.w * factor))) } : im,
      ),
    });
  };
  const removeImage = () => {
    if (!note || !selectedImage) return;
    patchPage({ images: note.pages[pageIdx].images.filter((im) => im.id !== selectedImage) });
    setSelectedImage(null);
  };

  if (missing) return <p className="p-8 text-center text-muted">Quaderno non trovato.</p>;
  if (!note) return <p className="p-8 text-center text-muted">Carico…</p>;

  const page = note.pages[Math.min(pageIdx, note.pages.length - 1)];
  const modeBtn = (m: SheetMode, label: string) => (
    <button
      type="button"
      onClick={() => {
        setMode(m);
        if (m !== "photo") setSelectedImage(null);
      }}
      className={`rounded-full px-3 py-2 text-sm font-black shadow ${mode === m ? "bg-foreground text-white" : "bg-white"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-2 px-2 pb-3 sm:px-4">
      {deleteDialog}
      {/* Titolo e materia (compatti, si aprono con un tocco) */}
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setShowTitle((v) => !v)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          <span className="truncate text-xl font-black">{note.title || "Senza titolo"}</span>
          {note.subject && <span className="shrink-0 text-sm font-bold text-muted">{SUBJECTS.find((s) => s.id === note.subject)?.emoji}</span>}
          <span className="text-sm text-muted">▾</span>
        </button>
        <span className="text-xs text-muted">{saved === "saving" ? "Salvo…" : saved === "saved" ? "✓ Salvato" : saved === "error" ? "⚠️ Non salvato" : ""}</span>
        {page.text && <IconBtn label="🔊" aria="Leggi la pagina" onClick={() => speak(`${pageIdx === 0 ? note.title + ". " : ""}${page.text}`)} />}
      </div>
      {showTitle && (
        <div className="flex flex-col gap-2 rounded-2xl bg-white p-3 shadow">
          <input
            value={note.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="Titolo del quaderno"
            autoFocus
            className="rounded-xl border-2 border-gray-200 px-3 py-2 text-lg font-black outline-none focus:border-primary"
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => patch({ subject: null })} className={`rounded-full px-3 py-1 text-sm font-bold ${note.subject === null ? "bg-foreground text-white" : "bg-gray-100"}`}>
              Nessuna materia
            </button>
            {SUBJECTS.map((s) => (
              <button key={s.id} type="button" onClick={() => patch({ subject: s.id as SubjectId })} className={`rounded-full px-3 py-1 text-sm font-bold ${note.subject === s.id ? "bg-foreground text-white" : s.color}`}>
                {s.emoji} {s.name}
              </button>
            ))}
          </div>
          <div className="flex justify-between">
            <button type="button" onClick={removeNote} className="rounded-full bg-danger px-3 py-1 text-sm font-bold text-white">
              🗑️ Elimina quaderno
            </button>
            <button type="button" onClick={() => setShowTitle(false)} className="rounded-full bg-primary px-4 py-1 text-sm font-bold text-white">
              Chiudi
            </button>
          </div>
        </div>
      )}

      {/* Barra strumenti */}
      <div className="no-select flex flex-wrap items-center justify-center gap-1.5 rounded-2xl bg-white/70 p-2">
        {modeBtn("pen", "✍️ Penna")}
        {modeBtn("text", "⌨️ Testo")}
        {modeBtn("photo", "📷 Foto")}
        <span className="mx-1 h-8 w-px bg-gray-300" />
        {mode === "pen" && (
          <>
            {BRUSHES.map((b) => (
              <IconBtn key={b.kind} label={b.emoji} aria={b.name} active={!tool.erase && (tool.kind ?? "pen") === b.kind} onClick={() => setTool({ ...tool, kind: b.kind, erase: false })} />
            ))}
            <span className="mx-1 h-8 w-px bg-gray-300" />
            {[{ name: "Blu penna", value: "#1b2a4a" }, ...PEN_COLORS.filter((c) => c.value !== "#2b2d42")].map((c) => (
              <button
                key={c.value}
                type="button"
                aria-label={c.name}
                onClick={() => setTool({ ...tool, color: c.value, erase: false })}
                className={`h-9 w-9 rounded-full border-4 ${!tool.erase && tool.color === c.value ? "scale-110 border-foreground" : "border-white"}`}
                style={{ background: c.value, boxShadow: "0 1px 3px rgba(0,0,0,.25)" }}
              />
            ))}
            {PEN_WIDTHS.map((w) => (
              <IconBtn key={w} aria={`Spessore ${w}`} active={tool.width === w} onClick={() => setTool({ ...tool, width: w })}>
                <span className="rounded-full bg-foreground" style={{ width: w + 4, height: w + 4 }} />
              </IconBtn>
            ))}
            <IconBtn label="🧽" aria="Gomma" active={tool.erase} onClick={() => setTool({ ...tool, erase: !tool.erase })} />
            <IconBtn label="↩️" aria="Annulla" disabled={page.drawing.length === 0} onClick={() => patchPage({ drawing: page.drawing.slice(0, -1) })} />
          </>
        )}
        {mode === "photo" && (
          <>
            <input ref={fileInput} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
            <IconBtn label="＋ Aggiungi foto" onClick={() => fileInput.current?.click()} />
            {selectedImage && (
              <>
                <IconBtn label="➖" aria="Rimpicciolisci" onClick={() => resizeImage(0.8)} />
                <IconBtn label="➕" aria="Ingrandisci" onClick={() => resizeImage(1.25)} />
                <IconBtn label="🗑️" aria="Rimuovi foto" onClick={removeImage} />
              </>
            )}
            {!selectedImage && page.images.length > 0 && <span className="text-xs text-muted">Tocca una foto per spostarla</span>}
          </>
        )}
        {mode === "text" && <span className="text-xs text-muted">Tocca il foglio e scrivi con la tastiera</span>}
      </div>

      {/* Il foglio */}
      <NotebookSheet
        key={page.id}
        page={page}
        mode={mode}
        tool={tool}
        fingerAllowed={settings.fingerDraw}
        onStrokes={(drawing: Stroke[]) => patchPage({ drawing })}
        onText={(text) => patchPage({ text })}
        onImages={(images: NoteImage[]) => patchPage({ images })}
        selectedImage={selectedImage}
        onSelectImage={setSelectedImage}
        maxHeight={maxHeight}
      />

      {/* Sfoglia pagine */}
      <div className="no-select flex items-center justify-center gap-2">
        <button type="button" aria-label="Pagina precedente" disabled={pageIdx === 0} onClick={() => goTo(pageIdx - 1)} className="flex h-12 w-14 items-center justify-center rounded-full bg-white text-2xl shadow disabled:opacity-30">
          ◀
        </button>
        <span className="min-w-28 text-center font-black">
          Pagina {pageIdx + 1} di {note.pages.length}
        </span>
        <button type="button" aria-label="Pagina successiva" disabled={pageIdx >= note.pages.length - 1} onClick={() => goTo(pageIdx + 1)} className="flex h-12 w-14 items-center justify-center rounded-full bg-white text-2xl shadow disabled:opacity-30">
          ▶
        </button>
        <span className="mx-1 h-8 w-px bg-gray-300" />
        <IconBtn label="＋ Pagina" aria="Aggiungi pagina" onClick={addPage} />
        <IconBtn label="✕ Pagina" aria="Elimina pagina" disabled={note.pages.length <= 1} onClick={deletePage} />
      </div>
    </div>
  );
}

export function IconBtn({ label, aria, onClick, active, disabled, children }: { label?: string; aria?: string; onClick: () => void; active?: boolean; disabled?: boolean; children?: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={aria ?? label}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-10 min-w-10 items-center justify-center rounded-full bg-white px-2 text-lg shadow disabled:opacity-30 ${active ? "ring-4 ring-primary" : ""}`}
    >
      {children ?? label}
    </button>
  );
}
