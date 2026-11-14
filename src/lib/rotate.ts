/**
 * Coordinate di un tocco dentro un elemento ruotato con CSS (0/90/180/270°).
 * Restituisce il punto nelle coordinate "dritte" dell'elemento (pixel CSS).
 */
export function toLocal(el: HTMLElement, clientX: number, clientY: number, rotation: number) {
  const r = el.getBoundingClientRect();
  const a = (-rotation * Math.PI) / 180;
  const dx = clientX - (r.left + r.width / 2);
  const dy = clientY - (r.top + r.height / 2);
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  return {
    x: dx * Math.cos(a) - dy * Math.sin(a) + w / 2,
    y: dx * Math.sin(a) + dy * Math.cos(a) + h / 2,
    w,
    h,
  };
}

/** Rotazione del foglio ricordata per ogni disegno, su questo dispositivo. */
export function readRotation(key: string): number {
  try {
    const v = Number(window.localStorage.getItem(`li:rot:${key}`) ?? 0);
    return [0, 90, 180, 270].includes(v) ? v : 0;
  } catch {
    return 0;
  }
}

export function saveRotation(key: string, deg: number) {
  try {
    if (deg === 0) window.localStorage.removeItem(`li:rot:${key}`);
    else window.localStorage.setItem(`li:rot:${key}`, String(deg));
  } catch {
    /* ignora */
  }
}
