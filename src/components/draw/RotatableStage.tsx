"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  /** 0, 90, 180 o 270 gradi (in senso orario) */
  rotation: number;
  /** larghezza / altezza del foglio dritto */
  aspect: number;
  /** altezza massima disponibile sullo schermo, in px */
  maxHeight: number;
  children: React.ReactNode;
}

/**
 * Il "tavolo" su cui si gira il foglio: lo ruota e lo ridimensiona perché
 * stia tutto nello schermo, sia dritto sia girato in orizzontale.
 */
export function RotatableStage({ rotation, aspect, maxHeight, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [avail, setAvail] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setAvail(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const turned = rotation % 180 !== 0;
  // dimensioni del foglio dritto (cw × ch), poi del suo ingombro una volta girato
  const cw = Math.max(0, turned ? Math.min(maxHeight, avail * aspect) : Math.min(avail, maxHeight * aspect));
  const ch = aspect > 0 ? cw / aspect : 0;
  const boxW = turned ? ch : cw;
  const boxH = turned ? cw : ch;

  return (
    <div ref={ref} className="w-full">
      <div className="relative mx-auto" style={{ width: boxW, height: boxH }}>
        <div
          className="absolute"
          style={{
            width: cw,
            height: ch,
            left: (boxW - cw) / 2,
            top: (boxH - ch) / 2,
            transform: `rotate(${rotation}deg)`,
            transition: "transform 0.25s ease",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/** Altezza utile dello schermo (si aggiorna quando si gira l'iPad). */
export function useAvailableHeight(reserved: number): number {
  const [h, setH] = useState(800);
  useEffect(() => {
    const calc = () => setH(Math.max(360, window.innerHeight - reserved));
    const t = setTimeout(calc, 0);
    window.addEventListener("resize", calc);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", calc);
    };
  }, [reserved]);
  return h;
}
