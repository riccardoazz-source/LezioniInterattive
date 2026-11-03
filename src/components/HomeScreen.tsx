"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Tile } from "@/components/ui/Tile";
import { useSettings } from "@/lib/settings";
import { totalStars, useProgress } from "@/lib/progress";
import { warmUpVoices } from "@/lib/speech";

export function HomeScreen() {
  const [settings, , ready] = useSettings();
  const [progress] = useProgress();
  useEffect(() => warmUpVoices(), []);
  const stars = totalStars(progress);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-8" style={{ paddingTop: "max(1.5rem, env(safe-area-inset-top))" }}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-black">
            Ciao{ready && settings.name ? `, ${settings.name}` : ""}! 👋
          </h1>
          <p className="mt-1 text-lg font-semibold text-muted">Cosa vuoi fare oggi?</p>
        </div>
        <Link
          href="/impostazioni"
          aria-label="Impostazioni"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm active:scale-95"
        >
          ⚙️
        </Link>
      </div>

      {stars > 0 && (
        <div className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 font-bold shadow-sm">
          ⭐ {stars} {stars === 1 ? "stella" : "stelle"} conquistate
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4">
        <Tile href="/impara" emoji="📚" title="Impara" subtitle="Le lezioni" colorClass="bg-sky-100" size="lg" />
        <Tile href="/gioca" emoji="🎮" title="Gioca" subtitle="I giochi" colorClass="bg-amber-100" size="lg" />
        <Tile href="/disegni" emoji="🎨" title="Disegni" subtitle="Disegna e colora" colorClass="bg-emerald-100" size="lg" />
        <Tile href="/note" emoji="📓" title="Note" subtitle="I quaderni di casa" colorClass="bg-pink-100" size="lg" />
      </div>
    </main>
  );
}
