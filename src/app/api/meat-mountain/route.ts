import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { loadRace } from "@/lib/meat-mountain/data";
import { attachHistory, savedRace } from "@/lib/meat-mountain/storage";
export const maxDuration = 60;
const cached = unstable_cache(
  async (week?: number) => loadRace(week),
  ["meat-mountain-v1"],
  { revalidate: 60 },
);
export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get("week");
  const week = input ? Number(input) : undefined;
  if (week !== undefined && (!Number.isInteger(week) || week < 1 || week > 18))
    return NextResponse.json(
      { error: "Choose a week from 1 to 18." },
      { status: 400 },
    );
  try {
    const live = await cached(week);
    const saved = await savedRace(live.season, live.week);
    const race =
      live.phase === "final" && saved?.phase === "final"
        ? { ...saved, updatedAt: live.updatedAt }
        : live;
    return NextResponse.json(await attachHistory(race), {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error(
      "Meat Mountain data:",
      error instanceof Error ? error.message : "Unavailable",
    );
    return NextResponse.json(
      {
        error:
          "Sleeper is taking a breather. Your last standings are kept on screen; try again shortly.",
      },
      { status: 503 },
    );
  }
}
