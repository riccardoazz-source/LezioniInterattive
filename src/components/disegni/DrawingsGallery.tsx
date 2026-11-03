"use client";

import { useConfirmDelete } from "@/components/ui/ConfirmDelete";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { COLORING_MAP } from "@/content/coloring";
import { listDrawings, removeDrawing, type SavedDrawing } from "@/lib/storage/drawings";
import { uid } from "@/lib/random";
import { Tile } from "@/components/ui/Tile";
import { PAGE_H, PAGE_W } from "@/lib/storage";
import { ColoringSvg } from "@/components/draw/ColoringBoard";

export function DrawingsHome() {
  const router = useRouter();
  const [drawings, setDrawings] = useState<SavedDrawing[] | null>(null);
  const [confirmDelete, deleteDialog] = useConfirmDelete();

  useEffect(() => {
    listDrawings().then(setDrawings);
  }, []);

  const remove = async (d: SavedDrawing) => {
    if (!(await confirmDelete("Eliminare questo disegno?"))) return;
    await removeDrawing(d.id);
    setDrawings((list) => list?.filter((x) => x.id !== d.id) ?? null);
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-8">
      {deleteDialog}
      <div className="grid grid-cols-2 gap-4">
        <button type="button" onClick={() => router.push(`/disegni/libero/${uid()}`)} className="no-select text-left">
          <div className="flex min-h-44 flex-col items-center justify-center gap-2 rounded-[var(--radius-bubble)] bg-sky-100 p-5 text-center shadow-md transition active:scale-95">
            <span className="text-7xl">🖌️</span>
            <span className="text-2xl font-black">Disegno libero</span>
            <span className="text-sm font-semibold text-muted">Foglio bianco e Apple Pencil</span>
          </div>
        </button>
        <Tile href="/disegni/colora" emoji="🖍️" title="Da colorare" subtitle="Scegli un disegno" colorClass="bg-amber-100" size="lg" />
      </div>

      <section>
        <h2 className="mb-2 text-lg font-black">🖼️ I miei disegni</h2>
        {drawings === null ? (
          <p className="text-muted">Carico…</p>
        ) : drawings.length === 0 ? (
          <p className="rounded-3xl bg-white p-6 text-center text-muted shadow-sm">Nessun disegno ancora. Inizia da un foglio bianco o da un disegno da colorare!</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {drawings.map((d) => {
              const page = d.kind === "coloring" && d.pageId ? COLORING_MAP[d.pageId] : null;
              const href = d.kind === "image" && d.pageId ? `/disegni/colora/immagine/${d.pageId}` : page ? `/disegni/colora/${page.id}` : `/disegni/libero/${d.id}`;
              return (
                <div key={d.id} className="relative overflow-hidden rounded-3xl bg-white shadow-md">
                  <Link href={href} className="block">
                    <div className="flex aspect-[10/7] w-full items-center justify-center bg-gray-100">
                      {d.kind === "image" ? (
                        d.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={d.thumbnail} alt="" className="h-full w-full object-contain bg-white" />
                        ) : (
                          <span className="text-4xl">🖍️</span>
                        )
                      ) : page ? (
                        <ColoringSvg page={page} fills={d.fills} strokes={d.strokes} className="h-full w-full bg-white" />
                      ) : (
                        <svg viewBox={`0 0 ${PAGE_W} ${PAGE_H}`} className="h-full bg-white shadow" aria-hidden>
                          {d.strokes.map((st, i) => (
                            <polyline key={i} points={st.points.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={st.erase ? "#fff" : st.color} strokeWidth={(st.erase ? st.width * 3 : st.width) * 2} strokeLinecap="round" strokeLinejoin="round" />
                          ))}
                        </svg>
                      )}
                    </div>
                    <div className="truncate px-3 py-2 text-sm font-bold">{d.title || (page ? page.title : "Disegno")}</div>
                  </Link>
                  <button
                    type="button"
                    aria-label="Elimina"
                    onClick={() => remove(d)}
                    className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-base shadow"
                  >
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
