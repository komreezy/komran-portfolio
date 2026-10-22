#!/usr/bin/env node
// Direct Tortalona document editor — reads/writes the live "Personal Site"
// Supabase DB via the service-role key (sb_secret_...). No admin password /
// editor UI needed; this is the manual editing path.
//
// Usage:
//   node scripts/tortalona-edit.cjs show
//   node scripts/tortalona-edit.cjs set-baseline <playerId> <goals>
//   node scripts/tortalona-edit.cjs add-player   <id> <name> <baselineGoals>
//   node scripts/tortalona-edit.cjs rename       <playerId> <newName>
//   node scripts/tortalona-edit.cjs set-game     <week> '<json: {"ben":2,"saba":1}>'
//   node scripts/tortalona-edit.cjs clear-game   <week>
//
// Writes use compare-and-swap on `revision`; a stale write is rejected so a
// concurrent edit can never be silently overwritten.
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function loadEnv() {
  const file = path.join(__dirname, "..", ".env.local");
  const env = { ...process.env };
  if (fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !(m[1] in process.env)) env[m[1]] = m[2];
    }
  }
  return env;
}

const env = loadEnv();
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(2);
}
const db = createClient(URL, KEY, { auth: { persistSession: false } });

async function getDoc() {
  const { data, error } = await db
    .from("tortalona_document")
    .select("revision,seasons")
    .eq("id", 1)
    .single();
  if (error || !data) throw new Error("read failed: " + (error?.message || "no row"));
  return { revision: data.revision, seasons: data.seasons };
}

async function putDoc(doc) {
  const nextRevision = doc.revision + 1;
  const { data, error } = await db
    .from("tortalona_document")
    .update({ revision: nextRevision, seasons: doc.seasons, updated_at: new Date().toISOString() })
    .eq("id", 1)
    .eq("revision", doc.revision)
    .select("revision")
    .maybeSingle();
  if (error) throw new Error("write failed: " + error.message);
  if (!data) throw new Error("stale write — document changed since it was read; reload and retry");
  return data.revision;
}

function firstSeason(doc) {
  return doc.seasons[0];
}
function player(season, id) {
  return season.players.find((p) => p.id === id);
}

function show(doc) {
  const s = firstSeason(doc);
  console.log(`revision=${doc.revision}  season="${s.name}"  baselineGame=${s.baselineGame}  totalGames=${s.totalGames}`);
  for (const p of s.players) {
    const extra = s.games.reduce((n, g) => n + (g.goals[p.id] || 0), 0);
    console.log(`  ${p.name.padEnd(10)} baseline=${p.baselineGoals}  games6-9=${extra}  total=${p.baselineGoals + extra}`);
  }
  console.log("  recorded games:", s.games.map((g) => `week${g.week}:${JSON.stringify(g.goals)}`).join(" ") || "(none)");
}

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  if (!cmd) { console.error("usage: node scripts/tortalona-edit.cjs <show|set-baseline|add-player|rename|set-game|clear-game> ..."); process.exit(2); }

  const doc = await getDoc();
  const s = firstSeason(doc);

  if (cmd === "show") { show(doc); return; }

  if (cmd === "set-baseline") {
    const [id, goalsStr] = args;
    const goals = Number(goalsStr);
    const p = player(s, id);
    if (!p) throw new Error(`unknown player id "${id}"`);
    if (!Number.isInteger(goals) || goals < 0) throw new Error("baseline goals must be a non-negative integer");
    p.baselineGoals = goals;
    const newRev = await putDoc(doc);
    console.log(`OK — ${p.name} baseline goals -> ${goals} (revision ${newRev})`);
    return;
  }

  if (cmd === "add-player") {
    const [id, name, baselineStr] = args;
    const baseline = baselineStr === undefined ? 0 : Number(baselineStr);
    if (!id || !name) throw new Error("usage: add-player <id> <name> [baselineGoals]");
    if (s.players.some((p) => p.id === id)) throw new Error(`player id "${id}" already exists`);
    if (s.players.some((p) => p.name.trim().toLowerCase() === name.trim().toLowerCase())) throw new Error(`player name "${name}" already exists`);
    if (!Number.isInteger(baseline) || baseline < 0) throw new Error("baseline goals must be a non-negative integer");
    s.players.push({ id, name: name.trim(), baselineGoals: baseline });
    const newRev = await putDoc(doc);
    console.log(`OK — added ${name.trim()} (id=${id}, baseline=${baseline}) (revision ${newRev})`);
    return;
  }

  if (cmd === "rename") {
    const [id, newName] = args;
    const p = player(s, id);
    if (!p) throw new Error(`unknown player id "${id}"`);
    if (!newName) throw new Error("usage: rename <playerId> <newName>");
    if (s.players.some((x) => x.id !== id && x.name.trim().toLowerCase() === newName.trim().toLowerCase())) throw new Error(`name "${newName}" already in use`);
    p.name = newName.trim();
    const newRev = await putDoc(doc);
    console.log(`OK — player "${id}" renamed to ${p.name} (revision ${newRev})`);
    return;
  }

  if (cmd === "set-game" || cmd === "clear-game") {
    const [weekStr, jsonStr] = args;
    const week = Number(weekStr);
    if (!Number.isInteger(week) || week <= s.baselineGame || week > s.totalGames) {
      throw new Error(`week must be ${s.baselineGame + 1}..${s.totalGames}`);
    }
    const existing = s.games.find((g) => g.week === week);
    if (cmd === "clear-game") {
      if (!existing) throw new Error(`no recorded entry for week ${week}`);
      s.games = s.games.filter((g) => g.week !== week);
      const newRev = await putDoc(doc);
      console.log(`OK — cleared week ${week} (revision ${newRev})`);
      return;
    }
    let goals;
    try { goals = JSON.parse(jsonStr); } catch { throw new Error("goals must be valid JSON, e.g. '{\"ben\":2,\"saba\":1}'"); }
    if (typeof goals !== "object" || goals === null || Array.isArray(goals)) throw new Error("goals must be a JSON object");
    for (const [pid, n] of Object.entries(goals)) {
      if (!player(s, pid)) throw new Error(`unknown player id "${pid}"`);
      if (!Number.isInteger(n) || n < 0) throw new Error(`goals for "${pid}" must be a non-negative integer`);
    }
    const entry = { week, goals };
    if (existing) existing.goals = goals; else s.games.push(entry);
    s.games.sort((a, b) => a.week - b.week);
    const newRev = await putDoc(doc);
    console.log(`OK — week ${week} goals ${JSON.stringify(goals)} (revision ${newRev})`);
    return;
  }

  throw new Error(`unknown command "${cmd}"`);
}

main().then(() => process.exit(0)).catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
