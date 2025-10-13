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