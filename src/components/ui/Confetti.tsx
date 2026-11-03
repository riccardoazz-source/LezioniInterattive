"use client";

import { useMemo } from "react";

/** pseudo-casuale deterministico: puro, quindi sicuro durante il render */
function noise(i: number): number {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const COLORS = ["#ff7b54", "#ffd166", "#06d6a0", "#118ab2", "#ef476f", "#8338ec"];

export function Confetti({ count = 60 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: noise(i) * 100,
        delay: noise(i + 100) * 0.8,
        color: COLORS[i % COLORS.length],
        rotate: noise(i + 200) * 360,
      })),
    [count],
  );
  return (
    <div aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
