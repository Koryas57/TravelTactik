export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth";
import { getSql } from "../../../../lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase().trim();

  if (!email) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const sql = getSql();

  const userRows = await sql`
    select id from users where lower(email) = ${email} limit 1;
  `;
  const userId = userRows?.[0]?.id;
  if (!userId) return NextResponse.json({ ok: true, ids: [] }, { status: 200 });

  const favRows = await sql`
    select offer_id
    from favorites
    where user_id = ${userId}::uuid
    order by created_at desc;
  `;

  const ids = favRows.map((r: any) => String(r.offer_id));
  return NextResponse.json({ ok: true, ids }, { status: 200 });
}
