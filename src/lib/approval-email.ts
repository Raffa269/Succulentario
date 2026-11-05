import "server-only";
import nodemailer from "nodemailer";

export function approvalEmailConfigured() {
  return Boolean(process.env.SMTP_USER?.trim() && process.env.SMTP_PASSWORD);
}

function approvalTransport() {
  if (!approvalEmailConfigured()) throw new Error("SMTP non configurato.");
  const port = Number(process.env.SMTP_PORT || "465");
  if (![465, 587].includes(port)) throw new Error("Porta SMTP non valida.");
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    requireTLS: true,
    auth: { user: process.env.SMTP_USER!.trim(), pass: process.env.SMTP_PASSWORD },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
}

// Authenticates to SMTP without sending a message or changing any access request.
export async function verifyApprovalEmail() {
  if (!approvalEmailConfigured()) return "smtp_missing";
  try {
    await approvalTransport().verify();
    return "smtp_ok";
  } catch (error) {
    // Never return raw provider errors, which can contain account details.
    return error && typeof error === "object" && "code" in error && error.code === "EAUTH"
      ? "smtp_auth_failed" : "smtp_connection_failed";
  }
}

export async function sendApprovalEmail(email: string) {
  const transport = approvalTransport();
  const url = "https://succulentario-freemium.vercel.app/collezione";
  const info = await transport.sendMail({
    from: { name: "Succulentario", address: process.env.SMTP_USER!.trim() },
    to: { address: email, name: "" },
    subject: "Il tuo accesso a Succulentario è stato approvato!",
    text: `Ciao!\n\nRaffaele ha approvato la tua richiesta: puoi iniziare a usare Succulentario e creare fino a 5 schede pianta.\n\nEntra qui: ${url}\n\nSe la sessione è scaduta, richiedi un nuovo codice usando la stessa email con cui hai richiesto l’accesso. Non devi ripetere la richiesta di approvazione.\n\nBuona coltivazione!\nSucculentario`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#263d29"><h1>Benvenuto in Succulentario!</h1><p>Raffaele ha approvato la tua richiesta: puoi iniziare a usare Succulentario e creare fino a <strong>5 schede pianta</strong>.</p><p><a href="${url}" style="display:inline-block;background:#385b3c;color:white;padding:12px 22px;border-radius:8px;text-decoration:none">Entra in Succulentario</a></p><p>Se la sessione è scaduta, richiedi un nuovo codice usando la stessa email con cui hai richiesto l’accesso. Non devi ripetere la richiesta di approvazione.</p><p>Buona coltivazione!<br>Succulentario</p></div>`,
  });
  if (!info.accepted?.length || info.rejected?.length) throw new Error("Email non accettata dal server SMTP.");
}
