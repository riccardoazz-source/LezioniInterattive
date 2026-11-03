/**
 * Modello dei contenuti.
 *
 * Tutto ciò che la bambina vede (lezioni, giochi) è DATO, non codice:
 * per aggiungere una lezione basta aggiungere un oggetto `Lesson` in
 * `src/content/lessons/*.ts`. Il "motore" (LessonPlayer) sa come
 * mostrare ogni tipo di attività.
 *
 * Ogni contenuto ha un `level`:
 *   1 → 5-6 anni (prima elementare)
 *   2 → 7 anni  (seconda)
 *   3 → 8 anni  (terza)
 *   4 → 9 anni  (quarta)
 *   5 → 10 anni (quinta)
 * Nelle impostazioni si sceglie il livello e l'app mostra solo i
 * contenuti adatti (livello scelto e quelli precedenti, per ripasso).
 */

export type SubjectId =
  | "italiano"
  | "matematica"
  | "scienze"
  | "inglese"
  | "mondo"
  | "arte";

export type Level = 1 | 2 | 3 | 4 | 5;

export interface Subject {
  id: SubjectId;
  name: string;
  emoji: string;
  /** classe Tailwind per lo sfondo delle card */
  color: string;
  /** classe Tailwind per il testo/bordo */
  accent: string;
  description: string;
}

/** Una card da sfogliare: emoji grande + parola (letta ad alta voce). */
export interface CardItem {
  emoji: string;
  label: string;
  /** testo da pronunciare, se diverso dall'etichetta */
  say?: string;
  /** piccola nota sotto la parola */
  note?: string;
}

export type Activity =
  /** Schermata di spiegazione, con testo letto ad alta voce. */
  | { type: "intro"; title: string; text: string; emoji?: string }
  /** Galleria di card da toccare per ascoltare. */
  | { type: "cards"; title: string; text?: string; cards: CardItem[] }
  /** Domanda con risposte a scelta (una sola giusta). */
  | {
      type: "choice";
      question: string;
      emoji?: string;
      options: string[];
      answer: number;
      /** suggerimento letto dopo un errore */
      hint?: string;
    }
  /** Conta gli oggetti toccandoli, poi scegli il numero. */
  | { type: "count"; question: string; emoji: string; count: number }
  /** Ricalca una lettera o un numero con la penna (Apple Pencil). */
  | { type: "trace"; title: string; glyph: string; text?: string; say?: string }
  /** Disegno libero su un tema. */
  | { type: "draw"; title: string; text: string }
  /** Abbina coppie (es. parola ↔ immagine) toccando prima una poi l'altra. */
  | {
      type: "match";
      title: string;
      text?: string;
      pairs: { left: string; right: string }[];
    };

export interface Lesson {
  id: string;
  subject: SubjectId;
  level: Level;
  title: string;
  emoji: string;
  description: string;
  activities: Activity[];
}

export type GameKind =
  | "conta"
  | "calcoli"
  | "lettere"
  | "sillabe"
  | "memory"
  | "forme"
  | "confronta"
  | "sequenze"
  | "inglese"
  | "orologio";

export interface GameDef {
  id: GameKind;
  subject: SubjectId;
  title: string;
  emoji: string;
  description: string;
  /** livelli per cui il gioco ha una variante */
  levels: Level[];
}
