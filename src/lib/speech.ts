/**
 * Lettura ad alta voce (Web Speech API). Funziona su Safari iOS/iPadOS,
 * Chrome e Edge senza server. Su iOS la voce parte solo dopo un tocco
 * dell'utente: per questo ogni schermata ha il pulsante 🔊.
 */

let ttsEnabled = true;

export function setSpeechEnabled(v: boolean) {
  ttsEnabled = v;
}

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  const prefix = lang.slice(0, 2).toLowerCase();
  const exact = voices.filter((v) => v.lang.toLowerCase().replace("_", "-") === lang.toLowerCase());
  const same = voices.filter((v) => v.lang.toLowerCase().startsWith(prefix));
  const pool = exact.length ? exact : same;
  // Preferisci voci "premium"/locali quando disponibili
  return (
    pool.find((v) => /premium|enhanced|natural/i.test(v.name)) ??
    pool.find((v) => v.localService) ??
    pool[0]
  );
}

export function speak(text: string, lang = "it-IT") {
  if (!ttsEnabled) return;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = lang.startsWith("it") ? 0.9 : 0.85;
    u.pitch = 1.05;
    const voice = pickVoice(lang);
    if (voice) u.voice = voice;
    synth.speak(u);
  } catch {
    /* ignora: la lettura è un extra */
  }
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/** Alcuni browser caricano le voci in modo asincrono. */
export function warmUpVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}
