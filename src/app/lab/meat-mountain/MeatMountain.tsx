"use client";
/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Climber, Race, Snapshot } from "@/lib/meat-mountain/types";
import "./mountain.css";
// Keep replay available to restore later while history collection continues.
const REPLAY_ENABLED = false;
const n = (x: number) => x.toFixed(1),
  pct = (x: number) =>
    x === 0 ? "0%" : x < 0.01 ? "<1%" : `${Math.round(x * 100)}%`;
function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "mountain" ? (
        <>
          <path d="m2 20 8-16 5 10 3-6 4 12H2Z" />
          <path d="m7 10 3 2 2-2" />
        </>
      ) : name === "chart" ? (
        <>
          <path d="M3 3v18h18M6 15l4-5 4 2 6-8" />
        </>
      ) : name === "crown" ? (
        <path d="m3 6 5 4 4-7 4 7 5-4-2 13H5L3 6Zm2 10h14" />
      ) : name === "danger" ? (
        <>
          <path d="m12 3 10 18H2L12 3Z" />
          <path d="M12 9v5m0 3h.01" />
        </>
      ) : name === "back" ? (
        <path d="m14 5-7 7 7 7M7 12h14" />
      ) : name === "play" ? (
        <path d="m8 4 12 8-12 8V4Z" />
      ) : name === "pause" ? (
        <path d="M8 4v16M16 4v16" />
      ) : name === "restart" ? (
        <>
          <path d="M4 10a8 8 0 1 1 1 8M4 4v6h6" />
        </>
      ) : name === "close" ? (
        <path d="m6 6 12 12M18 6 6 18" />
      ) : (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 10v7m0-10h.01" />
        </>
      )}
    </svg>
  );
}
function Avatar({ team }: { team: Climber }) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className="mm-avatar"
      style={{ borderColor: team.color, backgroundColor: team.color }}
    >
      {team.avatar && !failed ? (
        <img src={team.avatar} alt="" onError={() => setFailed(true)} />
      ) : (
        <span>{team.name.slice(0, 2).toUpperCase()}</span>
      )}
    </span>
  );
}
function Mountain({
  teams,
  selected,
  choose,
}: {
  teams: Climber[];
  selected: number | null;
  choose: (id: number) => void;
}) {
  const mountainRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 900, height: 780, marker: 94, avatar: 36 });
  useEffect(() => {
    const element = mountainRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
        marker: Math.max(65, ...Array.from(element.querySelectorAll('.mm-hiker'), (node) => node.getBoundingClientRect().width)),
        avatar: element.querySelector('.mm-avatar')?.getBoundingClientRect().width || 36,
      }),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const placed: { x: number; y: number }[] = [];
  const positions = [...teams]
    .sort((a, b) => b.projected - a.projected)
    .map((t) => {
      const altitude = Math.max(0, Math.min(180, t.projected)) / 180;
      const y = 91 - 83 * altitude;
      // Trace the illustrated mountain face in image percentages. The image
      // stretches with this container, so these bounds also track phone layouts.
      const contours = [
        [8, 71, 73], [15, 65, 78], [22, 61, 81],
        [28, 57, 85], [33, 47, 87], [40, 43, 90],
        [50, 39, 94], [60, 30, 96], [75, 20, 96], [91, 8, 95],
      ];
      const next = contours.findIndex(([height]) => height >= y);
      const lower = contours[Math.max(0, next - 1)];
      const upper = contours[Math.max(0, next)];
      const fraction = upper[0] === lower[0] ? 0 : (y - lower[0]) / (upper[0] - lower[0]);
      const left = lower[1] + (upper[1] - lower[1]) * fraction;
      const right = lower[2] + (upper[2] - lower[2]) * fraction;
      // CSS centers the entire avatar + score button. Account for its offset
      // so the avatar itself stays over rock, rather than just the label.
      const offset = ((size.marker - size.avatar) / 2 - 3) / size.width * 100;
      const padding = Math.min((size.avatar / 2 + 3) / size.width * 100, (right - left) / 2);
      const min = left + padding + offset;
      const max = Math.max(min, Math.min(right - padding + offset, 100 - size.marker / 2 / size.width * 100 - 1));
      const preferred = Math.max(min, Math.min(max, 18 + 53 * altitude + offset));
      const candidates = Array.from({ length: 101 }, (_, i) => min + (max - min) * i / 100)
        .sort((a, b) => Math.abs(a - preferred) - Math.abs(b - preferred));
      const width = ((size.marker + 5) / size.width) * 100,
        height = ((size.avatar + 9) / size.height) * 100;
      const x =
        candidates.find(
          (cx) =>
            !placed.some(
              (p) => Math.abs(p.y - y) < height && Math.abs(p.x - cx) < width,
            ),
        ) ??
        candidates.reduce((best, cx) => {
          // When a dense pack cannot fit, minimize overlap inside the mountain
          // instead of sending a team into the sky or falsifying its altitude.
          const overlap = (value: number) => placed.reduce((total, p) => total +
            Math.max(0, height - Math.abs(p.y - y)) * Math.max(0, width - Math.abs(p.x - value)), 0);
          return overlap(cx) < overlap(best) ? cx : best;
        }, candidates[0]);
      placed.push({ x, y });
      return { id: t.id, x, y };
    });
  return (
    <div
      ref={mountainRef}
      className="mm-mountain"
      aria-label="Mountain altitude represents projected final points from zero to 180"
    >
      <img
        className="mm-landscape"
        src="/lab/meat-mountain/mountain.png"
        alt="An engraved alpine mountain with a winding trail, a mountainside Arby’s, and a golden summit flag"
      />
      <div className="mm-altitudes" aria-hidden="true">
        {[0, 30, 60, 90, 120, 150, 180].map((p) => (
          <div key={p} style={{ top: `${91 - (p / 180) * 83}%` }}>
            <span>{p}</span>
            <i />
          </div>
        ))}
      </div>
      <span className="mm-summit-note">
        180 PTS
        <br />
        <small>THE SUMMIT</small>
      </span>
      {teams.map((t, index) => {
        const p = positions.find((p) => p.id === t.id)!;
        return (
          <button
            key={t.id}
            className={`mm-hiker ${selected === t.id ? "selected" : ""} ${index === 0 ? "leader" : index === teams.length - 1 ? "last" : ""} ${p.x > 65 ? "right-side" : ""}`}
            style={
              {
                left: `${p.x}%`,
                top: `${p.y}%`,
                "--team": t.color,
              } as React.CSSProperties
            }
            onClick={() => choose(t.id)}
            aria-label={`${t.name}, ${n(t.projected)} projected points, ${pct(t.high)} highest, ${pct(t.low)} lowest`}
            title={`${t.name} · ${n(t.projected)} projected`}
          >
            {(index === 0 || index === teams.length - 1) && (
              <span className="mm-hiker-marker">
                <Icon name={index === 0 ? "crown" : "danger"} size={16} />
              </span>
            )}
            <Avatar team={t} />
            <span className="mm-hiker-score">{n(t.projected)}</span>
            <span className="mm-hiker-name">{t.name}</span>
          </button>
        );
      })}
      <div className="mm-compass" aria-hidden="true">
        <span>N</span>
        <svg viewBox="0 0 60 60">
          <path
            d="M30 2 35 25 58 30 35 35 30 58 25 35 2 30 25 25Z"
            fill="none"
            stroke="currentColor"
          />
          <path
            d="m30 2 5 23-5 5Z M58 30l-23 5-5-5Z M30 58l-5-23 5-5Z M2 30l23-5 5 5Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div className="mm-map-caption">
        Altitude = projected final points <span>·</span> Summit capped at 180
      </div>
    </div>
  );
}
function Timeline({
  race,
  teams,
  selected,
  choose,
  at,
}: {
  race: Race;
  teams: Climber[];
  selected: number | null;
  choose: (id: number) => void;
  at: string;
}) {
  const [hover, setHover] = useState<{
    id: number;
    time: number;
    value: number;
  } | null>(null);
  const now = new Date(at).getTime();
  const history = race.history.filter((s) => new Date(s.at).getTime() <= now);
  const start = history.length
    ? new Date(history[0].at).getTime()
    : now - 3600000;
  const finish =
    race.phase === "final"
      ? Math.max(now, start + 3600000)
      : Math.max(now + 3600000, new Date(race.end || at).getTime());
  const top =
    Math.ceil(
      Math.max(180, ...teams.map((t) => Math.max(t.actual, t.projected))) / 30,
    ) * 30;
  const min = Math.min(
    0,
    ...teams.map((t) => t.actual),
    ...history.flatMap((s) => s.teams.map((t) => t.actual)),
  );
  const X = (time: number) => 64 + ((time - start) / (finish - start)) * 862,
    Y = (p: number) => 520 - ((p - min) / (top - min)) * 446;
  const future = (t: Climber) => {
    const points = [{ time: now, value: t.actual }];
    for (let i = 1; i <= 24; i++) {
      const time = now + ((finish - now) * i) / 24;
      let delta = 0;
      for (const p of t.players) {
        if (p.state === "finished" || p.state === "out") continue;
        const kickoff = p.kickoff ? new Date(p.kickoff).getTime() : now;
        const from = Math.max(now, kickoff),
          end = Math.max(from + 60000, kickoff + 3.5 * 3600000);
        delta +=
          (p.projected - p.actual) *
          Math.max(0, Math.min(1, (time - from) / (end - from)));
      }
      points.push({
        time,
        value:
          i === 24
            ? t.projected
            : at !== race.updatedAt
              ? t.actual + ((t.projected - t.actual) * i) / 24
              : t.actual + delta,
      });
    }
    return points;
  };
  const path = (points: { time: number; value: number }[]) =>
    points
      .map(
        (p, i) =>
          `${i ? "L" : "M"}${X(p.time).toFixed(2)},${Y(p.value).toFixed(2)}`,
      )
      .join(" ");
  return (
    <div className="mm-timeline">
      <div className="mm-chart-heading">
        <h2>The week, unfolding.</h2>
        <p>Every climb. Every collapse.</p>
      </div>
      <svg
        viewBox="0 0 1000 610"
        role="img"
        aria-label="Team scores over recorded time; lighter lines show estimated future scoring"
      >
        {Array.from({ length: top / 30 + 1 }, (_, i) => i * 30).map((p) => (
          <g key={p}>
            <line
              x1="64"
              x2="926"
              y1={Y(p)}
              y2={Y(p)}
              stroke="#d8d3c8"
              strokeDasharray="2 6"
            />
            <text x="47" y={Y(p) + 4} textAnchor="end">
              {p}
            </text>
          </g>
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const time = start + (finish - start) * f;
          return (
            <text key={f} x={X(time)} y="558" textAnchor="middle">
              {new Date(time).toLocaleString("en-US", {
                weekday: "short",
                hour: "numeric",
              })}
            </text>
          );
        })}
        <line
          x1={X(now)}
          x2={X(now)}
          y1="52"
          y2="523"
          stroke="#827869"
          strokeDasharray="4 5"
        />
        <text x={X(now)} y="35" textAnchor="middle">
          NOW
        </text>
        {teams.map((t, index) => {
          const strong =
            selected === t.id || index === 0 || index === teams.length - 1;
          const actual = history.map((s) => ({
            time: new Date(s.at).getTime(),
            value: s.teams.find((x) => x.id === t.id)?.actual ?? t.actual,
          }));
          actual.push({ time: now, value: t.actual });
          const projected = future(t);
          return (
            <g
              key={t.id}
              opacity={
                selected !== null && selected !== t.id
                  ? 0.23
                  : strong
                    ? 1
                    : 0.55
              }
            >
              <path
                d={path(actual)}
                fill="none"
                stroke={t.color}
                strokeWidth={strong ? 3.5 : 2}
              />
              <path
                d={path(projected)}
                fill="none"
                stroke={t.color}
                opacity=".45"
                strokeWidth={strong ? 3 : 2}
                strokeDasharray="5 5"
              />
              <path
                d={path([...actual, ...projected])}
                fill="none"
                stroke="transparent"
                strokeWidth="16"
                tabIndex={0}
                role="button"
                aria-label={`Highlight ${t.name}`}
                onClick={() => choose(t.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") choose(t.id);
                }}
                onPointerMove={(e) => {
                  const svg = e.currentTarget.ownerSVGElement!,
                    rect = svg.getBoundingClientRect();
                  const time =
                    start +
                    ((((e.clientX - rect.left) / rect.width) * 1000 - 64) /
                      862) *
                      (finish - start);
                  const pts = [...actual, ...projected];
                  const point = pts.reduce((a, b) =>
                    Math.abs(b.time - time) < Math.abs(a.time - time) ? b : a,
                  );
                  setHover({ id: t.id, ...point });
                }}
                onPointerLeave={() => setHover(null)}
              />
              <circle
                cx={X(now)}
                cy={Y(t.actual)}
                r={strong ? 5 : 3}
                fill={t.color}
              />
              {strong && (
                <text x="938" y={Y(t.projected) + 4} style={{ fill: t.color }}>
                  {n(t.projected)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hover && (
        <div className="mm-chart-tooltip" role="status">
          {teams.find((t) => t.id === hover.id)?.name} · {n(hover.value)} pts ·{" "}
          {new Date(hover.time).toLocaleString("en-US", {
            weekday: "short",
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
      )}
      <div className="mm-chart-legend">
        <span>
          <i />
          Recorded score
        </span>
        <span>
          <i />
          Projected path
        </span>
      </div>
      <p className="mm-chart-note">
        {history.length > 1
          ? "History begins when this expedition started recording."
          : "Recording begins now. Actual score trails appear as snapshots accumulate."}{" "}
        Future paths estimate timing; they aren’t play-by-play predictions.
      </p>
    </div>
  );
}
function Details({
  team,
  teams,
  back,
  replaying,
}: {
  team: Climber;
  teams: Climber[];
  back: () => void;
  replaying: boolean;
}) {
  const highest = teams[0],
    lowest = teams.at(-1)!;
  const highestActual = Math.max(...teams.map((climber) => climber.actual));
  const swings = [...team.players]
    .sort(
      (a, b) =>
        Math.abs(b.projected - b.baseline) - Math.abs(a.projected - a.baseline),
    )
    .slice(0, 2);
  return (
    <div className="mm-details">
      <button className="mm-back-list" onClick={back}>
        <Icon name="back" /> All climbers
      </button>
      <div className="mm-team-title">
        <Avatar team={team} />
        <div>
          <h2>{team.name}</h2>
          <p>{team.owner}</p>
        </div>
      </div>
      <div className="mm-detail-totals">
        <div>
          <span>Actual</span>
          <strong>{n(team.actual)}</strong>
        </div>
        <div>
          <span>Projected</span>
          <strong>{n(team.projected)}</strong>
        </div>
      </div>
      <div className="mm-odds">
        <div>
          <Icon name="crown" />
          <strong>{pct(team.high)}</strong>
          <span>Highest score</span>
        </div>
        <div>
          <Icon name="danger" />
          <strong>{pct(team.low)}</strong>
          <span>Lowest score</span>
        </div>
      </div>
      <dl className="mm-gaps">
        <div>
          <dt>Behind actual leader</dt>
          <dd>{n(Math.max(0, highestActual - team.actual))} pts</dd>
        </div>
        <div>
          <dt>Behind projected leader</dt>
          <dd>{n(Math.max(0, highest.projected - team.projected))} pts</dd>
        </div>
        <div>
          <dt>
            {team.id === lowest.id ? "To projected safety" : "Above last place"}
          </dt>
          <dd>
            {n(
              team.id === lowest.id
                ? Math.max(0, (teams.at(-2)?.projected || 0) - team.projected)
                : team.projected - lowest.projected,
            )}{" "}
            pts
          </dd>
        </div>
      </dl>
      {replaying ? (
        <p className="mm-detail-note">
          Replay shows recorded team totals. Return to the latest standings for
          player details.
        </p>
      ) : (
        <>
          <div className="mm-player-label">
            <span>Starter</span>
            <span>Actual / Proj.</span>
          </div>
          {(["active", "remaining", "finished", "out"] as const).map(
            (state) => {
              const players = team.players.filter((p) => p.state === state);
              return (
                players.length > 0 && (
                  <section className="mm-player-group" key={state}>
                    <h3>
                      {state === "out" ? "Inactive / empty" : state}{" "}
                      <span>{players.length}</span>
                    </h3>
                    {players.map((p) => (
                      <div className="mm-player" key={p.id}>
                        <div>
                          <b>{p.name}</b>
                          <small>
                            {p.position} · {p.team} {p.note && `· ${p.note}`}
                          </small>
                        </div>
                        <span>
                          {n(p.actual)} <b>{n(p.projected)}</b>
                        </span>
                      </div>
                    ))}
                  </section>
                )
              );
            },
          )}
          <section className="mm-swings">
            <h3>Biggest shifts from pregame</h3>
            {swings.map((p) => (
              <div key={p.id}>
                <span>{p.name}</span>
                <b>
                  {p.projected - p.baseline >= 0 ? "+" : ""}
                  {n(p.projected - p.baseline)}
                </b>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
export default function MeatMountain() {
  const [race, setRace] = useState<Race | null>(null),
    [week, setWeek] = useState<number | undefined>(),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [mode, setMode] = useState<"mountain" | "timeline">("mountain"),
    [selected, setSelected] = useState<number | null>(null),
    [sheet, setSheet] = useState(0),
    [now, setNow] = useState(Date.now()),
    [info, setInfo] = useState(false),
    [replay, setReplay] = useState<number | null>(null),
    [playing, setPlaying] = useState(false);
  const suppressClick = useRef(false);
  const sheetRef=useRef<HTMLElement>(null);
  const drag = useRef<{ y: number; sheet: number; offset:number; max:number } | null>(null),
    requestId = useRef(0);
  const refresh = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/meat-mountain${week ? `?week=${week}` : ""}`,
        { cache: "no-store" },
      );
      if (!response.ok)
        throw new Error("Live data is temporarily unavailable.");
      const next: Race = await response.json();
      if (id !== requestId.current) return;
      setRace(next);
      setError("");
    } catch (e) {
      if (id === requestId.current)
        setError(e instanceof Error ? e.message : "Unable to update.");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [week]);
  useEffect(() => {
    refresh();
    const timer = setInterval(() => {
      if (!document.hidden) refresh();
    }, 60000);
    const visible = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener("visibilitychange", visible);
    return () => {
      clearInterval(timer);
      document.removeEventListener(
        "visibilitychange",
        visible,
      ); /* Next refresh invalidates older requests through its request ID. */
    };
  }, [refresh]);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!REPLAY_ENABLED || !playing) return;
    let last = performance.now();
    const timer = setInterval(() => {
      const current = performance.now(),
        delta = (current - last) / 30000;
      last = current;
      setReplay((previous) => {
        const next = Math.min(1, (previous || 0) + delta);
        if (next >= 1) setPlaying(false);
        return next;
      });
    }, 50);
    return () => clearInterval(timer);
  }, [playing]);
  const frames = race?.history || [];
  const frame: Snapshot | undefined =
    !REPLAY_ENABLED || replay === null
      ? undefined
      : frames[
          Math.min(
            frames.length - 1,
            Math.floor(replay * Math.max(0, frames.length - 1)),
          )
        ];
  const teams = race
    ? frame
      ? race.teams
          .map((t) => ({ ...t, ...frame.teams.find((x) => x.id === t.id) }))
          .sort(
            (a, b) =>
              b.projected - a.projected || a.pointsAgainst - b.pointsAgainst,
          )
      : race.teams
    : [];
  const highTeam = [...teams].sort((a, b) => b.high - a.high)[0],
    lowTeam = [...teams].sort((a, b) => b.low - a.low)[0];
  const picked = teams.find((t) => t.id === selected);
  const age = race
    ? Math.max(0, Math.floor((now - new Date(race.updatedAt).getTime()) / 1000))
    : 0;
  const choose = (id: number) => {
    setSelected(id);
    setSheet(2);
  };
  const changeWeek = (value: string) => {
    setWeek(value === "live" ? undefined : Number(value));
    setLoading(true);
    setRace(null);
    setReplay(null);
    setPlaying(false);
    setSelected(null);
  };
  return (
    <main className="mm-app">
      <header className="mm-topbar">
        <Link href="/lab" className="mm-lab-link">
          <Icon name="back" size={15} /> Back to Lab
        </Link>
        <span className="mm-league-name">United Degen League of America</span>
        <div className="mm-top-actions">
          <button
            onClick={() => setInfo(!info)}
            aria-label="How the mountain works"
            aria-expanded={info}
          >
            <Icon name="info" />
          </button>
          <span>EST. 2026</span>
        </div>
      </header>
      <div className="mm-toolbar">
        <div className="mm-status-group">
          <label className="mm-week-label">
            <span className="sr-only">Select week</span>
            <select
              value={week || "live"}
              onChange={(e) => changeWeek(e.target.value)}
            >
              <option value="live">
                Week {race?.currentWeek || "—"} · Current
              </option>
              {Array.from(
                { length: race?.currentWeek || 2 },
                (_, i) => i + 1,
              ).map((w) => (
                <option value={w} key={w}>
                  Week {w}
                </option>
              ))}
            </select>
          </label>
          <span className={`mm-status ${race?.phase === "live" ? "live" : ""}`}>
            {frame
              ? "REPLAY"
              : race?.phase === "final"
                ? "FINAL"
                : race?.phase === "pregame"
                  ? "PREGAME"
                  : race
                    ? "LIVE"
                    : "CONNECTING"}
          </span>
          <span className="mm-update-controls">
          <span className={`mm-updated ${age > 180 || error ? "stale" : ""}`} title={error || undefined}>
            {frame
              ? new Date(frame.at).toLocaleString("en-US", {
                  weekday: "short",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : race
                ? `Updated ${age < 60 ? `${age}s` : `${Math.floor(age / 60)}m`} ago`
                : "Fetching Sleeper data"}
          </span>
          <button
            className="mm-refresh"
            onClick={refresh}
            disabled={loading}
            aria-label={loading ? "Refreshing standings" : "Refresh standings"}
            title={loading ? "Refreshing standings…" : "Refresh standings"}
            aria-busy={loading}
          >
            <Icon name="restart" size={16} />
          </button>
          <span className="mm-sr-only" role="status">
            {loading ? "Refreshing standings" : error ? `${error} Use Refresh standings to try again.` : "Standings updated"}
          </span>
          </span>
        </div>
        <div className="mm-mode-switch" role="group" aria-label="Race view">
          <button
            aria-pressed={mode === "mountain"}
            onClick={() => setMode("mountain")}
          >
            <Icon name="mountain" />
            Meat Mountain
          </button>
          <button
            aria-pressed={mode === "timeline"}
            onClick={() => setMode("timeline")}
          >
            <Icon name="chart" />
            Timeline
          </button>
        </div>
      </div>
      {info && (
        <section className="mm-info">
          <button aria-label="Close explanation" onClick={() => setInfo(false)}>
            <Icon name="close" />
          </button>
          <h2>How to read the mountain</h2>
          <p>
            Higher hikers have more projected final points. At 180, they reach
            the summit; exact totals keep climbing in the standings. Highest
            score chooses the punishment. Lowest score takes it.
          </p>
          <p>
            Odds come from 5,000 simulations using pregame projections, game
            clocks, and this season’s and last season’s scoring variation. They
            are estimates, not guarantees. Ties use full score precision, then
            season points against: fewer wins the high tie; more receives the
            low tie. An exact tie on both remains shared.
          </p>
          <p>
            Free data from Sleeper and ESPN, refreshed every minute. Arby’s is
            part of the league joke; this is an independent fan project.
          </p>
        </section>
      )}
      <div className="mm-workspace">
        <section
          className={`mm-scene ${mode === "timeline" ? "timeline-mode" : ""}`}
        >
          <div className="mm-title">
            <h1>
              Weekly
              <br />
              Meat Mountain<span>.</span>
            </h1>
            <p>Twelve teams. One high ground.</p>
          </div>
          {race ? (
            <>
              {mode === "mountain" ? (
                <Mountain teams={teams} selected={selected} choose={choose} />
              ) : (
                <Timeline
                  race={race}
                  teams={teams}
                  selected={selected}
                  choose={choose}
                  at={frame?.at || race.updatedAt}
                />
              )}
              {race.phase === "pregame" && race.start && (
                <p className="mm-start">
                  The climb begins{" "}
                  {new Date(race.start).toLocaleString("en-US", {
                    weekday: "long",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  .
                </p>
              )}
              {REPLAY_ENABLED && <div className="mm-replay-controls">
                {frames.length >= 2 ? (
                  <>
                    <button
                      onClick={() => {
                        if (replay === null || replay >= 1) setReplay(0);
                        setPlaying(!playing);
                      }}
                    >
                      <Icon name={playing ? "pause" : "play"} size={14} />
                      {playing
                        ? "Pause"
                        : replay === null
                          ? "Replay the climb"
                          : "Play replay"}
                    </button>
                    {replay !== null && (
                      <>
                        <button
                          aria-label="Restart replay"
                          onClick={() => {
                            setReplay(0);
                            setPlaying(true);
                          }}
                        >
                          <Icon name="restart" size={14} />
                        </button>
                        <span>{Math.round((replay || 0) * 30)} / 30s</span>
                        <button
                          onClick={() => {
                            setReplay(null);
                            setPlaying(false);
                          }}
                        >
                          Back to {race.phase === "final" ? "final" : "live"}
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <span>
                    {race.historyAvailable
                      ? "The first steps are being recorded."
                      : "Live standings · replay storage connecting"}
                  </span>
                )}
              </div>}
            </>
          ) : (
            <div className="mm-loading">
              <img src="/lab/meat-mountain/mountain.png" alt="" />
              <div>
                {loading
                  ? "Gathering the expedition…"
                  : "The trail is temporarily closed."}
                <small>
                  {loading
                    ? "Loading scores, projections, and season history."
                    : "Use the refresh button above to reconnect to Sleeper."}
                </small>
              </div>
            </div>
          )}
        </section>
        <aside
          ref={sheetRef}
          className={`mm-standings sheet-${sheet}`}
          aria-label="Leaderboard"
        >
          <button
            className="mm-sheet-handle"
            aria-expanded={sheet > 0}
            aria-controls="mm-sheet-content"
            onClick={() => {
              if (suppressClick.current) {
                suppressClick.current = false;
                return;
              }
              setSheet((sheet + 1) % 3);
            }}
            onPointerDown={(e) => {
              const element=sheetRef.current!;
              drag.current = { y: e.clientY, sheet, offset:element.getBoundingClientRect().bottom-window.innerHeight,max:element.offsetHeight-105 };
              element.style.transition='none';
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e)=>{if(!drag.current||!sheetRef.current)return;const offset=Math.max(0,Math.min(drag.current.max,drag.current.offset+e.clientY-drag.current.y));sheetRef.current.style.transform=`translateY(${offset}px)`;}}
            onPointerCancel={()=>{drag.current=null;sheetRef.current?.style.removeProperty('transform');sheetRef.current?.style.removeProperty('transition');}}
            onPointerUp={(e) => {
              if (!drag.current) return;
              sheetRef.current?.style.removeProperty('transform');sheetRef.current?.style.removeProperty('transition');
              const distance = drag.current.y - e.clientY;
              if (Math.abs(distance) > 25) {
                suppressClick.current = true;
                setTimeout(()=>{suppressClick.current=false},0);
                setSheet(
                  Math.max(
                    0,
                    Math.min(2, drag.current.sheet + (distance > 0 ? 1 : -1)),
                  ),
                );
                e.preventDefault();
              }
              drag.current = null;
            }}
            aria-label="Expand or collapse leaderboard"
          >
            <span />
          </button>
          <div id="mm-sheet-content" className="mm-sheet-scroll">
            {picked ? (
              <Details
                team={picked}
                teams={teams}
                back={() => setSelected(null)}
                replaying={replay !== null}
              />
            ) : (
              <>
                <div className="mm-standings-heading">
                  <h2>
                    {race?.phase === "final" && replay === null
                      ? "Final standings"
                      : "The expedition"}
                  </h2>
                  <span>{teams.length || 12} CLIMBERS</span>
                </div>
                <p className="mm-standings-subtitle">
                  {race?.phase === "final"
                    ? "The scores are in. The consequences await."
                    : "Ordered by projected finish"}
                </p>
                <div className="mm-table">
                  <div className="mm-table-head">
                    <span>#</span>
                    <span>Team</span>
                    <span>Actual</span>
                    <span>Proj.</span>
                    <span>High</span>
                    <span>Low</span>
                  </div>
                  {teams.map((t, i) => (
                    <button
                      className={`mm-row ${i === 0 ? "first" : i === teams.length - 1 ? "last" : ""}`}
                      key={t.id}
                      onClick={() => choose(t.id)}
                    >
                      <span className="mm-rank">
                        {i === 0 ? (
                          <Icon name="crown" size={13} />
                        ) : i === teams.length - 1 ? (
                          <Icon name="danger" size={13} />
                        ) : null}
                        {i > 0 && i < teams.length - 1 && i + 1}
                      </span>
                      <span className="mm-row-team">
                        <Avatar team={t} />
                        <span>
                          <b>{t.name}</b>
                          <small>
                            {t.active} live <i>·</i> {t.remaining} left
                          </small>
                        </span>
                      </span>
                      <span>{n(t.actual)}</span>
                      <strong>{n(t.projected)}</strong>
                      <span className={t.high >= 0.25 ? "mm-strong-odds" : ""}>
                        {pct(t.high)}
                      </span>
                      <span className={t.low >= 0.25 ? "mm-danger-odds" : ""}>
                        {pct(t.low)}
                      </span>
                    </button>
                  ))}
                </div>
                {teams.length > 0 && (
                  <div className="mm-verdict">
                    <div>
                      <Icon name="crown" />
                      <span>
                        {race?.phase === "final"
                          ? "Picks the punishment"
                          : "Closest to glory"}
                        <b>
                          {race?.phase === "final"
                            ? teams
                                .filter(
                                  (t) =>
                                    t.actual === teams[0].actual &&
                                    t.pointsAgainst === teams[0].pointsAgainst,
                                )
                                .map((t) => t.name)
                                .join(" / ")
                            : highTeam?.name}
                        </b>
                      </span>
                      <strong>{pct(highTeam?.high || 0)}</strong>
                    </div>
                    <div>
                      <Icon name="danger" />
                      <span>
                        {race?.phase === "final"
                          ? "Receives the punishment"
                          : "Feeling the heat"}
                        <b>
                          {race?.phase === "final"
                            ? teams
                                .filter(
                                  (t) =>
                                    t.actual === teams.at(-1)!.actual &&
                                    t.pointsAgainst ===
                                      teams.at(-1)!.pointsAgainst,
                                )
                                .map((t) => t.name)
                                .join(" / ")
                            : lowTeam?.name}
                        </b>
                      </span>
                      <strong>{pct(lowTeam?.low || 0)}</strong>
                    </div>
                  </div>
                )}
                <div className="mm-panel-footer">
                  <p>
                    Some climb for glory.
                    <br />
                    <em>Some climb to avoid Monday.</em>
                  </p>
                  <Icon name="mountain" size={35} />
                </div>
                <p className="mm-model-note">
                  {race?.model ||
                    "Live Sleeper scores · estimated final outcomes"}
                  <button onClick={() => setInfo(true)}>How it works</button>
                </p>
                {race?.warnings.map((w) => (
                  <p className="mm-warning" key={w}>
                    {w}
                  </p>
                ))}
              </>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
