"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
  title: string;
  emoji?: string;
  /** destinazione del tasto indietro; se assente usa la history */
  backHref?: string;
  right?: React.ReactNode;
  colorClass?: string;
}

export function AppHeader({ title, emoji, backHref, right, colorClass }: Props) {
  const router = useRouter();
  const back = (
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-2xl shadow-sm active:scale-95">
      ←
    </span>
  );
  return (
    <header
      className={`sticky top-0 z-20 flex items-center gap-3 px-4 py-3 ${colorClass ?? "bg-background/90"} backdrop-blur`}
      style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
    >
      {backHref ? (
        <Link href={backHref} aria-label="Indietro">
          {back}
        </Link>
      ) : (
        <button type="button" onClick={() => router.back()} aria-label="Indietro">
          {back}
        </button>
      )}
      <h1 className="flex-1 truncate text-2xl font-black">
        {emoji && <span className="mr-2">{emoji}</span>}
        {title}
      </h1>
      {right}
      <Link
        href="/"
        aria-label="Home"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-2xl shadow-sm active:scale-95"
      >
        🏠
      </Link>
    </header>
  );
}
