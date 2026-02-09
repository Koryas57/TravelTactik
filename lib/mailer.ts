import { Resend } from "resend";
import type { LeadPayload } from "./lead";

type EmailMode = "test" | "prod";

function mustGetEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} env var`);
  return v;
}

function getOptionalEnv(name: string) {
  const v = process.env[name]?.trim();
  return v ? v : null;
}

function getResend() {
  const key = mustGetEnv("RESEND_API_KEY");
  return new Resend(key);
}

function getFrom() {
  return process.env.RESEND_FROM || "TravelTactik <onboarding@resend.dev>";
}

function getOwnerEmail() {
  return getOptionalEnv("LEADS_NOTIFICATION_EMAIL");
}

function getReplyTo() {
  return process.env.LEADS_REPLY_TO || getOwnerEmail() || undefined;
}

function getEmailMode(): EmailMode {
  const v = (process.env.EMAIL_MODE || "prod").toLowerCase();
  return v === "test" ? "test" : "prod";
}

function getTestTo() {
  return getOptionalEnv("RESEND_TEST_TO");
}

function buildModeBanner(
  mode: EmailMode,
  actualEmail: string,
  testTo: string | null,
) {
  if (mode !== "test" || !testTo) return "";

  return `<p style="padding:10px;border:1px solid #f59e0b;background:#fffbeb;border-radius:8px;margin:0 0 12px 0;">
    <strong>MODE TEST</strong><br/>
    Email réel : <strong>${escapeHtml(actualEmail)}</strong><br/>
    Envoi forcé vers : <strong>${escapeHtml(testTo)}</strong>
  </p>`;
}

async function sendIfRecipient(
  resend: Resend,
  params: Parameters<typeof resend.emails.send>[0] & {
    to: string | null | undefined;
  },
  logLabel: string,
) {
  if (!params.to) {
    console.warn(`[mailer] ${logLabel} skipped: missing recipient`);
    return { skipped: true };
  }

  return resend.emails.send({
    ...params,
    to: params.to,
  });
}

export async function sendLeadEmails(leadId: string, payload: LeadPayload) {
  const resend = getResend();

  const from = getFrom();
  const ownerEmail = getOwnerEmail();
  const replyToInbox = getReplyTo();

  const mode = getEmailMode();
  const testTo = getTestTo();

  const clientTo = mode === "test" && testTo ? testTo : payload.email;
  const ownerTo = mode === "test" && testTo ? testTo : ownerEmail;

  const clientModeBanner = buildModeBanner(mode, payload.email, testTo);
  const ownerModeBanner = buildModeBanner(
    mode,
    ownerEmail || "(owner)",
    testTo,
  );

  const clientResult = await sendIfRecipient(
    resend,
    {
      from,
      to: clientTo,
      subject: "TravelTactik — Demande reçue",
      replyTo: replyToInbox,
      html: `
      <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5">
        ${clientModeBanner}
        <h2 style="margin:0 0 8px 0;">Demande reçue</h2>
        <p style="margin:0 0 12px 0;">Merci. J’ai bien reçu ta demande et je reviens vers toi rapidement.</p>
        <p style="margin:0 0 12px 0;"><strong>Référence :</strong> ${escapeHtml(leadId)}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
        <p style="margin:0 0 6px 0;"><strong>Pack :</strong> ${escapeHtml(payload.pack)} — <strong>Délai :</strong> ${escapeHtml(payload.speed)}</p>
        <p style="margin:0 0 6px 0;"><strong>Destination :</strong> ${escapeHtml(payload.brief.destination)}</p>
        <p style="margin:0;"><strong>Durée :</strong> ${escapeHtml(String(payload.brief.durationDays))} jours — <strong>Voyageurs :</strong> ${escapeHtml(String(payload.brief.travelers))}</p>
      </div>
    `,
    },
    "sendLeadEmails/client",
  );

  const ownerResult = await sendIfRecipient(
    resend,
    {
      from,
      to: ownerTo,
      subject: `Nouveau lead TravelTactik — ${payload.brief.destination}`,
      replyTo: payload.email,
      html: `
      <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5">
        ${ownerModeBanner}
        <h2 style="margin:0 0 8px 0;">Nouveau lead</h2>
        <p style="margin:0 0 6px 0;"><strong>ID :</strong> ${escapeHtml(leadId)}</p>
        <p style="margin:0 0 12px 0;"><strong>Email client :</strong> ${escapeHtml(payload.email)}</p>
        <p style="margin:0 0 12px 0;"><strong>Pack :</strong> ${escapeHtml(payload.pack)}
          — <strong>Délai :</strong> ${escapeHtml(payload.speed)}
          — <strong>Prix :</strong> ${escapeHtml(String(payload.priceEUR))}€
        </p>
      </div>
    `,
    },
    "sendLeadEmails/owner",
  );

  return {
    clientResult,
    ownerResult,
    mode,
    routed: { clientTo, ownerTo, replyToInbox },
  };
}

export async function sendPaymentConfirmedEmails(args: {
  leadId: string;
  email: string;
  destination: string;
  priceEUR: number;
}) {
  const resend = getResend();

  const from = getFrom();
  const ownerEmail = getOwnerEmail();
  const replyToInbox = getReplyTo();

  const mode = getEmailMode();
  const testTo = getTestTo();

  const clientTo = mode === "test" && testTo ? testTo : args.email;
  const ownerTo = mode === "test" && testTo ? testTo : ownerEmail;

  const clientModeBanner = buildModeBanner(mode, args.email, testTo);
  const ownerModeBanner = buildModeBanner(
    mode,
    ownerEmail || "(owner)",
    testTo,
  );

  const clientResult = await sendIfRecipient(
    resend,
    {
      from,
      to: clientTo,
      subject: "TravelTactik — Paiement confirmé ✅",
      replyTo: replyToInbox,
      html: `
      <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.55;color:#111827;max-width:640px;margin:0 auto;">
        ${clientModeBanner}
        <h2 style="margin:0 0 10px 0;font-size:22px;">Paiement confirmé</h2>
        <p style="margin:0 0 12px 0;">Merci pour votre confiance. Votre paiement a bien été reçu.</p>
        <p style="margin:0 0 12px 0;">Nous préparons maintenant votre document <strong>PDF Tarifs</strong>. Sauf imprévu, il sera disponible dans <strong>moins de 24h</strong> dans votre espace client.</p>
      </div>
    `,
    },
    "sendPaymentConfirmedEmails/client",
  );

  const ownerResult = await sendIfRecipient(
    resend,
    {
      from,
      to: ownerTo,
      subject: `Paiement reçu — vérifier et livrer <24h (${escapeHtml(args.leadId)})`,
      replyTo: args.email,
      html: `
      <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.55;color:#111827;max-width:720px;margin:0 auto;">
        ${ownerModeBanner}
        <h2 style="margin:0 0 10px 0;font-size:22px;">Notification de paiement client</h2>
        <p style="margin:0 0 12px 0;">Un client vient de payer son devis. Merci de vérifier la réception du paiement sur Stripe/compte bancaire, puis de déposer le PDF Tarifs en back-office sous 24h.</p>
      </div>
    `,
    },
    "sendPaymentConfirmedEmails/owner",
  );

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

  const clientTo = mode === "test" && testTo ? testTo : args.email;

  const modeBanner = buildModeBanner(mode, args.email, testTo);

  const result = await sendIfRecipient(
    resend,
    {
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
    },
    "sendLeadDeliveredEmail/client",
  );

  return { result, mode, routed: { clientTo, replyToInbox } };
}

export async function sendProfileSummaryEmail(args: {
  email: string;
  profile: {
    favoriteAirport: string;
    transportModes: string[];
    specificities: string;
  };
}) {
  const resend = getResend();

  const from = getFrom();
  const ownerEmail = getOwnerEmail() || "traveltactik@gmail.com";

  const mode = getEmailMode();
  const testTo = getTestTo();

  const ownerTo = mode === "test" && testTo ? testTo : ownerEmail;
  const ownerModeBanner = buildModeBanner(mode, ownerEmail, testTo);

  const result = await sendIfRecipient(
    resend,
    {
      from,
      to: ownerTo,
      subject: `Profil client mis à jour — ${escapeHtml(args.email)}`,
      html: `
      <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5">
        ${ownerModeBanner}
        <h2>Profil client mis à jour</h2>
        <p><strong>Email :</strong> ${escapeHtml(args.email)}</p>
        <p><strong>Aéroport préféré :</strong> ${escapeHtml(args.profile.favoriteAirport || "—")}</p>
        <p><strong>Transports possibles :</strong> ${escapeHtml(args.profile.transportModes.join(", ") || "—")}</p>
        <p><strong>Spécificités :</strong> ${escapeHtml(args.profile.specificities || "—")}</p>
      </div>
    `,
    },
    "sendProfileSummaryEmail/owner",
  );

  return { result, mode, routed: { ownerTo } };
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
