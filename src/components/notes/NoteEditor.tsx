"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { SUBJECTS } from "@/content/subjects";
import type { SubjectId } from "@/content/types";
import { getNotesRepository, type Note, type Stroke } from "@/lib/storage";
import { useParentGate } from "@/lib/parent-gate";
import { useSettings } from "@/lib/settings";
import { speak, stopSpeaking } from "@/lib/speech";
import { Button } from "@/components/ui/Button";
import { ParentGate } from "@/components/ui/ParentGate";
import { DrawingBoard, DrawingCanvas } from "@/components/draw/DrawingCanvas";

type Tab = "testo" | "lavagna";

function emptyNote(id: string): Note {
  const now = new Date().toISOString();
  return { id, title: "", subject: null, body: "", drawing: [], createdAt: now, updatedAt: now };
}

export function NoteEditor({ id }: { id: string }) {
  const router = useRouter();
  const [settings] = useSettings();
  const { ready, lock } = useParentGate();
  const [note, setNote] = useState<Note | null>(null);
  const [missing, setMissing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<Tab>("testo");
  const [saved, setSaved] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    getNotesRepository()
      .get(id)
      .then((n) => {
        if (cancelled) return;
        if (n) setNote(n);
        else {
          const isNew = new URLSearchParams(window.location.search).get("new") === "1";
          if (isNew) {
            setNote(emptyNote(id));
            setEditing(true);
          } else setMissing(true);
        }
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

  const remove = async () => {
    if (!note || !confirm("Eliminare questa nota?")) return;
    await getNotesRepository().remove(note.id);
    router.replace("/note");
  };

  if (missing) return <p className="p-8 text-center text-muted">Nota non trovata.</p>;
  if (!note || !ready) return <p className="p-8 text-center text-muted">Carico…</p>;

  // ---- Modalità lettura (per la bambina) ----
  if (!editing) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 pb-8">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-3xl font-black">{note.title || "Senza titolo"}</h2>
          <div className="flex gap-2">
            {note.body && (
              <button
                type="button"
                aria-label="Ascolta"
                onClick={() => speak(`${note.title}. ${note.body}`)}
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
        {note.body && <p className="whitespace-pre-wrap text-xl leading-relaxed">{note.body}</p>}
        {note.drawing.length > 0 && (
          <ReadOnlyBoard strokes={note.drawing} />
        )}
        {!note.body && note.drawing.length === 0 && <p className="text-muted">Questa nota è vuota.</p>}
      </div>
    );
  }

  // ---- Modalità modifica (genitore) ----
  return (
    <ParentGate>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3 px-4 pb-8">
        <input
          value={note.title}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder="Titolo della lezione"
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

        <div className="flex gap-2">
          {(["testo", "lavagna"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 rounded-2xl py-3 text-lg font-black ${tab === t ? "bg-primary text-white" : "bg-white"}`}
            >
              {t === "testo" ? "📝 Testo" : "🖊️ Lavagna"}
            </button>
          ))}
        </div>

        {tab === "testo" ? (
          <textarea
            value={note.body}
            onChange={(e) => patch({ body: e.target.value })}
            placeholder="Scrivi qui la lezione. Ogni riga a capo viene mantenuta."
            rows={12}
            className="min-h-64 flex-1 rounded-2xl border-2 border-gray-200 bg-white p-4 text-lg leading-relaxed outline-none focus:border-primary"
          />
        ) : (
          <DrawingBoard
            strokes={note.drawing}
            onChange={(drawing: Stroke[]) => patch({ drawing })}
            fingerAllowed={settings.fingerDraw}
          />
        )}

        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted">
            {saved === "saving" ? "Salvo…" : saved === "saved" ? "✓ Salvato" : saved === "error" ? "⚠️ Errore di salvataggio" : ""}
          </span>
          <div className="flex gap-2">
            <Button variant="danger" size="md" onClick={remove}>
              🗑️ Elimina
            </Button>
            <Button
              size="md"
              onClick={() => {
                setEditing(false);
                lock();
              }}
            >
              ✓ Fine
            </Button>
          </div>
        </div>
      </div>
    </ParentGate>
  );
}

function ReadOnlyBoard({ strokes }: { strokes: Stroke[] }) {
  return (
    <DrawingCanvas
      strokes={strokes}
      onChange={() => {}}
      tool={{ color: "#000", width: 8, erase: false }}
      readOnly
    />
  );
}
