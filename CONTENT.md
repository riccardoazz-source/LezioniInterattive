# Guida ai contenuti

Questa è la parte più importante dell'app: i contenuti. Qui c'è il metodo per averne di buoni oggi (6 anni) e per farli crescere negli anni.

## 1. Principio: i contenuti sono dati, non codice

Una lezione è un oggetto in `src/content/lessons/<materia>.ts`:

```ts
{
  id: "mat-addizioni",        // unico, stabile (serve per le stelle salvate)
  subject: "matematica",      // italiano | matematica | scienze | inglese | mondo | arte
  level: 1,                   // 1 prima, 2 seconda, 3 terza, 4 quarta, 5 quinta
  title: "Le addizioni",
  emoji: "➕",
  description: "Mettiamo insieme e contiamo",
  activities: [ ... ]         // la sequenza di schermate
}
```

Il motore (`src/components/lesson/LessonPlayer.tsx`) sa mostrare questi tipi di attività:

| type | Cosa fa | Campi |
| --- | --- | --- |
| `intro` | Spiegazione con emoji grande, letta ad alta voce | `title`, `text`, `emoji?` |
| `cards` | Griglia di card da toccare per ascoltare | `title`, `text?`, `cards: {emoji, label, say?, note?}[]` |
| `choice` | Domanda a scelta multipla | `question`, `emoji?`, `options[]`, `answer` (indice), `hint?` |
| `count` | Tocca gli oggetti per contarli, poi scegli il numero | `question`, `emoji`, `count` |
| `trace` | Ricalca con la penna una lettera/numero/forma | `title`, `glyph`, `text?`, `say?` |
| `draw` | Disegno libero su un tema | `title`, `text` |
| `match` | Abbina coppie (tocca sinistra, poi destra) | `title`, `text?`, `pairs: {left, right}[]` |

`npm run typecheck` segnala subito campi mancanti o sbagliati, e un `id` duplicato fa fallire la build. Se serve un nuovo tipo di attività (es. "metti in ordine", "vero/falso con immagine"), si aggiunge una volta nel motore e poi è disponibile per tutte le lezioni.

## 2. Cosa insegnare a ogni livello (riferimento)

Basato sulle Indicazioni Nazionali per la scuola primaria. Serve come scaletta per scrivere nuove lezioni.

**Livello 1 – prima (5-6 anni)** ✅ *contenuti presenti*
- Italiano: vocali, consonanti, sillabe, prime parole, pregrafismo.
- Matematica: numeri fino a 20, contare, confrontare, addizioni e sottrazioni entro il 10, forme.
- Scienze: animali e habitat, stagioni, 5 sensi, piante, viventi/non viventi.
- Inglese: saluti, colori, numeri 1-10, animali.
- Il mondo: giorni della settimana, orientamento (sopra/sotto/destra/sinistra), regole, famiglia.
- Arte: colori primari, linee, strumenti musicali.

**Livello 2 – seconda (7 anni)** ✅ *contenuti presenti*
- Italiano: alfabeto in ordine, doppie, digrammi (gn, gl, sc), accenti e apostrofo, frase (nome, azione), lettura di brevi storie con domande.
- Matematica: numeri fino a 100, decine/unità, addizioni e sottrazioni in colonna, tabelline (2, 5, 10, poi tutte), problemi semplici, l'orologio (ore e mezz'ore), l'euro.
- Scienze: parti della pianta e del corpo, materiali, acqua (stati), catena alimentare semplice.
- Inglese: la famiglia, il corpo, la scuola, giorni e mesi, `I like / I don't like`.
- Il mondo: mesi e stagioni, linea del tempo (ieri/oggi/domani), la mappa della classe e del quartiere, i punti cardinali.
- Arte: colori secondari e caldi/freddi, ritmo musicale.

**Livello 3 – terza (8 anni)** ✅ *contenuti presenti*
- Italiano: nomi/articoli/aggettivi/verbi, tempi verbali base, punteggiatura, ortografia (cu/qu, h), testo narrativo e descrittivo.
- Matematica: numeri fino a 1000, moltiplicazioni e divisioni, frazioni semplici, misure (m, kg, l), perimetro, problemi a due passaggi.
- Scienze: ecosistemi, classificazione animali (vertebrati), ciclo dell'acqua, il suolo.
- Inglese: `There is/are`, preposizioni, cibo, vestiti, ore, `can/can't`.
- Il mondo (storia/geografia): preistoria, le fonti, paesaggi (montagna, collina, pianura, mare), carte geografiche.

