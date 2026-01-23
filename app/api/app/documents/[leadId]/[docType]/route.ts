export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../auth";
import { getSql } from "../../../../../../lib/db";

type DocType = "tarifs" | "descriptif" | "carnet";

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    v,
  );
}

function isDocType(v: string): v is DocType {
  return v === "tarifs" || v === "descriptif" || v === "carnet";
}

type Ctx = { params: Promise<{ leadId: string; docType: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase().trim();

  if (!email) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { leadId, docType } = await ctx.params;

  if (!isUuid(leadId)) {
    return NextResponse.json(
      { ok: false, error: "Invalid leadId" },
      { status: 400 },
    );
  }
  if (!isDocType(docType)) {
    return NextResponse.json(
      { ok: false, error: "Invalid docType" },
      { status: 400 },
    );
  }

  try {
    const sql = getSql();

    // 1) Ownership: lead.email doit matcher la session
    const leadRows = await sql`
      select id, email, payment_status
      from leads
      where id = ${leadId}::uuid
      limit 1;
    `;
    const lead = leadRows?.[0];
    if (!lead) {
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 },
      );
    }

    if (String(lead.email).toLowerCase().trim() !== email) {
      return NextResponse.json(
        { ok: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // 2) Doc doit être ready + url
    const docRows = await sql`
      select status, url
      from lead_documents
      where lead_id = ${leadId}::uuid
        and doc_type = ${docType}
      limit 1;
    `;
    const doc = docRows?.[0];
    if (!doc) {
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 },
      );
    }

    if (doc.status !== "ready" || !doc.url) {
      return NextResponse.json(
        { ok: false, error: "Not ready" },
        { status: 404 },
      );
    }

    // 3) Redirect vers l’URL (plus tard: signed URL)
    return NextResponse.redirect(doc.url, { status: 302 });
  } catch (err) {
    console.error("[app/documents/:leadId/:docType] error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 },
    );
  }
}
