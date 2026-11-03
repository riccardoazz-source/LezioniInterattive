"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "./Button";

const WORD = "Elimina";

/**
 * Protezione contro le cancellazioni accidentali (dita piccole!):
 * per confermare bisogna scrivere la parola "Elimina".
 *
 * Uso:
 *   const [confirmDelete, dialog] = useConfirmDelete();
 *   ... if (!(await confirmDelete("Eliminare il quaderno?"))) return; ...
 *   return <>{dialog}...</>
 */
export function useConfirmDelete(): [(message: string) => Promise<boolean>, React.ReactNode] {
  const [message, setMessage] = useState<string | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);

  const confirmDelete = useCallback((msg: string) => {
    setMessage(msg);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (ok: boolean) => {
    setMessage(null);
    resolver.current?.(ok);
    resolver.current = null;
  };

  const dialog = message !== null ? <ConfirmDeleteDialog message={message} onClose={close} /> : null;
  return [confirmDelete, dialog];
}

function ConfirmDeleteDialog({ message, onClose }: { message: string; onClose: (ok: boolean) => void }) {
  const [value, setValue] = useState("");
  const ok = value.trim().toLowerCase() === WORD.toLowerCase();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="animate-pop w-full max-w-sm rounded-[var(--radius-bubble)] bg-white p-6 text-center shadow-xl">
        <div className="text-5xl">🗑️</div>
        <h2 className="mt-2 text-2xl font-black">{message}</h2>
        <p className="mt-2 text-muted">
          Per confermare scrivi <b>{WORD}</b>
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (ok) onClose(true);
          }}
          className="mt-3 flex flex-col items-center gap-3"
        >
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            autoComplete="off"
            autoCapitalize="none"
            placeholder={WORD}
            aria-label={`Scrivi ${WORD}`}
            className="w-48 rounded-2xl border-2 border-gray-200 px-4 py-3 text-center text-xl font-black outline-none focus:border-danger"
          />
          <div className="flex gap-3">
            <Button type="button" variant="secondary" size="md" onClick={() => onClose(false)}>
              Annulla
            </Button>
            <Button type="submit" variant="danger" size="md" disabled={!ok}>
              Elimina
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
