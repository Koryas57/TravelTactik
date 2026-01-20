export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSql } from "../../../../lib/db";

function parseBool(v: string | null) {
  if (v === null) return null;
  if (v === "true") return true;
  if (v === "false") return false;
  return null;
}

export async function GET(req: Request) {
  try {
    const sql = getSql();
    const url = new URL(req.url);

    const status = url.searchParams.get("status"); // paid|pending|null
    const handled = parseBool(url.searchParams.get("handled")); // true|false|null
    const limitRaw = url.searchParams.get("limit");
    const limit = Math.min(Math.max(Number(limitRaw || 50), 1), 200);

    const rows = await sql`
      select
        id,
        email,
        pack,
        speed,
        price_eur,
        brief,
        payment_status,
        created_at,
        paid_at,
        handled,
        handled_at
      from leads
      where
        (${status}::text is null or payment_status = ${status})
        and (${handled}::boolean is null or handled = ${handled})
      order by created_at desc
      limit ${limit};
    `;

    return NextResponse.json({ ok: true, rows }, { status: 200 });
  } catch (err) {
    console.error("[admin/leads] error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 },
    );
  }
}
