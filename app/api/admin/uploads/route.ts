export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

type DocType = "tarifs" | "descriptif" | "carnet";

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    v,
  );
}

function isDocType(v: unknown): v is DocType {
  return v === "tarifs" || v === "descriptif" || v === "carnet";
}

function safeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const file = form.get("file");
    const leadId = String(form.get("leadId") || "");
    const docType = form.get("docType");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Missing file" },
        { status: 400 },
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

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { ok: false, error: "Only PDF allowed" },
        { status: 400 },
      );
    }

    // 25 MB (ajuste si besoin)
    const MAX = 25 * 1024 * 1024;
    if (file.size > MAX) {
      return NextResponse.json(
        { ok: false, error: "File too large" },
        { status: 413 },
      );
    }

    const original = file.name || "document.pdf";
    const base = safeFilename(
      original.toLowerCase().endsWith(".pdf") ? original : `${original}.pdf`,
    );

    const pathname = `traveltactik/leads/${leadId}/${docType}/${Date.now()}_${base}`;

    // Vercel Blob: access "public" uniquement (pas de "private" via put)
    const blob = await put(pathname, file, {
      access: "public",
      contentType: "application/pdf",
    });

    return NextResponse.json(
      {
        ok: true,
        url: blob.url,
        pathname: blob.pathname,
        downloadUrl: blob.downloadUrl,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("[admin/uploads] error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 },
    );
  }
}
