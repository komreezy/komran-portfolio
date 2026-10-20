import type { Game, Season, TortalonaDocument } from "./types";

export interface ValidationResult {
  value?: TortalonaDocument;
  error?: string;
}

const MAX_SEASONS = 20;
const MAX_PLAYERS = 200;
const MAX_GOALS = 1000;
const MAX_ID_LENGTH = 64;
const MAX_NAME_LENGTH = 100;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function boundedInt(value: unknown, min: number, max: number): value is number {
  return Number.isInteger(value) && (value as number) >= min && (value as number) <= max;
}

function text(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim().length > 0 &&
    value.trim().length <= maxLength && !/[\x00-\x1f\x7f]/.test(value);
}

function unique<T>(items: T[], key: (item: T) => string): boolean {
  const keys = items.map(key);
  return new Set(keys).size === keys.length;
}

function validateGame(value: unknown, players: Set<string>, baselineGame: number, totalGames: number): value is Game {
  if (!isRecord(value) || !boundedInt(value.week, baselineGame + 1, totalGames) || !isRecord(value.goals)) return false;
  return Object.entries(value.goals).every(([playerId, goals]) => players.has(playerId) && boundedInt(goals, 0, MAX_GOALS));
}

export function validateTortalonaDocument(input: unknown): ValidationResult {
  if (!isRecord(input) || !boundedInt(input.revision, 0, Number.MAX_SAFE_INTEGER - 1) || !Array.isArray(input.seasons)) {
    return { error: "Send a document with a valid revision and seasons list." };
  }
  if (input.seasons.length < 1 || input.seasons.length > MAX_SEASONS) {
    return { error: `Keep between 1 and ${MAX_SEASONS} seasons.` };
  }

  const seasons: Season[] = [];
  for (const raw of input.seasons) {
    if (!isRecord(raw) || !text(raw.id, MAX_ID_LENGTH) || !text(raw.name, MAX_NAME_LENGTH) ||
      !boundedInt(raw.baselineGame, 0, 52) || raw.totalGames !== 9 ||
      !Array.isArray(raw.players) || raw.players.length > MAX_PLAYERS || !Array.isArray(raw.games)) {
      return { error: "Each season needs a valid name, game range, players list, and games list." };
    }
    const players = raw.players;
    if (!players.every((player) => isRecord(player) && text(player.id, MAX_ID_LENGTH) &&
      text(player.name, MAX_NAME_LENGTH) && boundedInt(player.baselineGoals, 0, MAX_GOALS))) {
      return { error: "Players need unique IDs, names, and baseline goals from 0 to 1000." };
    }
    const typedPlayers = players as Season["players"];
    if (raw.baselineGame === 0 && typedPlayers.some((player) => player.baselineGoals !== 0)) {
      return { error: "Players must start with zero baseline goals when the baseline game is 0." };
    }
    if (!unique(typedPlayers, (player) => player.id) ||
      !unique(typedPlayers, (player) => player.name.trim().toLocaleLowerCase())) {
      return { error: "Player IDs and names must be unique within each season." };
    }
    const playerIds = new Set(typedPlayers.map((player) => player.id));
    const games = raw.games;
    if (games.length > raw.totalGames - raw.baselineGame ||
      !games.every((game) => validateGame(game, playerIds, raw.baselineGame as number, raw.totalGames as number))) {
      return { error: "Games must use unique valid weeks and goals for listed players only." };
    }
    const typedGames = games as Game[];
    if (!unique(typedGames, (game) => String(game.week))) {
      return { error: "A season can have only one score entry per game week." };
    }
    seasons.push({
      id: raw.id,
      name: raw.name.trim(),
      baselineGame: raw.baselineGame,
      totalGames: raw.totalGames,
      players: typedPlayers.map((player) => ({ ...player, name: player.name.trim() })),
      games: typedGames.map((game) => ({ week: game.week, goals: { ...game.goals } })),
    });
  }
  if (!unique(seasons, (season) => season.id) ||
    !unique(seasons, (season) => season.name.trim().toLocaleLowerCase())) {
    return { error: "Season IDs and names must be unique." };
  }
  return { value: { revision: input.revision, seasons } };
}
