export interface Player {
  id: string;
  name: string;
  baselineGoals: number;
}

export interface Game {
  week: number;
  goals: Record<string, number>;
}

export interface Season {
  id: string;
  name: string;
  baselineGame: number;
  totalGames: number;
  players: Player[];
  games: Game[];
}

export interface TortalonaDocument {
  revision: number;
  seasons: Season[];
}
