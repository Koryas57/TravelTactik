export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSql } from "../../../lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") || "50"), 200);

    const sql = getSql();
    const rows = await sql`
      select id, slug, title, destination, image_url, price_from_eur, duration_days, tags, meta, created_at
      from offers
      order by created_at desc
      limit ${limit};
    `;

    return NextResponse.json({ ok: true, rows }, { status: 200 });
  } catch (err) {
    console.error("[api/offers] error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 },
    );
  }
}
