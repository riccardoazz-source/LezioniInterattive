"use client";

import { useState } from "react";
import { Button } from "./Button";
import { makeChallenge, useParentGate } from "@/lib/parent-gate";

/**
 * Mostra i figli solo quando l'area genitori è sbloccata. La domanda è una
 * moltiplicazione: semplice per un adulto, non ancora per una bambina di 6 anni.
 */
export function ParentGate({ children }: { children: React.ReactNode }) {
  const { unlocked, ready, unlock } = useParentGate();
  const [challenge, setChallenge] = useState(() => makeChallenge());
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  if (!ready) return null;
  if (unlocked) return <>{children}</>;

  const submit = () => {
    if (Number(value) === challenge.answer) {
      unlock();
    } else {
      setError(true);
      setValue("");
      setChallenge(makeChallenge());
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-sm rounded-[var(--radius-bubble)] bg-white p-6 text-center shadow-md">
      <div className="text-5xl">🔒</div>
      <h2 className="mt-3 text-2xl font-black">Area genitori</h2>
      <p className="mt-2 text-muted">Per entrare, rispondi: quanto fa</p>
      <p className="my-3 text-4xl font-black">{challenge.question} = ?</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex flex-col items-center gap-3"
      >
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-32 rounded-2xl border-2 border-gray-200 px-4 py-3 text-center text-3xl font-black outline-none focus:border-primary"
          aria-label="Risposta"
        />
        {error && <p className="font-bold text-danger">Riprova!</p>}
        <Button type="submit">Entra</Button>
      </form>
    </div>
  );
}
