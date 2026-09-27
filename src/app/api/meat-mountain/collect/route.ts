import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { loadRace } from "@/lib/meat-mountain/data";
import { saveRace } from "@/lib/meat-mountain/storage";
export const maxDuration = 60;
export async function GET(request: NextRequest) {
  const wanted = process.env.MEAT_MOUNTAIN_CRON_SECRET;
  const received = request.headers
    .get("authorization")
    ?.replace(/^Bearer /, "");
  if (
    !wanted ||
    !received ||
    wanted.length !== received.length ||
    !timingSafeEqual(Buffer.from(wanted), Buffer.from(received))
  )
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const race = await loadRace(undefined, true);
    await saveRace(race);
    return NextResponse.json({
      ok: true,
      week: race.week,
      phase: race.phase,
      at: race.updatedAt,
    });
  } catch (error) {
    console.error(
      "Snapshot collection failed:",
      error instanceof Error ? error.message : "Unknown",
    );
    return NextResponse.json({ error: "Collection failed" }, { status: 500 });
  }
}
