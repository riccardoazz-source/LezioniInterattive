# Lezioni Interattive

App per imparare, giocare e rileggere le lezioni di casa. Pensata per una bambina di 6 anni (prima elementare) e progettata per crescere con lei: i contenuti sono dati con un **livello** (1 = prima, 2 = seconda… fino a 5), e l'app mostra solo quelli adatti.

Funziona su **PC, iPhone e iPad** (anche come app sulla schermata Home) e supporta **Apple Pencil** con pressione e rifiuto del palmo.

## Le tre aree

| Area | Cosa c'è |
| --- | --- |
| 📚 **Impara** | Lezioni per materia (Italiano, Matematica, Scienze, Inglese, Il mondo, Arte). Ogni lezione è una sequenza di attività: spiegazione letta ad alta voce, card da toccare, domande a scelta, conta gli oggetti, ricalca lettere e numeri con la penna, disegno libero, abbinamenti. Alla fine si guadagnano stelle. |
| 🎮 **Gioca** | 10 giochi con round casuali e difficoltà legata al livello: Conta!, Calcoli, Più grande?, Cosa viene dopo?, Forme e colori, Che ore sono?, Prima lettera, Costruisci la parola, Memory, English words. |
| ✏️ **Note** | Le lezioni che scrivi tu: titolo, materia, testo e una lavagna per Apple Pencil. La bambina le rilegge (anche ascoltandole); per modificarle c'è un "cancello genitori" (una moltiplicazione). |

Le impostazioni (⚙️ in home, protette dal cancello genitori) permettono di scegliere nome, livello, lettura ad alta voce e se consentire il disegno col dito.

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

Senza database, le note e i progressi restano salvati **nel browser del dispositivo** (localStorage). Funziona tutto, ma le note non si vedono da un altro dispositivo.

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

## Struttura del progetto

```
src/
  app/                 pagine (Next.js App Router)
    impara/            materie → lezioni → lezione
    gioca/             giochi
    note/              note del genitore
    impostazioni/      impostazioni
    api/               API per Neon (notes, health)
  content/             CONTENUTI: lezioni, materie, giochi (solo dati)
  components/
    lesson/            motore delle lezioni (un renderer per tipo di attività)
    games/             motore dei giochi + generatori di round
    draw/              lavagna Apple Pencil (canvas, strumenti, anteprima)
    notes/             lista e editor note
    ui/                pulsanti, header, stelle, coriandoli, cancello genitori
  lib/                 impostazioni, progressi, voce, storage (locale/API), db
db/schema.sql          schema Postgres per Neon
```

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Web Speech API per la voce, Pointer Events per Apple Pencil, `@neondatabase/serverless` per il database.
