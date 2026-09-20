import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import type { Race, Snapshot } from "./types";
function db(write = false) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = write
      ? process.env.SUPABASE_SERVICE_ROLE_KEY
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key
    ? createClient(url, key, { auth: { persistSession: false } })
    : null;
}
export async function savedRace(
  season: number,
  week: number,
): Promise<Race | null> {
  const client = db();
  if (!client) return null;
  const { data } = await client
    .from("meat_mountain_weeks")
    .select("payload")
    .eq("season", season)
    .eq("week", week)
    .maybeSingle();
  return data?.payload || null;
}
export async function attachHistory(race: Race) {
  const client = db();
  if (!client) return race;
  const history: Snapshot[] = [];
  for (let offset = 0; offset < 10000; offset += 1000) {
    const { data, error } = await client
      .from("meat_mountain_snapshots")
      .select("at,teams,events")
      .eq("season", race.season)
      .eq("week", race.week)
      .order("at", { ascending: true })
      .range(offset, offset + 999);
    if (error) return { ...race, historyAvailable: false };
    history.push(...((data || []) as Snapshot[]));
    if (!data || data.length < 1000) break;
  }
  return { ...race, history, historyAvailable: true };
}
export async function saveRace(race: Race) {
  const client = db(true);
  if (!client) throw new Error("Snapshot storage is not configured");
  const teams = race.teams.map(
    ({ id, actual, projected, high, low, active, remaining }) => ({
      id,
      actual,
      projected: Math.round(projected * 100) / 100,
      high: Math.round(high * 1000) / 1000,
      low: Math.round(low * 1000) / 1000,
      active,
      remaining,
    }),
  );
  const hash = createHash("sha256").update(JSON.stringify(teams)).digest("hex");
  const { error } = await client.rpc("record_meat_mountain", {
    p_season: race.season,
    p_week: race.week,
    p_at: race.updatedAt,
    p_payload: { ...race, history: [] },
    p_teams: teams,
    p_hash: hash,
  });
  if (error) throw new Error(error.message);
}
