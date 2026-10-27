# Succulentario: BETA e 1.0 freemium nello stesso progetto Supabase

## Stato del 27 ottobre 2026

I due script SQL sono stati applicati al progetto esistente dopo una prova
con rollback. Verificati online: 62 schede BETA conservate, 6 utenti BETA,
schema freemium vuoto, Raffaele amministratore. Con ruolo authenticated,
Raffaele vede le proprie 51 schede BETA e zero freemium; una sessione esterna
non autorizzata non vede schede o foto di nessuna delle due aree.
Lo schema freemium è stato aggiunto agli schemi API esposti; app_private è escluso.
Registrazione email e SMTP personalizzato erano già abilitati. Il template
Confirm Signup è stato aggiornato per mostrare il codice numerico.

Superati test PostgreSQL temporaneo, TypeScript, ESLint e build freemium.
La freemium è pubblicata su https://succulentario-freemium.vercel.app nel
progetto Vercel succulentario-freemium. Il ramo di produzione è freemium-1.0;
la BETA mantiene il proprio progetto Vercel e il ramo main.
Configurati NEXT_PUBLIC_APP_EDITION=freemium e i parametri pubblici Supabase.
Aggiunto il callback esatto freemium alle URL consentite senza cambiare il Site URL BETA.
Verificati sul sito pubblico: invio e ricezione del codice email, login di
Raffaele, collezione separata vuota con contatore 0/5, pannello Richieste di
accesso e modulo di inserimento manuale con foto.

L’utente ha scelto di pubblicare senza riconoscimento automatico: Vercel
conserva le chiavi esistenti come Secret di sola scrittura, non recuperabili.
Il comando Identifica è nascosto nella freemium e l’API risponde con un messaggio
esplicito senza chiamare servizi esterni. Per riattivarlo in futuro configurare
le chiavi originali nel nuovo progetto e NEXT_PUBLIC_IDENTIFICATION_ENABLED=true,
poi ricompilare. Il riconoscimento della BETA rimane invariato.

## Architettura

- Progetto Supabase esistente: `vxjptqjfvuuvlsfksirl`.
- BETA: schema `public`, bucket privato `foto`, sito `succulentario.vercel.app`.
- Freemium: schema `freemium`, bucket privato `foto-freemium`, sito Vercel separato.
- Auth è condiviso; richieste di approvazione e sessioni delle app sono separate.
- Nessuna scheda o foto BETA viene copiata nella freemium.

## Configurazione

Applicare in ordine, una sola volta, `supabase/freemium/001_shared_project.sql`
e `002_notes.sql` nel progetto esistente. Il primo script è atomico e conserva
in `app_private.beta_members` gli utenti esistenti prima dell’apertura pubblica.
Solo questi utenti continuano ad accedere alle tabelle BETA. Gli utenti pubblici
non possono usare lo schema BETA, neppure chiamando direttamente le API.
L’amministratore freemium viene ricavato dall’account verificato esistente
`galano.raffaele@gmail.com`; gli altri utenti BETA non vengono iscritti automaticamente.

In Data API aggiungere `freemium` agli schemi esposti, conservando quelli esistenti.
Non esporre `app_private`. Verificare la registrazione email e il template
Confirm Signup oltre a Magic Link: entrambi devono mostrare `{{ .Token }}`.
Il Site URL BETA resta invariato; aggiungere il callback freemium ai redirect consentiti.
Non cambiare le chiavi o le impostazioni del sito BETA.

Nel nuovo progetto Vercel, dal ramo `freemium-1.0`, impostare:

- `NEXT_PUBLIC_APP_EDITION=freemium`
- `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` del progetto esistente.
- Le chiavi di riconoscimento già usate dall’app, se abilitate.

Per la BETA l’edizione predefinita rimane `beta`: tabelle, foto e login su invito
rimangono quelli attuali. Non distribuire il ramo freemium sul dominio BETA.

## Accessi e limite

Chiunque può richiedere un codice e verificare la propria email. Alla prima visita
autenticata al sito freemium si crea una richiesta in attesa. Solo Raffaele può
approvare, rifiutare o revocare dal menu → Richieste di accesso.
La revoca blocca anche le API del database e l’accesso alle foto; URL foto già
firmati restano validi fino alla scadenza (un’ora). Nessuna email aggiuntiva viene
inviata all’approvazione: l’utente preme “Controlla l’approvazione”.

Cinque schede complessive per account freemium: collezione, wishlist e cimitero
condividono il limite. Il catalogo botanico non conta. Vale anche per Raffaele
nel sito freemium; la sua collezione BETA non ha il limite e rimane separata.
Il controllo SQL copre inserimenti concorrenti, importazioni e API dirette.
Il controllo del backup viene eseguito prima di cancellare dati o caricare foto.

Per aggiungere un futuro tester BETA, oltre alla procedura su invito esistente,
un amministratore deve inserire il suo ID Auth in `app_private.beta_members`.
L’approvazione freemium non assegna mai l’accesso alla BETA.

## Verifiche

`npm run test:freemium` usa un PostgreSQL locale temporaneo (PGlite).
Verifica BETA senza limite, isolamento fra schemi/utenti/foto, utente in attesa,
impossibilità di autoapprovarsi, approvazione e revoca, limite complessivo,
upsert al limite, posto liberato eliminando una scheda e funzioni note.
Verificare inoltre TypeScript, ESLint e build freemium.
L’invio email e il sito pubblico richiedono la verifica sugli ambienti online.

I due siti condividono risorse e configurazione Auth del progetto Supabase.
Le future migrazioni BETA non aggiornano automaticamente le tabelle freemium:
devono essere adattate, provate e applicate separatamente allo schema corretto.
