"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { COLORING_CATEGORIES, COLORING_PAGES } from "@/content/coloring";
import { listDrawings, type SavedDrawing } from "@/lib/storage/drawings";
import { ColoringSvg } from "@/components/draw/ColoringBoard";

export function ColoringCatalog() {
  const [saved, setSaved] = useState<Record<string, SavedDrawing>>({});
  useEffect(() => {
    listDrawings().then((all) => {
      const map: Record<string, SavedDrawing> = {};
      for (const d of all) if (d.kind === "coloring" && d.pageId) map[d.pageId] = d;
      setSaved(map);
    });
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-8">
      {COLORING_CATEGORIES.map((cat) => (
        <section key={cat.id}>
          <h2 className="mb-2 text-lg font-black">
            {cat.emoji} {cat.name}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {COLORING_PAGES.filter((p) => p.category === cat.id).map((p) => {
              const s = saved[p.id];
              return (
                <Link key={p.id} href={`/disegni/colora/${p.id}`} className={`no-select overflow-hidden rounded-3xl ${cat.color} shadow-md transition active:scale-95`}>
                  <div className="m-2 aspect-[10/7] overflow-hidden rounded-2xl bg-white">
                    <ColoringSvg page={p} fills={s?.fills ?? {}} strokes={s?.strokes} className="h-full w-full" />
                  </div>
                  <div className="flex items-center justify-between px-3 pb-2">
                    <span className="font-black">
                      {p.emoji} {p.title}
                    </span>
                    {s && Object.keys(s.fills).length > 0 && <span className="text-xs font-bold text-muted">iniziato</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
