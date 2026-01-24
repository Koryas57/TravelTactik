import { Resend } from "resend";
import type { LeadPayload } from "./lead";

type EmailMode = "test" | "prod";

function mustGetEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} env var`);
  return v;
}

function getResend() {
  const key = mustGetEnv("RESEND_API_KEY");
  return new Resend(key);
}

function getFrom() {
  // En prod: "TravelTactik <contact@travel-tactik.com>"
  // En test: tu peux garder onboarding@resend.dev si tu veux, mais si domaine vérifié, ton from marche aussi.
  return process.env.RESEND_FROM || "TravelTactik <onboarding@resend.dev>";
}

function getOwnerEmail() {
  return mustGetEnv("LEADS_NOTIFICATION_EMAIL");
}

function getReplyTo() {
  // Où doivent arriver les réponses client (ton inbox)
  // Si tu ne la définis pas, on retombe sur LEADS_NOTIFICATION_EMAIL.
  return process.env.LEADS_REPLY_TO || getOwnerEmail();
}

function getEmailMode(): EmailMode {
  // IMPORTANT: si ton domaine est vérifié et que tu veux du vrai prod,
  // mets EMAIL_MODE="prod" sur Vercel.
  const v = (process.env.EMAIL_MODE || "prod").toLowerCase();
  return v === "test" ? "test" : "prod";
}

function getTestTo() {
  // En mode test, on force tout vers une seule adresse (souvent ton email).
  // Utile pour éviter d'envoyer à des vrais utilisateurs.
  return process.env.RESEND_TEST_TO || getOwnerEmail();
}

export async function sendLeadEmails(leadId: string, payload: LeadPayload) {
  const resend = getResend();

  const from = getFrom();
  const ownerEmail = getOwnerEmail();
  const replyToInbox = getReplyTo();

  const mode = getEmailMode();
  const testTo = getTestTo();

  // Routing selon mode
  const clientTo = mode === "prod" ? payload.email : testTo;
  const ownerTo = mode === "prod" ? ownerEmail : testTo;

  const modeBanner =
    mode === "test"
      ? `<p style="padding:10px;border:1px solid #f59e0b;background:#fffbeb;border-radius:8px;margin:0 0 12px 0;">
           <strong>MODE TEST</strong><br/>
           Email client réel : <strong>${escapeHtml(payload.email)}</strong><br/>
           Envoi forcé vers : <strong>${escapeHtml(testTo)}</strong>
         </p>`
      : "";

  // 1) Email de confirmation au client
  // "Répondre" doit arriver chez toi (Gmail / inbox)
  const clientResult = await resend.emails.send({
    from,
    to: clientTo,
    subject: "TravelTactik — Demande reçue",
    replyTo: replyToInbox,
    html: `
      <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5">
        ${modeBanner}
        <h2 style="margin:0 0 8px 0;">Demande reçue</h2>
        <p style="margin:0 0 12px 0;">Merci. J’ai bien reçu ta demande et je reviens vers toi rapidement.</p>
        <p style="margin:0 0 12px 0;"><strong>Référence :</strong> ${escapeHtml(leadId)}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
        <p style="margin:0 0 6px 0;"><strong>Pack :</strong> ${escapeHtml(payload.pack)} — <strong>Délai :</strong> ${escapeHtml(payload.speed)}</p>
        <p style="margin:0 0 6px 0;"><strong>Destination :</strong> ${escapeHtml(payload.brief.destination)}</p>
        <p style="margin:0;"><strong>Durée :</strong> ${escapeHtml(String(payload.brief.durationDays))} jours — <strong>Voyageurs :</strong> ${escapeHtml(String(payload.brief.travelers))}</p>
      </div>
    `,
  });

  // 2) Notification interne (toi)
  // "Répondre" doit partir chez le client
  const ownerResult = await resend.emails.send({
    from,
    to: ownerTo,
    subject: `Nouveau lead TravelTactik — ${payload.brief.destination}`,
    replyTo: payload.email,
    html: `
      <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5">
        ${modeBanner}
        <h2 style="margin:0 0 8px 0;">Nouveau lead</h2>
        <p style="margin:0 0 6px 0;"><strong>ID :</strong> ${escapeHtml(leadId)}</p>
        <p style="margin:0 0 12px 0;"><strong>Email client :</strong> ${escapeHtml(payload.email)}</p>

        <p style="margin:0 0 12px 0;"><strong>Pack :</strong> ${escapeHtml(payload.pack)}
          — <strong>Délai :</strong> ${escapeHtml(payload.speed)}
          — <strong>Prix :</strong> ${escapeHtml(String(payload.priceEUR))}€
        </p>

        <p style="margin:0 0 6px 0;"><strong>Brief :</strong></p>
        <pre style="background:#f6f8fa;padding:12px;border-radius:8px;overflow:auto;margin:0 0 12px 0;">${escapeHtml(
          JSON.stringify(payload.brief, null, 2),
        )}</pre>

        <p style="margin:0 0 6px 0;"><strong>Notes :</strong></p>
        <pre style="background:#f6f8fa;padding:12px;border-radius:8px;overflow:auto;margin:0;">${escapeHtml(
          payload.notes || "",
        )}</pre>
      </div>
    `,
  });

  return {
    clientResult,
    ownerResult,
    mode,
    routed: { clientTo, ownerTo, replyToInbox },
  };
}

export async function sendLeadDeliveredEmail(args: {
  leadId: string;
  email: string;
  plansUrl: string;
}) {
  const resend = getResend();

  const from = getFrom();
  const replyToInbox = getReplyTo();

  const mode = getEmailMode();
  const testTo = getTestTo();

  const clientTo = mode === "prod" ? args.email : testTo;

  const modeBanner =
    mode === "test"
      ? `<p style="padding:10px;border:1px solid #f59e0b;background:#fffbeb;border-radius:8px;margin:0 0 12px 0;">
           <strong>MODE TEST</strong><br/>
           Email client réel : <strong>${escapeHtml(args.email)}</strong><br/>
           Envoi forcé vers : <strong>${escapeHtml(testTo)}</strong>
         </p>`
      : "";

  const result = await resend.emails.send({
    from,
    to: clientTo,
    subject: "TravelTactik — Tes documents sont disponibles !",
    replyTo: replyToInbox,
    html: `
      <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5">
        ${modeBanner}
        <h2 style="margin:0 0 8px 0;">Tes documents sont prêts</h2>
        <p style="margin:0 0 12px 0;">
          Tes documents TravelTactik sont désormais disponibles dans ton espace.
        </p>

        <p style="margin:0 0 14px 0;">
          <a
            href="${escapeHtml(args.plansUrl)}"
            style="display:inline-block;padding:12px 16px;border-radius:999px;background:#2563eb;color:#fff;text-decoration:none;font-weight:800"
          >
            Accéder à mon espace
          </a>
        </p>

        <p style="margin:0;color:#6b7280;font-size:13px">
          Référence : ${escapeHtml(args.leadId)}
        </p>
      </div>
    `,
  });

  return { result, mode, routed: { clientTo, replyToInbox } };
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
