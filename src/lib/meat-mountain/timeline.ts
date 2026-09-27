import type { Climber, Race } from "./types";

export type TimelineRange = "hour" | "day" | "week";
export type ScorePoint = { time: number; value: number };
const HOUR = 3600000;

export function timelineWindow(race: Race, now: number, range: TimelineRange, offset = 0) {
  const first = race.history.length ? Date.parse(race.history[0].at) : now;
  const final = Math.max(now + HOUR, Date.parse(race.end || race.updatedAt));
  if (range === "week") return { start: Math.min(first, now - HOUR), finish: final };
  const span = range === "hour" ? HOUR : 24 * HOUR;
  const anchor = now + offset * span;
  return { start: anchor - span * 0.75, finish: anchor + span * 0.25 };
}

// Include interpolated boundary points when clipping an existing recorded line.
// Never extend history into a period we didn't record.
export function clipPoints(points: ScorePoint[], start: number, finish: number) {
  const output: ScorePoint[] = [];
  for (let i = 0; i < points.length; i++) {
    const point = points[i], previous = points[i - 1];
    for (const boundary of [start, finish]) {
      if (previous && previous.time < boundary && point.time > boundary) {
        output.push({ time: boundary, value: previous.value +
          (point.value - previous.value) * (boundary - previous.time) / (point.time - previous.time) });
      }
    }
    if (point.time >= start && point.time <= finish) output.push(point);
  }
  return output.sort((a, b) => a.time - b.time);
}

export function projectedPath(team: Climber, now: number, finish: number, fullFinish: number) {
  const points: ScorePoint[] = [];
  for (let i = 0; i <= 48; i++) {
    const time = now + (Math.max(now, finish) - now) * i / 48;
    let delta = 0;
    for (const player of team.players) {
      if (player.state === "finished" || player.state === "out") continue;
      const kickoff = player.kickoff ? Date.parse(player.kickoff) : now;
      const from = Math.max(now, kickoff);
      const end = Math.max(from + 60000, kickoff + 3.5 * HOUR);
      delta += (player.projected - player.actual) * Math.max(0, Math.min(1, (time - from) / (end - from)));
    }
    points.push({ time, value: time >= fullFinish ? team.projected : team.actual + delta });
  }
  return points;
}

export function scoreScale(values: number[], range: TimelineRange) {
  const low = Math.min(...values, 0), high = Math.max(...values, 180);
  if (range === "week") return { min: Math.floor(low / 30) * 30, top: Math.ceil(high / 30) * 30, step: 30 };
  const actualLow = values.length ? Math.min(...values) : 0;
  const actualHigh = values.length ? Math.max(...values) : 180;
  const padding = Math.max(3, (actualHigh - actualLow) * 0.1);
  const span = actualHigh - actualLow + 2 * padding;
  const step = span > 100 ? 30 : span > 50 ? 15 : span > 25 ? 10 : span > 12 ? 5 : 2;
  const min = Math.floor((actualLow - padding) / step) * step;
  return { min: actualLow >= 0 ? Math.max(0, min) : min, top: Math.ceil((actualHigh + padding) / step) * step, step };
}
