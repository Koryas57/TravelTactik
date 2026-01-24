export const runtime = "nodejs";

import { NextResponse } from "next/server";
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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ leadId: string; docType: string }> },
) {
  const { leadId, docType } = await params;

  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase().trim();

  if (!email) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

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

    // Ownership check
    const leadRows = await sql`
      select id, email
      from leads
      where id = ${leadId}::uuid
      limit 1;
    `;
    const lead = leadRows?.[0];
    if (!lead)
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 },
      );

    if (String(lead.email).toLowerCase().trim() !== email) {
      return NextResponse.json(
        { ok: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // Doc ready + url
    const docRows = await sql`
      select status, url
      from lead_documents
      where lead_id = ${leadId}::uuid
        and doc_type = ${docType}
      limit 1;
    `;
    const doc = docRows?.[0];
    if (!doc)
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 },
      );

    if (doc.status !== "ready" || !doc.url) {
      return NextResponse.json(
        { ok: false, error: "Not ready" },
        { status: 404 },
      );
    }

    // Stream server-side (no redirect => blob URL not exposed)
    const upstream = await fetch(String(doc.url));
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { ok: false, error: "Upstream fetch failed" },
        { status: 502 },
      );
    }

    const filename = `traveltactik-${docType}-${leadId}.pdf`;
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") || "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        // Optionnel: éviter caches partagés
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[app/documents] error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 },
    );
  }
}
