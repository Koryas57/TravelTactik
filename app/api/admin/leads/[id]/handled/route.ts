export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSql } from "../../../../../../lib/db";

function isUuid(v: unknown): v is string {
  return (
    typeof v === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
  );
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!isUuid(id)) {
    return NextResponse.json(
      { ok: false, error: "Invalid id" },
      { status: 400 },
    );
  }

  try {
    const sql = getSql();
    const rows = await sql`
      update leads
      set handled = true,
          handled_at = now()
      where id = ${id}
      returning id, handled, handled_at;
    `;
    return NextResponse.json({ ok: true, row: rows?.[0] }, { status: 200 });
  } catch (err) {
    console.error("[admin/leads/handled] error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 },
    );
  }
}
