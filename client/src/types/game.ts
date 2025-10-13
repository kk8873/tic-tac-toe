export interface Player {
  id: string;
  name: string;
  symbol: 'X' | 'O';
  wins: number;
  losses: number;
  draws: number;
  points: number;
  gamesPlayed: number;
}

export interface GameState {
  id: string;
  board: (string | null)[];
  players: Player[];
  currentPlayer: string;
  winner: string | null;
  isDraw: boolean;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: Date;
}

export interface GameMove {
  gameId: string;
  playerId: string;
  position: number;
}

export interface LeaderboardEntry {
  playerId: string;
  name: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  gamesPlayed: number;
  winRate: number;
  rank: number;
}

export type GamePhase = 'menu' | 'matchmaking' | 'playing' | 'finished';

export interface SocketEvents {
  // Client to Server
  join_queue: (playerData: { name: string }) => void;
  create_private_game: (playerData: { name: string }) => void;
  join_private_game: (data: { gameId: string; playerData: { name: string } }) => void;
  make_move: (data: { gameId: string; position: number }) => void;
  request_rematch: (data: { gameId: string }) => void;
  leave_queue: () => void;

  // Server to Client
  game_found: (data: { game: GameState; yourSymbol: 'X' | 'O' }) => void;
  queued: (data: { message: string; queueStatus: any }) => void;
  private_game_created: (data: { game: GameState; gameId: string; yourSymbol: 'X' | 'O' }) => void;
  game_started: (data: { game: GameState; message: string }) => void;
  your_symbol: (data: { symbol: 'X' | 'O' }) => void;
  game_update: (data: { game: GameState }) => void;
  game_finished: (data: { game: GameState; message: string; pointsAwarded: { [playerId: string]: number }; leaderboard: LeaderboardEntry[] }) => void;
  game_restarted: (data: { game: GameState; message: string }) => void;
  left_queue: (data: { message: string }) => void;
  error: (data: { message: string }) => void;
}