import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { leagueOwners, saveOwnerNames } from "@/lib/meat-mountain/owners";

function authorized(request: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  const token = request.headers.get("x-admin-token");
  return !!expected && !!token && timingSafeEqual(
    createHash("sha256").update(expected).digest(), createHash("sha256").update(token).digest(),
  );
}
export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Incorrect admin password." }, { status: 401 });
  try {
    return NextResponse.json(await leagueOwners(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Couldn’t load owners." }, { status: 503 });
  }
}
export async function PUT(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Incorrect admin password." }, { status: 401 });
  let input: unknown;
  try { input = await request.json(); } catch {
    return NextResponse.json({ error: "Send a list of owner names." }, { status: 400 });
  }
  if (!Array.isArray(input) || !input.length || input.length > 20 || input.some((owner) =>
    !owner || typeof owner.userId !== "string" || !/^\d{10,25}$/.test(owner.userId) ||
    typeof owner.name !== "string" || owner.name.trim().length > 40 || /[\x00-\x1f]/.test(owner.name)
  ) || new Set(input.map((owner) => owner.userId)).size !== input.length) {
    return NextResponse.json({ error: "Use unique league owners and names of up to 40 characters." }, { status: 400 });
  }
  try {
    const known = new Set((await leagueOwners()).map((owner) => owner.userId));
    if (input.some((owner) => !known.has(owner.userId)))
      return NextResponse.json({ error: "An owner is not in this league. Reload the owner list." }, { status: 400 });
    await saveOwnerNames(input);
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Couldn’t save names." }, { status: 503 });
  }
}
