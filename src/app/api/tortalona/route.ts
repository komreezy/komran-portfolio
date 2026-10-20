import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { readTortalonaDocument, writeTortalonaDocument } from "@/lib/tortalona/storage";
import { validateTortalonaDocument } from "@/lib/tortalona/validation";

const MAX_BODY_BYTES = 256 * 1024;

function authorized(request: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  const token = request.headers.get("x-admin-token");
  if (!expected || !token) return false;
  return timingSafeEqual(createHash("sha256").update(expected).digest(), createHash("sha256").update(token).digest());
}

function unavailable() {
  return NextResponse.json({ error: "Tortalona data is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: NextRequest) {
  const admin = request.nextUrl.searchParams.get("admin") === "1";
  if (admin && !authorized(request)) {
    return NextResponse.json({ error: "Incorrect admin password." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  try {
    const document = await readTortalonaDocument();
    return NextResponse.json(document, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return unavailable();
  }
}

export async function PUT(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Incorrect admin password." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  let input: unknown;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "The document is too large." }, { status: 413, headers: { "Cache-Control": "no-store" } });
    }
    input = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Send a valid Tortalona document." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  const validated = validateTortalonaDocument(input);
  if (!validated.value) {
    return NextResponse.json({ error: validated.error }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  try {
    const saved = await writeTortalonaDocument(validated.value);
    if (!saved) return NextResponse.json({ error: "This document changed since you loaded it. Reload before saving." }, { status: 409, headers: { "Cache-Control": "no-store" } });
    return NextResponse.json(saved, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return unavailable();
  }
}
