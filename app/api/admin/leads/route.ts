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
    l.id,
    l.email,
    l.pack,
    l.speed,
    l.price_eur,
    l.brief,
    l.payment_status,
    l.created_at,
    l.paid_at,
    l.handled,
    l.handled_at,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'doc_type', d.doc_type,
          'status', d.status,
          'url', d.url
        )
        order by d.doc_type asc
      ) filter (where d.id is not null),
      '[]'::jsonb
    ) as documents
  from leads l
  left join lead_documents d on d.lead_id = l.id
  where
    (${status}::text is null or l.payment_status = ${status})
    and (${handled}::boolean is null or l.handled = ${handled})
  group by l.id
  order by l.created_at desc
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
