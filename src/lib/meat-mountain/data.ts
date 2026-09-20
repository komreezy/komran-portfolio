import { COLORS, type Climber, type ClimberPlayer, type Race } from "./types";
import { forecast, probabilities, score, playerSigma } from "./model";
const ROOT = "https://api.sleeper.app";
export const LEAGUE = "1341855945424117760";
type Stats = {
  player_id: string;
  stats: Record<string, number>;
  team: string;
  game_id: string;
  date: string;
  player?: {
    first_name: string;
    last_name: string;
    position: string;
    injury_status?: string;
    team: string;
  };
};
type Game = {
  id: string;
  team: string;
  progress: number;
  state: "active" | "remaining" | "finished";
  kickoff: string | null;
  detail: string;
};
async function get<T>(url: string, ttl = 60): Promise<T> {
  const r = await fetch(url, {
    next: { revalidate: ttl },
    signal: AbortSignal.timeout(18000),
  });
  if (!r.ok) throw new Error(`Data source returned ${r.status}`);
  return r.json();
}
let varianceCache:
  | {
      key: string;
      data: Map<string, { value: number; weight: number }[]>;
      at: number;
    }
  | undefined;
async function histories(
  season: number,
  week: number,
  scoring: Record<string, number>,
) {
  const key = `${season}-${week}`;
  if (varianceCache?.key === key && Date.now() - varianceCache.at < 86400000)
    return varianceCache.data;
  const urls = [
    ...Array.from({ length: 18 }, (_, i) => ({
      season: season - 1,
      week: i + 1,
    })),
    ...Array.from({ length: week - 1 }, (_, i) => ({ season, week: i + 1 })),
  ];
  const data = new Map<string, { value: number; weight: number }[]>();
  let successful = 0;
  for (let i = 0; i < urls.length; i += 6)
    await Promise.all(
      urls.slice(i, i + 6).map(async (u) => {
        try {
          const rows = await get<Stats[]>(
            `${ROOT}/stats/nfl/${u.season}/${u.week}?season_type=regular`,
            86400,
          );
          if (!Array.isArray(rows)) return;
          successful++;
          rows.forEach((r) => {
            if (!r.stats || !(r.stats.gp || r.stats.gms_active)) return;
            const arr = data.get(r.player_id) || [];
            arr.push({
              value: score(r.stats, scoring),
              weight: Math.pow(0.96, (season - u.season) * 18 + week - u.week),
            });
            data.set(r.player_id, arr);
          });
        } catch {
          /* Position prior remains available. */
        }
      }),
    );
  if (!successful) throw new Error("Historical stats unavailable");
  varianceCache = { key, data, at: Date.now() };
  return data;
}
function teamAlias(team: string) {
  return (
    ({ WSH: "WAS", JAC: "JAX", LA: "LAR" } as Record<string, string>)[team] ||
    team
  );
}
export async function loadRace(requestedWeek?: number): Promise<Race> {
  const [league, state, users, rosters] = await Promise.all([
    get<{
      name: string;
      season: string;
      scoring_settings: Record<string, number>;
    }>(`${ROOT}/v1/league/${LEAGUE}`, 3600),
    get<{ week: number; season: string }>(`${ROOT}/v1/state/nfl`, 60),
    get<
      {
        user_id: string;
        display_name: string;
        avatar: string | null;
        metadata?: { team_name?: string; avatar?: string };
      }[]
    >(`${ROOT}/v1/league/${LEAGUE}/users`, 3600),
    get<
      {
        roster_id: number;
        owner_id: string;
        settings?: { fpts_against?: number; fpts_against_decimal?: number };
      }[]
    >(`${ROOT}/v1/league/${LEAGUE}/rosters`, 60),
  ]);
  const season = Number(league.season),
    currentWeek =
      state.season === league.season
        ? Math.max(1, Math.min(18, state.week))
        : 18;
  const week = Math.max(1, Math.min(currentWeek, requestedWeek || currentWeek));
  const warnings: string[] = [];
  const [matches, projectionRows, schedule, scoreboard, history] =
    await Promise.all([
      get<
        {
          roster_id: number;
          points: number;
          custom_points: number | null;
          starters: string[];
          starters_points: number[];
          players_points: Record<string, number>;
        }[]
      >(`${ROOT}/v1/league/${LEAGUE}/matchups/${week}`),
      get<Stats[]>(
        `${ROOT}/projections/nfl/${season}/${week}?season_type=regular`,
        300,
      ),
      get<
        {
          home: string;
          away: string;
          status: string;
          week: number;
          game_id: string;
          date: string;
        }[]
      >(`${ROOT}/schedule/nfl/regular/${season}`, 60),
      get<{
        events: {
          id: string;
          date: string;
          status: {
            clock: number;
            period: number;
            type: { state: string; completed: boolean; shortDetail: string };
          };
          competitions: { competitors: { team: { abbreviation: string } }[] }[];
        }[];
      }>(
        `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${season}&seasontype=2&week=${week}`,
        60,
      ).catch(() => {
        warnings.push(
          "Game clocks are unavailable; active-game projections are less precise.",
        );
        return { events: [] };
      }),
      histories(season, week, league.scoring_settings).catch(() => {
        warnings.push(
          "Historical variance is unavailable; using position estimates.",
        );
        return new Map<string, { value: number; weight: number }[]>();
      }),
    ]);
  const games = new Map<string, Game>();
  for (const e of scoreboard.events || []) {
    const s = e.status;
    const progress = s.type.completed
      ? 1
      : s.type.state === "pre"
        ? 0
        : s.period > 4
          ? 0.98
          : Math.min(
              0.99,
              Math.max(0.01, ((s.period - 1) * 900 + 900 - s.clock) / 3600),
            );
    for (const c of e.competitions[0]?.competitors || [])
      games.set(teamAlias(c.team.abbreviation), {
        id: e.id,
        team: teamAlias(c.team.abbreviation),
        progress,
        state: s.type.completed
          ? "finished"
          : s.type.state === "pre"
            ? "remaining"
            : "active",
        kickoff: e.date,
        detail: s.type.shortDetail,
      });
  }
  for (const s of schedule.filter((g) => g.week === week))
    for (const t of [s.home, s.away])
      if (!games.has(teamAlias(t)))
        games.set(teamAlias(t), {
          id: s.game_id,
          team: t,
          progress:
            s.status === "complete" ? 1 : s.status === "in_game" ? 0.5 : 0,
          state:
            s.status === "complete"
              ? "finished"
              : s.status === "in_game"
                ? "active"
                : "remaining",
          kickoff: null,
          detail:
            s.status === "in_game"
              ? "Live · clock unavailable"
              : s.status === "complete"
                ? "Final"
                : "Scheduled",
        });
  const projections = new Map<string, Stats>();
  for (const row of projectionRows)
    if (!projections.has(row.player_id)) projections.set(row.player_id, row);
  const allDone =
    games.size > 0 && [...games.values()].every((g) => g.state === "finished");
  let missing = 0;
  const teams: Climber[] = matches.map((m) => {
    const roster = rosters.find((r) => r.roster_id === m.roster_id),
      user = users.find((u) => u.user_id === roster?.owner_id);
    const players: ClimberPlayer[] = (m.starters || []).map((id, index) => {
      const p = projections.get(id),
        pos = p?.player?.position || (id.length <= 3 ? "DEF" : "FLEX");
      const game = games.get(teamAlias(p?.team || ""));
      const actual = m.starters_points?.[index] ?? m.players_points?.[id] ?? 0;
      const out =
        id === "0" ||
        ["Out", "IR", "PUP", "Sus"].includes(p?.player?.injury_status || "");
      const progress = allDone || out ? 1 : (game?.progress ?? 0);
      const baseline = p ? score(p.stats, league.scoring_settings) : 0;
      if (!p && id !== "0") missing++;
      return {
        id,
        name:
          id === "0"
            ? "Empty lineup spot"
            : p?.player
              ? `${p.player.first_name} ${p.player.last_name}`
              : id,
        position: pos,
        team: p?.team || "",
        actual,
        baseline,
        projected: out ? actual : forecast(actual, baseline, progress, pos),
        sigma:
          out || (!p && !game)
            ? 0
            : playerSigma(pos, history.get(id) || [], progress),
        state: out ? "out" : allDone ? "finished" : game?.state || "remaining",
        game: game?.id || id,
        kickoff: game?.kickoff || null,
        progress,
        note: out ? "Inactive" : !p ? "Projection unavailable" : game?.detail,
      };
    });
    const actual = m.custom_points ?? m.points ?? 0,
      adjustment = actual - players.reduce((s, p) => s + p.actual, 0);
    return {
      id: m.roster_id,
      name:
        user?.metadata?.team_name ||
        user?.display_name ||
        `Team ${m.roster_id}`,
      owner: user?.display_name || "",
      avatar:
        user?.metadata?.avatar ||
        (user?.avatar
          ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}`
          : null),
      color: COLORS[(m.roster_id - 1) % COLORS.length],
      actual,
      projected: players.reduce((s, p) => s + p.projected, 0) + adjustment,
      high: 0,
      low: 0,
      pointsAgainst:
        (roster?.settings?.fpts_against || 0) +
        (roster?.settings?.fpts_against_decimal || 0) / 100,
      active: players.filter((p) => p.state === "active").length,
      remaining: players.filter((p) => p.state === "remaining").length,
      players,
    };
  });
  if (missing)
    warnings.push(
      `${missing} starter projection${missing > 1 ? "s" : ""} unavailable; probabilities may be understated.`,
    );
  probabilities(teams, season * 100 + week);
  const dates = [...games.values()]
    .map((g) => g.kickoff)
    .filter((x): x is string => !!x)
    .sort();
  return {
    league: league.name,
    season,
    week,
    currentWeek,
    updatedAt: new Date().toISOString(),
    phase: allDone
      ? "final"
      : teams.some(
            (t) =>
              t.active > 0 || t.players.some((p) => p.state === "finished"),
          )
        ? "live"
        : "pregame",
    teams,
    history: [],
    historyAvailable: false,
    warnings,
    start: dates[0] || null,
    end: dates.length
      ? new Date(
          new Date(dates.at(-1)!).getTime() + 3.5 * 3600000,
        ).toISOString()
      : null,
    model: `Tempered estimates · ${season - 1}–${season} variance · 5,000 simulations`,
  };
}