**Livelli 4-5 – quarta e quinta (9-10 anni)**
- Italiano: analisi grammaticale e logica, testi argomentativi, riassunto, poesia.
- Matematica: numeri decimali, grandi numeri, frazioni e percentuali, aree, angoli, statistica (media, grafici), problemi complessi.
- Scienze: corpo umano (apparati), energia, ambiente, sistema solare.
- Inglese: present simple/continuous, past simple, descrizioni, piccoli dialoghi.
- Storia: civiltà antiche (Egizi, Greci, Romani). Geografia: regioni d'Italia, Europa, clima.

Per i livelli 3-5 aggiungere anche tipi di attività più "scolastici": testo da leggere con domande di comprensione, vero/falso, completa la frase, riordina, risposta scritta con tastiera.

## 3. Come generare buoni contenuti (il metodo)

1. **Scegli un obiettivo preciso** per lezione (es. "sottrazioni entro il 10 con supporto visivo"), non un argomento vago. 6-10 attività per lezione, max 10 minuti.
2. **Ritmo**: `intro` → `cards` (esplorazione) → 2-3 `choice`/`count` (verifica) → `trace`/`draw` (mano) → `match` (consolidamento). Alterna sempre "guarda" e "fai".
3. **Linguaggio per l'età**: frasi corte, una idea per frase, parole concrete, emoji come immagine. Per il livello 1 la bambina non legge ancora bene: ogni testo è anche letto dalla voce.
4. **Risposte**: 2-3 opzioni al livello 1, 3-4 dopo. I distrattori devono essere plausibili ma non ingannevoli. Aggiungi `hint` che spiega il *perché*.
5. **Progressione**: dentro la lezione dal facile al difficile; tra lezioni usa `level` e l'ordine nel file.
6. **Verifica dal vivo**: fai fare la lezione, osserva dove si blocca o si annoia, correggi. Le stelle (1-3 per lezione) mostrano dove ha avuto difficoltà.

### Usare un'IA per scrivere lezioni

Funziona bene se le dai lo schema. Prompt di esempio:

> Scrivi una lezione in italiano per una bambina di 7 anni (seconda elementare) sull'argomento "le doppie" nel formato TypeScript qui sotto. Usa solo i tipi di attività elencati, 8 attività, con questo ritmo: intro, cards, choice, choice, trace, choice, match, draw. Frasi corte, emoji come immagini, `hint` nelle domande. id: "it-doppie", subject: "italiano", level: 2.
> [incolla la tabella dei tipi di attività e una lezione esistente come esempio]

Poi incolla il risultato nel file della materia, lancia `npm run typecheck`, prova la lezione e aggiusta. Non pubblicare contenuti generati senza provarli: l'IA sbaglia a volte i dettagli (indice `answer`, parole troppo difficili).

### Le note come laboratorio

Lo spazio **Note** è anche un modo per sperimentare: scrivi lì la lezione che fai a voce, con la lavagna. Se funziona bene, trasformala in una lezione "vera" nel file della materia, così ha domande, voce e stelle.

## 4. Giochi

I giochi generano round casuali in `src/components/games/rounds.tsx`; ogni generatore riceve il `level` e adatta numeri, parole e opzioni. Per aggiungere un gioco: aggiungi la definizione in `src/content/games.ts`, un generatore in `rounds.tsx` (per giochi "domanda + risposte") o un componente dedicato (come Memory e Sillabe), e collegalo in `GamePlayer.tsx`. Le parole di `lettere`, `sillabe` e `inglese` sono liste in cima ai file: aggiungere parole è il modo più semplice per rinfrescare i giochi.

## 5. Disegni da colorare

Sono immagini (PNG/JPG con linee nere) in `public/colora/<categoria>/`, elencate in `src/content/coloring-images.ts` da `npm run colora:scan`. Le categorie (nome, emoji, colore, ordine) sono in `src/content/coloring-categories.ts`. Il riempimento a secchiello lavora sui pixel: linee nette e chiuse danno il risultato migliore. Vedi il README per come preparare le immagini da PDF.

## 6. Idee per il futuro

- Audio registrato dal genitore per le lezioni (al posto o insieme alla voce sintetica).
- Sincronizzazione progressi su Neon (tabella `progress` già nello schema).
- Profili per più bambini.
- Generazione di lezioni direttamente nell'app tramite API di un modello (richiede server e chiave API).
- Statistiche per il genitore: quali lezioni, quante stelle, dove sbaglia di più.
