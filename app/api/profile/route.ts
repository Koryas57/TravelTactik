export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth";
import { getSql } from "../../../lib/db";
import { sendProfileSummaryEmail } from "../../../lib/mailer";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase().trim();

  if (!email) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const form = await req.formData();
  const favoriteAirport = String(form.get("favoriteAirport") || "").trim();
  const transportModes = form.getAll("transportModes").map((v) => String(v));
  const specificities = String(form.get("specificities") || "").trim();

  const profile = {
    favoriteAirport,
    transportModes,
    specificities,
  };

  const sql = getSql();

  const rows = await sql`
    select id from users where lower(email) = ${email} limit 1;
  `;

  const userId = rows?.[0]?.id;
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "User not found" },
      { status: 404 },
    );
  }

  await sql`
    insert into user_profiles (user_id, email, profile, updated_at)
    values (${userId}::uuid, ${email}, ${JSON.stringify(profile)}::jsonb, now())
    on conflict (user_id)
    do update set
      email = excluded.email,
      profile = excluded.profile,
      updated_at = now();
  `;

  await sendProfileSummaryEmail({
    email,
    profile,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
