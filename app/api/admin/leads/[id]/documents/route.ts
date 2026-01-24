export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSql } from "../../../../../../lib/db";

type DocType = "tarifs" | "descriptif" | "carnet";
type DocStatus = "pending" | "ready";

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    v,
  );
}

function isDocType(v: unknown): v is DocType {
  return v === "tarifs" || v === "descriptif" || v === "carnet";
}

function isDocStatus(v: unknown): v is DocStatus {
  return v === "pending" || v === "ready";
}

function isSafeHttpUrl(v: string) {
  try {
    const u = new URL(v);
    if (u.protocol !== "https:") return false;
    // option: restreindre à Vercel Blob
    // if (!u.hostname.endsWith("blob.vercel-storage.com")) return false;
    return true;
  } catch {
    return false;
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!isUuid(id)) {
    return NextResponse.json(
      { ok: false, error: "Invalid id" },
      { status: 400 },
    );
  }

  let body: { docType?: unknown; status?: unknown; url?: unknown };
  try {
    body = (await req.json()) as any;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  const docType = body.docType;
  const status = body.status;
  const url = body.url;

  if (!isDocType(docType)) {
    return NextResponse.json(
      { ok: false, error: "Invalid docType" },
      { status: 400 },
    );
  }
  if (!isDocStatus(status)) {
    return NextResponse.json(
      { ok: false, error: "Invalid status" },
      { status: 400 },
    );
  }

  const nextUrl =
    status === "ready"
      ? typeof url === "string" && url.trim().length > 0
        ? url.trim()
        : null
      : null;

  if (status === "ready") {
    if (!nextUrl) {
      return NextResponse.json(
        { ok: false, error: "Missing url for ready document" },
        { status: 400 },
      );
    }
    if (!isSafeHttpUrl(nextUrl)) {
      return NextResponse.json(
        { ok: false, error: "Invalid url" },
        { status: 400 },
      );
    }
  }

  try {
    const sql = getSql();

    // Optionnel mais propre: vérifier que le lead existe
    const lead = await sql`
      select id
      from leads
      where id = ${id}::uuid
      limit 1;
    `;
    if (!lead?.length) {
      return NextResponse.json(
        { ok: false, error: "Lead not found" },
        { status: 404 },
      );
    }

    const rows = await sql`
      insert into lead_documents (lead_id, doc_type, status, url)
      values (${id}::uuid, ${docType}, ${status}, ${nextUrl})
      on conflict (lead_id, doc_type)
      do update set
        status = excluded.status,
        url = excluded.url,
        updated_at = now()
      returning lead_id, doc_type, status, url, updated_at;
    `;

    return NextResponse.json({ ok: true, row: rows?.[0] }, { status: 200 });
  } catch (err) {
    console.error("[admin/leads/:id/documents] error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 },
    );
  }
}
