"use client";

import { LEVELS } from "@/content/subjects";
import type { Level } from "@/content/types";
import { useSettings } from "@/lib/settings";
import { resetProgress } from "@/lib/progress";
import { speak } from "@/lib/speech";
import { storageBackendName } from "@/lib/storage";
import { ParentGate } from "@/components/ui/ParentGate";
import { Button } from "@/components/ui/Button";

export function SettingsForm() {
  const [settings, update, ready] = useSettings();
  if (!ready) return null;
  return (
    <ParentGate>
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 pb-8">
        <label className="flex flex-col gap-2">
          <span className="font-black">Nome della bambina</span>
          <input
            value={settings.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="Es. Sofia"
            className="rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-xl font-bold outline-none focus:border-primary"
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="font-black">Livello (classe)</span>
          <div className="grid grid-cols-5 gap-2">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => update({ level: l.value as Level })}
                className={`flex flex-col items-center rounded-2xl p-3 font-bold shadow-sm ${
                  settings.level === l.value ? "bg-primary text-white" : "bg-white"
                }`}
              >
                <span>{l.label}</span>
                <span className="text-xs opacity-80">{l.age}</span>
              </button>
            ))}
          </div>
          <p className="text-sm text-muted">
            L&apos;app mostra le lezioni del livello scelto e di quelli precedenti. I giochi diventano più difficili.
          </p>
        </div>

        <Toggle
          label="Lettura ad alta voce"
          hint="Legge domande e parole con la voce del dispositivo"
          value={settings.tts}
          onChange={(v) => {
            update({ tts: v });
            if (v) speak("Ciao! Adesso leggo ad alta voce.");
          }}
        />
        <Toggle
          label="Disegno anche con il dito"
          hint="Spegnilo per usare solo Apple Pencil (rifiuto del palmo totale)"
          value={settings.fingerDraw}
          onChange={(v) => update({ fingerDraw: v })}
        />

        <div className="rounded-2xl bg-white p-4 text-sm text-muted shadow-sm">
          <p>
            <b>Salvataggio note:</b> {storageBackendName() === "server" ? "server (Neon)" : "su questo dispositivo"}.
          </p>
          <p className="mt-1">
            Per salvare su server, configura <code>DATABASE_URL</code> e <code>NEXT_PUBLIC_DATA_BACKEND=api</code> su Vercel (vedi README).
          </p>
        </div>

        <Button
          variant="danger"
          size="md"
          onClick={() => {
            if (confirm("Cancellare tutte le stelle e i progressi?")) {
              resetProgress();
            }
          }}
        >
          Azzera i progressi
        </Button>
      </div>
    </ParentGate>
  );
}

function Toggle({ label, hint, value, onChange }: { label: string; hint: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 text-left shadow-sm"
      role="switch"
      aria-checked={value}
    >
      <span>
        <span className="block font-black">{label}</span>
        <span className="block text-sm text-muted">{hint}</span>
      </span>
      <span className={`relative h-8 w-14 shrink-0 rounded-full transition ${value ? "bg-success" : "bg-gray-300"}`}>
        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${value ? "left-7" : "left-1"}`} />
      </span>
    </button>
  );
}
