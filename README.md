# Lezioni Interattive

App per imparare, giocare e rileggere le lezioni di casa. Pensata per una bambina di 6 anni (prima elementare) e progettata per crescere con lei: i contenuti sono dati con un **livello** (1 = prima, 2 = seconda… fino a 5), e l'app mostra solo quelli adatti.

Funziona su **PC, iPhone e iPad** (anche come app sulla schermata Home) e supporta **Apple Pencil** con pressione e rifiuto del palmo.

## Le quattro aree

| Area | Cosa c'è |
| --- | --- |
| 📚 **Impara** | Lezioni per materia (Italiano, Matematica, Scienze, Inglese, Il mondo, Arte). Ogni lezione è una sequenza di attività: spiegazione letta ad alta voce, card da toccare, domande a scelta, conta gli oggetti, ricalca lettere e numeri con la penna, disegno libero, abbinamenti. Alla fine si guadagnano stelle. |
| 🎮 **Gioca** | 10 giochi con round casuali e difficoltà legata al livello: Conta!, Calcoli, Più grande?, Cosa viene dopo?, Forme e colori, Che ore sono?, Prima lettera, Costruisci la parola, Memory, English words. |
| 🎨 **Disegni** | Disegno libero su un foglio bianco a tutta pagina con Apple Pencil, e i disegni da colorare: **immagini vere** (PNG/JPG con linee nere) con riempimento a secchiello sui pixel, fermato dalle linee, più la penna sopra. I disegni si aggiungono dall'app (dal rullino) o dalla cartella `public/colora/`. In fondo restano i "disegni semplici" fatti con forme base. Tutto si salva nella galleria "I miei disegni". |
| 📓 **Note** | I quaderni delle lezioni di casa: fogli a righe a tutta pagina da sfogliare. Su ogni foglio si scrive direttamente con Apple Pencil (modalità Penna), con la tastiera (modalità Testo) e si mettono foto che si spostano e ridimensionano (modalità Foto). Il pulsante 🔊 legge il testo della pagina. Nessun blocco genitori. |

Ogni eliminazione (quaderni, pagine, disegni, progressi) chiede di scrivere la parola **Elimina** per confermare, così le dita piccole non cancellano nulla per sbaglio.

Le impostazioni (⚙️ in home, protette da un "cancello genitori": una moltiplicazione) permettono di scegliere nome, livello, lettura ad alta voce e se consentire il disegno col dito.

## Avvio in locale

```bash
npm install
npm run dev
```

Apri http://localhost:3000. Per provarla su iPad nella stessa rete Wi‑Fi usa l'indirizzo IP del PC (es. `http://192.168.1.10:3000`).

Controlli: `npm run typecheck`, `npm run lint`, `npm run build`.

## Deploy su Vercel

1. Fai il push del repository su GitHub.
2. Su [vercel.com](https://vercel.com) → **Add New Project** → importa il repository. Vercel riconosce Next.js da solo: nessuna configurazione necessaria.
3. Deploy. Da iPhone/iPad apri l'URL in Safari → **Condividi → Aggiungi alla schermata Home**: l'app si apre a schermo intero.

Senza database, note, disegni e progressi restano salvati **nel browser del dispositivo** (IndexedDB e localStorage). Funziona tutto, ma le note non si vedono da un altro dispositivo.

## Aggiungere il server (Neon)

Quando vuoi salvare le note su un database condiviso tra dispositivi:

1. Crea un progetto su [neon.tech](https://neon.tech) e copia la connection string (`postgresql://…?sslmode=require`).
2. Nella **SQL Editor** di Neon esegui il contenuto di [`db/schema.sql`](db/schema.sql).
3. Su Vercel → progetto → **Settings → Environment Variables** aggiungi:
   - `DATABASE_URL` = la connection string
   - `NEXT_PUBLIC_DATA_BACKEND` = `api`
4. **Redeploy**. Verifica con `https://<tuo-dominio>/api/health` (deve rispondere `"database": "ok"`).

Il codice è già pronto: `src/lib/storage/` contiene due implementazioni della stessa interfaccia (`LocalNotesRepository` e `ApiNotesRepository`), scelte dalla variabile `NEXT_PUBLIC_DATA_BACKEND`. Le API sono in `src/app/api/notes/`. In locale puoi usare `.env.local` (vedi `.env.example`).

> Nota: le note scritte prima dell'attivazione del server restano nel browser; se vuoi, copiale a mano nelle nuove note.

## Come crescono i contenuti

Vedi [`CONTENT.md`](CONTENT.md): spiega la struttura delle lezioni, i tipi di attività, il programma per livello e come generare nuove lezioni (anche con l'aiuto di un'IA) mantenendo la qualità.

## Disegni da colorare: come aggiungerli

Due modi:

1. **Dall'app** (il più comodo su iPad): Disegni → Da colorare → "Aggiungi un disegno" → scegli le immagini dal rullino, dai un titolo e una categoria. Restano salvate nel dispositivo.
2. **Nel repository** (per averle su tutti i dispositivi): metti i file in `public/colora/<categoria>/nome-del-disegno.png` e lancia `npm run colora:scan`, che aggiorna `src/content/coloring-images.ts`. Poi commit e deploy.

Requisiti dell'immagine: linee nere nette su sfondo bianco, senza ombreggiature, 1000-1500 px di lato. Il secchiello riempie la zona chiara toccata fino alle linee: se una linea è interrotta il colore "esce", come con i pennarelli veri.

Dove trovarle: un generatore di immagini (ChatGPT, Gemini, Copilot…) con un prompt tipo *"coloring page for kids, thick clean black outlines, white background, no shading, chibi fairy with wings"*; oppure disegni da colorare gratuiti per uso personale. Attenzione ai personaggi protetti da copyright: per uso in famiglia va bene, ma non pubblicarli nel repository se è pubblico.

## Anteprima dei disegni semplici

```bash
node scripts/render-coloring.js
```

Genera `coloring-preview.png` con tutte le pagine (serve Playwright: `npm i -D playwright && npx playwright install chromium`). Utile quando si aggiungono personaggi.

## Struttura del progetto

```
src/
  app/                 pagine (Next.js App Router)
    impara/            materie → lezioni → lezione
    gioca/             giochi
    disegni/           disegno libero e da colorare
    note/              quaderni del genitore
    impostazioni/      impostazioni
    api/               API per Neon (notes, health)
  content/             CONTENUTI: lezioni, materie, giochi, disegni da colorare (solo dati)
  components/
    lesson/            motore delle lezioni (un renderer per tipo di attività)
    games/             motore dei giochi + generatori di round
    draw/              lavagna Apple Pencil (canvas, strumenti, anteprima) e tavola da colorare
    disegni/           galleria, disegno libero, catalogo e colorazione
    notes/             lista e editor dei quaderni
    ui/                pulsanti, header, stelle, coriandoli, cancello genitori
  lib/                 impostazioni, progressi, voce, storage (locale/API), db
db/schema.sql          schema Postgres per Neon
```

> Le foto nei quaderni vengono ridotte a 1280 px e salvate come JPEG dentro la nota (circa 100-250 KB l'una). Con Neon finiscono nel campo `pages` (jsonb): va bene per decine di foto per quaderno; per centinaia conviene passare a Vercel Blob.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Web Speech API per la voce, Pointer Events per Apple Pencil, `@neondatabase/serverless` per il database.
