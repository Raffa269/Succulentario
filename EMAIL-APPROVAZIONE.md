# Email dopo l’approvazione freemium

La modifica invia una notifica distinta dall’OTP dopo l’approvazione dalla pagina Amministrazione.
Il link punta alla collezione freemium; se la sessione è scaduta, l’utente richiede un nuovo OTP con la stessa email. Nessuna seconda approvazione.

## Configurazione necessaria prima dell’attivazione

Nel solo progetto Vercel `succulentario-freemium`, Environment Variables, ambiente **Production**:

- `SMTP_USER`: indirizzo Gmail del mittente, come in Supabase Authentication → Emails → SMTP Settings.
- `SMTP_PASSWORD`: password per app Gmail già usata per SMTP. Non la password normale dell’account. Non inserire il valore nel repository o nella chat.
- Opzionali: `SMTP_HOST` (default `smtp.gmail.com`) e `SMTP_PORT` (default `465`, ammessa anche `587` con STARTTLS obbligatorio).

Supabase non rende leggibile la password SMTP salvata: va inserita da chi la possiede. Nessuna modifica ai modelli OTP, alla configurazione BETA o alle policy del database.
Le credenziali non devono avere il prefisso `NEXT_PUBLIC_`.
Dopo la configurazione pubblicare il codice su `freemium-1.0`. Per variabili aggiunte dopo una pubblicazione serve un nuovo deploy.

## Comportamento e limiti verificati

- Autorizzazione amministratore lato server e destinatario letto dal database, mai dal modulo.
- Invio solo dopo aggiornamento riuscito; aggiornamento condizionato allo stato precedente per evitare il doppio invio con due approvazioni contemporanee.
- Nessuna email su rifiuto/revoca o approvazione ripetuta.
- Se SMTP fallisce l’accesso resta approvato, con avviso all’amministratore e pulsante esplicito «Invia di nuovo l’email».
- I pulsanti si disabilitano durante l’operazione. Il reinvio è manuale, non una coda automatica.
- Conferma dell’accettazione SMTP, non garanzia di consegna nella posta in arrivo.
- Senza configurazione: avviso nell’amministrazione; nessuna promessa di notifica nella pagina d’attesa.

Validazione locale: `npm run test:access-email`, `npm run test:freemium`, `npm run lint`, build con `NEXT_PUBLIC_APP_EDITION=freemium`.
Invio reale ancora da verificare dopo configurazione SMTP; i test automatici non inviano email.
