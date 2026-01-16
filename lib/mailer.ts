import { Resend } from "resend";
import type { LeadPayload } from "./lead";

type EmailMode = "test" | "prod";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Missing RESEND_API_KEY env var");
  return new Resend(key);
}

function getFrom() {
  return process.env.RESEND_FROM || "TravelTactik <onboarding@resend.dev>";
}

function getOwnerEmail() {
  const email = process.env.LEADS_NOTIFICATION_EMAIL;
  if (!email) throw new Error("Missing LEADS_NOTIFICATION_EMAIL env var");
  return email;
}

function getEmailMode(): EmailMode {
  const v = (process.env.EMAIL_MODE || "test").toLowerCase();
  return v === "prod" ? "prod" : "test";
}

function getTestTo(ownerEmail: string) {
  // En mode test, Resend n'autorise que l'owner email.
  // On peut le configurer explicitement si besoin.
  return process.env.RESEND_TEST_TO || ownerEmail;
}

export async function sendLeadEmails(leadId: string, payload: LeadPayload) {
  const resend = getResend();
  const from = getFrom();
  const owner = getOwnerEmail();
  const mode = getEmailMode();
  const testTo = getTestTo(owner);

  const clientTo = mode === "prod" ? payload.email : testTo;
  const ownerTo = mode === "prod" ? owner : testTo;

  const modeBanner =
    mode === "test"
      ? `<p style="padding:10px;border:1px solid #f59e0b;background:#fffbeb;border-radius:8px;">
           <strong>MODE TEST</strong><br/>
           Email client réel : <strong>${escapeHtml(payload.email)}</strong><br/>
           (Envoi forcé vers ${escapeHtml(testTo)} car domaine non vérifié)
         </p>`
      : "";

  // 1) Confirmation "client"
  const clientResult = await resend.emails.send({
    from,
    to: clientTo,
    subject: "TravelTactik — Demande reçue",
    // Reply-To en prod utile, en test aussi (tu peux répondre comme si tu étais le client)
    replyTo: payload.email,
    html: `
      <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5">
        ${modeBanner}
        <h2>Demande reçue</h2>
        <p>Merci. J’ai bien reçu ta demande et je reviens vers toi rapidement.</p>
        <p><strong>Référence :</strong> ${escapeHtml(leadId)}</p>
        <hr />
        <p><strong>Pack :</strong> ${escapeHtml(payload.pack)} — <strong>Délai :</strong> ${escapeHtml(payload.speed)}</p>
        <p><strong>Destination :</strong> ${escapeHtml(payload.brief.destination)}</p>
        <p><strong>Durée :</strong> ${escapeHtml(String(payload.brief.durationDays))} jours — <strong>Voyageurs :</strong> ${escapeHtml(String(payload.brief.travelers))}</p>
      </div>
    `,
  });

  // 2) Notification "owner"
  const ownerResult = await resend.emails.send({
    from,
    to: ownerTo,
    subject: `Nouveau lead TravelTactik — ${payload.brief.destination}`,
    // Pour répondre directement au client depuis ton email
    replyTo: payload.email,
    html: `
      <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5">
        ${modeBanner}
        <h2>Nouveau lead</h2>
        <p><strong>ID :</strong> ${escapeHtml(leadId)}</p>
        <p><strong>Email client :</strong> ${escapeHtml(payload.email)}</p>
        <p><strong>Pack :</strong> ${escapeHtml(payload.pack)} — <strong>Délai :</strong> ${escapeHtml(payload.speed)} — <strong>Prix :</strong> ${escapeHtml(String(payload.priceEUR))}€</p>

        <p><strong>Brief :</strong></p>
        <pre style="background:#f6f8fa;padding:12px;border-radius:8px;overflow:auto">${escapeHtml(
          JSON.stringify(payload.brief, null, 2),
        )}</pre>

        <p><strong>Notes :</strong></p>
        <pre style="background:#f6f8fa;padding:12px;border-radius:8px;overflow:auto">${escapeHtml(
          payload.notes || "",
        )}</pre>
      </div>
    `,
  });

  return { clientResult, ownerResult, mode, clientTo, ownerTo };
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
