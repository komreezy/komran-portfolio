export type PlayerState = "active" | "remaining" | "finished" | "out";
export interface ClimberPlayer {
  id: string;
  name: string;
  position: string;
  team: string;
  actual: number;
  baseline: number;
  projected: number;
  sigma: number;
  state: PlayerState;
  game: string;
  kickoff: string | null;
  progress: number;
  note?: string;
}
export interface Climber {
  id: number;
  name: string;
  owner: string;
  avatar: string | null;
  color: string;
  actual: number;
  projected: number;
  high: number;
  low: number;
  pointsAgainst: number;
  active: number;
  remaining: number;
  players: ClimberPlayer[];
}
export interface Snapshot {
  at: string;
  teams: Pick<
    Climber,
    "id" | "actual" | "projected" | "high" | "low" | "active" | "remaining"
  >[];
  events?: string[];
}
export interface Race {
  league: string;
  season: number;
  week: number;
  currentWeek: number;
  updatedAt: string;
  phase: "pregame" | "live" | "final";
  teams: Climber[];
  history: Snapshot[];
  historyAvailable: boolean;
  warnings: string[];
  start: string | null;
  end: string | null;
  model: string;
}
export const COLORS = [
  "#ae4d32",
  "#297778",
  "#72538f",
  "#a17724",
  "#306994",
  "#9c4771",
  "#4f7540",
  "#8b653d",
  "#575b99",
  "#347963",
  "#a04b51",
  "#62664b",
];
