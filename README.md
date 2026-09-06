# Succulentario

Il catalogo personale della collezione di piante grasse di Raffaele. Vedi
[`SPECIFICA.md`](./SPECIFICA.md) per il documento di riferimento completo
(stack, modello dati, funzionalità, ordine di costruzione).

## Stato

**Tappa 1 — ossatura**: Next.js (App Router, TypeScript), Supabase (database,
storage, autenticazione con magic link riservato a un solo indirizzo), PWA
installabile, deploy su Vercel.

## Sviluppo locale

```bash
npm install
cp .env.local.example .env.local   # poi riempi con le chiavi del progetto Supabase
npm run dev
```

## Dati

La cartella `dati/` contiene il catalogo botanico (11 generi, 525 varietà, la
guida generale, le illustrazioni) come JSON di sola lettura versionati nel
repo — non sono righe di database, si aggiornano con un commit. Non
riscriverli: sono testi verificati su fonti reali (vedi `dati/LEGGIMI.md`).
