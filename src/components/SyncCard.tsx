"use client";

import { useState } from "react";
import { getFamilyCode, setFamilyCode, syncNow, useSyncStatus, type SyncState } from "@/lib/sync/engine";
import { Button } from "@/components/ui/Button";

const LABEL: Record<SyncState, { icon: string; text: string; color: string }> = {
  checking: { icon: "⏳", text: "Controllo il server…", color: "text-muted" },
  local: { icon: "📱", text: "Solo su questo dispositivo", color: "text-amber-600" },
  locked: { icon: "🔑", text: "Serve il codice famiglia", color: "text-amber-600" },
  syncing: { icon: "🔄", text: "Sincronizzo…", color: "text-info" },
  online: { icon: "☁️", text: "Salvato sul server", color: "text-success" },
  offline: { icon: "📴", text: "Senza connessione", color: "text-amber-600" },
  error: { icon: "⚠️", text: "Errore del server", color: "text-danger" },
};

export function SyncBadge() {
  const st = useSyncStatus();
  const l = LABEL[st.state];
  return (
    <span title={l.text} aria-label={l.text} className="text-xl">
      {l.icon}
    </span>
  );
}

export function SyncCard() {
  const st = useSyncStatus();
  const [code, setCode] = useState(() => (typeof window === "undefined" ? "" : getFamilyCode()));
  const l = LABEL[st.state];
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-black">Salvataggio sul server</span>
        <span className={`text-sm font-bold ${l.color}`}>
          {l.icon} {l.text}
        </span>
      </div>
      {st.detail && <p className="text-sm text-muted">{st.detail}</p>}
      <div className="grid grid-cols-2 gap-2 text-sm text-muted">
        <span>Modifiche da inviare: <b>{st.pending}</b></span>
        <span>
          Ultima sincronizzazione:{" "}
          <b>{st.lastSync ? new Date(st.lastSync).toLocaleString("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "mai"}</b>
        </span>
      </div>
      {(st.state === "locked" || st.protected) && (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setFamilyCode(code);
          }}
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Codice famiglia"
            autoComplete="off"
            autoCapitalize="none"
            className="min-w-0 flex-1 rounded-xl border-2 border-gray-200 px-3 py-2 font-bold outline-none focus:border-primary"
          />
          <Button type="submit" size="md">
            Salva codice
          </Button>
        </form>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted">
          Versione app: {process.env.NEXT_PUBLIC_BUILD_ID ?? "locale"}
          {st.serverBuild && st.serverBuild !== process.env.NEXT_PUBLIC_BUILD_ID ? ` · server ${st.serverBuild}` : ""}
        </span>
        <Button variant="secondary" size="md" onClick={() => void syncNow()} disabled={st.state === "syncing"}>
          🔄 Sincronizza ora
        </Button>
      </div>
      {st.state === "local" && (
        <p className="text-xs text-muted">
          Per salvare su server: su Vercel collega un database Neon (Storage → Neon), che imposta DATABASE_URL, poi fai un nuovo deploy. Le tabelle si creano da sole.
        </p>
      )}
    </div>
  );
}
