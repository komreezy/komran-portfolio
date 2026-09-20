import type { Climber } from "./types";
export const priorSigma: Record<string, number> = {
  QB: 7,
  RB: 8,
  WR: 9,
  TE: 6,
  K: 4,
  DEF: 5,
};
export function score(
  stats: Record<string, number>,
  scoring: Record<string, number>,
): number {
  const normalized = { ...stats };
  if (
    normalized.fgmiss === undefined &&
    normalized.fga !== undefined &&
    normalized.fgm !== undefined
  )
    normalized.fgmiss = Math.max(0, normalized.fga - normalized.fgm);
  // Projection feeds sometimes omit the 50+ bucket but provide total makes.
  if (normalized.fgm && !normalized.fgm_50_59 && !normalized.fgm_60p)
    normalized.fgm_50_59 = Math.max(
      0,
      normalized.fgm -
        ["0_19", "20_29", "30_39", "40_49"].reduce(
          (s, k) => s + (normalized["fgm_" + k] || 0),
          0,
        ),
    );
  return Object.entries(scoring).reduce(
    (sum, [key, weight]) => sum + (normalized[key] || 0) * weight,
    0,
  );
}
export function forecast(
  actual: number,
  baseline: number,
  progress: number,
  position: string,
): number {
  if (progress >= 1) return actual;
  if (progress <= 0) return baseline;
  const remaining = 1 - progress;
  const pace =
    baseline > 0
      ? Math.max(
          0.55,
          Math.min(1.55, actual / Math.max(2, baseline * progress)),
        )
      : 1;
  const adjusted = baseline * (1 + (pace - 1) * 0.35 * progress);
  // Defense can lose points already awarded for points allowed. Blend toward a
  // final forecast instead of adding a second full points-allowed bonus.
  return position === "DEF"
    ? actual * progress + adjusted * remaining
    : actual + adjusted * remaining;
}
export function compareHigh(
  a: Pick<Climber, "actual" | "pointsAgainst" | "id">,
  b: Pick<Climber, "actual" | "pointsAgainst" | "id">,
) {
  return b.actual - a.actual || a.pointsAgainst - b.pointsAgainst;
}
export function compareLow(
  a: Pick<Climber, "actual" | "pointsAgainst" | "id">,
  b: Pick<Climber, "actual" | "pointsAgainst" | "id">,
) {
  return a.actual - b.actual || b.pointsAgainst - a.pointsAgainst;
}
export function probabilities(teams: Climber[], seed = 1, samples = 5000) {
  let state = seed >>> 0;
  const random = () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return (state + 0.5) / 4294967296;
  };
  const normal = () =>
    Math.sqrt(-2 * Math.log(random())) * Math.cos(2 * Math.PI * random());
  teams.forEach((t) => {
    t.high = 0;
    t.low = 0;
  });
  for (let run = 0; run < samples; run++) {
    const games = new Map<string, number>();
    const simulated = teams.map((t) => ({
      ...t,
      actual:
        t.projected +
        t.players.reduce((sum, p) => {
          if (!p.sigma) return sum;
          if (!games.has(p.game)) games.set(p.game, normal());
          const shock =
            p.sigma *
            (Math.sqrt(0.85) * normal() + Math.sqrt(0.15) * games.get(p.game)!);
          // Restrict implausible negative offensive final scores while allowing defense declines.
          return (
            sum + (p.position === "DEF" ? shock : Math.max(-p.projected, shock))
          );
        }, 0),
    }));
    const hi = [...simulated].sort(compareHigh)[0],
      lo = [...simulated].sort(compareLow)[0];
    const winners = simulated.filter((t) => compareHigh(t, hi) === 0),
      losers = simulated.filter((t) => compareLow(t, lo) === 0);
    winners.forEach((w) => {
      teams.find((t) => t.id === w.id)!.high += 1 / samples / winners.length;
    });
    losers.forEach((w) => {
      teams.find((t) => t.id === w.id)!.low += 1 / samples / losers.length;
    });
  }
  return teams.sort(
    (a, b) =>
      b.projected - a.projected ||
      a.pointsAgainst - b.pointsAgainst ||
      a.id - b.id,
  );
}
export function playerSigma(
  position: string,
  history: { value: number; weight: number }[],
  progress: number,
): number {
  const prior = priorSigma[position] || 7,
    total = history.reduce((s, x) => s + x.weight, 0);
  const mean =
    history.reduce((s, x) => s + x.value * x.weight, 0) / Math.max(1, total);
  const variance =
    history.reduce((s, x) => s + (x.value - mean) ** 2 * x.weight, 0) /
    Math.max(1, total);
  const weight = history.length / (history.length + 8);
  return (
    Math.sqrt(prior ** 2 * (1 - weight) + variance * weight) *
    Math.sqrt(Math.max(0, 1 - progress))
  );
}
