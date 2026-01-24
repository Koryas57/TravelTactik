export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../auth";
import { getSql } from "../../../../../lib/db";

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    v,
  );
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase().trim();

  if (!email) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  let body: { offerId?: unknown };
  try {
    body = (await req.json()) as any;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  const offerId = typeof body.offerId === "string" ? body.offerId : "";
  if (!isUuid(offerId)) {
    return NextResponse.json(
      { ok: false, error: "Invalid offerId" },
      { status: 400 },
    );
  }

  const sql = getSql();

  // récup user_id
  const userRows = await sql`
    select id from users where lower(email) = ${email} limit 1;
  `;
  const userId = userRows?.[0]?.id;
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "User not found" },
      { status: 400 },
    );
  }

  // toggle idempotent via CTE
  const rows = await sql`
    with existing as (
      select id from favorites
      where user_id = ${userId}::uuid and offer_id = ${offerId}::uuid
      limit 1
    ),
    del as (
      delete from favorites
      where id in (select id from existing)
      returning id
    ),
    ins as (
      insert into favorites (user_id, offer_id)
      select ${userId}::uuid, ${offerId}::uuid
      where not exists (select 1 from existing)
      on conflict (user_id, offer_id) do nothing
      returning id
    )
    select
      (select count(*) from ins) as inserted,
      (select count(*) from del) as deleted;
  `;

  const inserted = Number(rows?.[0]?.inserted || 0) > 0;
  const deleted = Number(rows?.[0]?.deleted || 0) > 0;

  return NextResponse.json(
    { ok: true, liked: inserted && !deleted },
    { status: 200 },
  );
}
