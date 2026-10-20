import type { Season } from './types';

export interface ScoringTableEntry {
  id: string;
  name: string;
  goals: number;
}

/** Aggregate each player's baseline and recorded game goals across seasons. */
export function getScoringTable(seasons: Season[]): ScoringTableEntry[] {
  const totals = new Map<string, ScoringTableEntry>();

  for (const season of seasons) {
    for (const player of season.players) {
      let entry = totals.get(player.id);
      if (!entry) {
        entry = { id: player.id, name: player.name, goals: 0 };
        totals.set(player.id, entry);
      }

      entry.goals += player.baselineGoals;
      for (const game of season.games) {
        entry.goals += game.goals[player.id] ?? 0;
      }
    }
  }

  return [...totals.values()].sort(
    (a, b) => b.goals - a.goals || a.name.localeCompare(b.name),
  );
}
