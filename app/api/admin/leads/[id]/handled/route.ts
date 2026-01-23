export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSql } from "../../../../../../lib/db";

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    v,
  );
}

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;

  if (!isUuid(id)) {
    return NextResponse.json(
      { ok: false, error: "Invalid id" },
      { status: 400 },
    );
  }

  try {
    const sql = getSql();

    // Toggle handled (réversible)
    const rows = await sql`
      update leads
      set handled = not coalesce(handled, false),
          handled_at = case
            when not coalesce(handled, false) then now()
            else null
          end
      where id = ${id}
      returning id, handled, handled_at;
    `;

    return NextResponse.json({ ok: true, row: rows?.[0] }, { status: 200 });
  } catch (err) {
    console.error("[admin/leads/[id]/handled] error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 },
    );
  }
}
