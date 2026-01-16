import { Resend } from "resend";
import type { LeadPayload } from "./lead";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Missing RESEND_API_KEY env var");
  return new Resend(key);
}

function getFrom() {
  // Pour la prod, utilise un domaine vérifié (Resend Dashboard -> Domains).
  // Pour tester vite, onboarding@resend.dev est OK.
  return process.env.RESEND_FROM || "TravelTactik <onboarding@resend.dev>";
}

function getOwnerEmail() {
  const email = process.env.LEADS_NOTIFICATION_EMAIL;
  if (!email) throw new Error("Missing LEADS_NOTIFICATION_EMAIL env var");
  return email;
}

export async function sendLeadEmails(leadId: string, payload: LeadPayload) {
  const resend = getResend();
  const from = getFrom();
  const owner = getOwnerEmail();

  // 1) Confirmation client
  await resend.emails.send({
    from,
    to: payload.email,
    subject: "TravelTactik — Demande reçue",
    html: `
      <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5">
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

  // 2) Notification interne (toi)
  await resend.emails.send({
    from,
    to: owner,
    subject: `Nouveau lead TravelTactik — ${payload.brief.destination}`,
    html: `
      <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5">
        <h2>Nouveau lead</h2>
        <p><strong>ID :</strong> ${escapeHtml(leadId)}</p>
        <p><strong>Email :</strong> ${escapeHtml(payload.email)}</p>
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
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
