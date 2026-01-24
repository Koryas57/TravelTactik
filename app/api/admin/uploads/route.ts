export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Missing file" },
        { status: 400 },
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { ok: false, error: "Only PDF allowed" },
        { status: 400 },
      );
    }

    const safeName = (
      form.get("name")?.toString() ||
      file.name ||
      "document.pdf"
    ).replace(/[^a-zA-Z0-9._-]/g, "_");

    // Stockage public par défaut chez Blob (OK car accès final filtré via ta route /api/app/documents)
    // Si tu veux du privé strict, on passera à signed URLs plus tard.
    const blob = await put(`traveltactik/${Date.now()}_${safeName}`, file, {
      access: "public",
      contentType: "application/pdf",
    });

    return NextResponse.json({ ok: true, url: blob.url }, { status: 200 });
  } catch (err) {
    console.error("[admin/uploads] error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 },
    );
  }
}
