import { createClient } from "@supabase/supabase-js";
import { LEAGUE } from "./data";
import type { Race } from "./types";

export interface LeagueOwner {
  userId: string;
  username: string;
  team: string;
  name: string;
}
function client(write = false) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = write ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
}
async function names() {
  const db = client();
  if (!db) throw new Error("Owner name storage is unavailable.");
  const { data, error } = await db.from("meat_mountain_owners")
    .select("user_id,name").eq("league_id", LEAGUE);
  if (error) throw new Error("Owner name storage is unavailable.");
  return new Map<string, string>((data || []).map((row) => [row.user_id, row.name]));
}
export async function attachOwnerNames(race: Race): Promise<Race> {
  try {
    const overrides = await names();
    return { ...race, teams: race.teams.map((team) => ({ ...team,
      owner: (team.ownerId && overrides.get(team.ownerId)) || team.ownerUsername || team.owner,
    })) };
  } catch {
    // Live standings remain available even when the optional name store is down.
    return race;
  }
}
export async function leagueOwners(): Promise<LeagueOwner[]> {
  const response = await fetch(`https://api.sleeper.app/v1/league/${LEAGUE}/users`, {
    next: { revalidate: 3600 }, signal: AbortSignal.timeout(18000),
  });
  if (!response.ok) throw new Error("Sleeper’s owner list is unavailable. Try again.");
  const users: { user_id: string; display_name: string; metadata?: { team_name?: string } }[] = await response.json();
  const overrides = await names();
  return users.map((user) => ({ userId: user.user_id, username: user.display_name,
    team: user.metadata?.team_name || user.display_name, name: overrides.get(user.user_id) || "" }));
}
export async function saveOwnerNames(owners: { userId: string; name: string }[]) {
  const db = client(true);
  if (!db) throw new Error("Owner name storage is unavailable.");
  const { error } = await db.from("meat_mountain_owners").upsert(owners.map((owner) => ({
    league_id: LEAGUE, user_id: owner.userId, name: owner.name.trim(), updated_at: new Date().toISOString(),
  })), { onConflict: "league_id,user_id" });
  if (error) throw new Error("Couldn’t save names. Your edits are still here; try again.");
}
