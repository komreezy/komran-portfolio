import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, unstable_cache } from "next/cache";
import { loadRace } from "@/lib/meat-mountain/data";
import { attachHistory, savedRace } from "@/lib/meat-mountain/storage";
import { attachOwnerNames } from "@/lib/meat-mountain/owners";
export const maxDuration = 60;
const CACHE_TAG = "meat-mountain-live";
const pending = new Map<string, Promise<Awaited<ReturnType<typeof loadRace>>>>();
function freshRace(week?: number) {
  const key = String(week || "current");
  const existing = pending.get(key);
  if (existing) return existing;
  const result = loadRace(week, true).finally(() => pending.delete(key));
  pending.set(key, result);
  return result;
}
const cached = unstable_cache(
  // Minute buckets expire by key, so polling waits for new data rather than
  // repeatedly receiving a stale-while-revalidate response.
  async (week: number | undefined, minute: number) => {
    void minute;
    return freshRace(week);
  },
  ["meat-mountain-v2"],
  { revalidate: 120, tags: [CACHE_TAG] },
);
async function respond(request: NextRequest, fresh: boolean) {
  const input = request.nextUrl.searchParams.get("week");
  const week = input ? Number(input) : undefined;
  if (week !== undefined && (!Number.isInteger(week) || week < 1 || week > 18))
    return NextResponse.json(
      { error: "Choose a week from 1 to 18." },
      { status: 400 },
    );
  try {
    const live = fresh
      ? await freshRace(week)
      : await cached(week, Math.floor(Date.now() / 60000));
    if (fresh) revalidateTag(CACHE_TAG, { expire: 0 });
    const saved = await savedRace(live.season, live.week);
    const race =
      live.phase === "final" && saved?.phase === "final"
        ? { ...saved, updatedAt: live.updatedAt, teams: saved.teams.map((team) => {
            const current = live.teams.find((climber) => climber.id === team.id);
            return current ? { ...team, name: current.name, avatar: current.avatar,
              owner: current.owner, ownerId: current.ownerId, ownerUsername: current.ownerUsername } : team;
          }) }
        : live;
    return NextResponse.json(await attachOwnerNames(await attachHistory(race)), {
      headers: {
        "Cache-Control": "no-store",
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

export async function GET(request: NextRequest) {
  return respond(request, false);
}
// POST is never served by the CDN or browser cache. It reads current scores
// before responding; only the authenticated collector writes snapshots.
export async function POST(request: NextRequest) {
  return respond(request, true);
}
