import { GameState, Player, GameMove, LeaderboardEntry } from './types';

export class GameLogic {
  private games = new Map<string, GameState>();
  private players = new Map<string, Player>();

  createGame(player1: Player): GameState {
    const gameId = this.generateGameId();
    const game: GameState = {
      id: gameId,
      board: Array(9).fill(null),
      players: [player1],
      currentPlayer: player1.id,
      winner: null,
      isDraw: false,
      status: 'waiting',
      createdAt: new Date()
    };
    
    this.games.set(gameId, game);
    return game;
  }

  joinGame(gameId: string, player: Player): GameState | null {
    const game = this.games.get(gameId);
    if (!game || game.players.length >= 2 || game.status !== 'waiting') {
      return null;
    }

    player.symbol = 'O'; // Second player is always O
    game.players.push(player);
    game.status = 'playing';
    
    return game;
  }

  makeMove(move: GameMove): { success: boolean; game: GameState | null; error?: string } {
    const game = this.games.get(move.gameId);
    
    if (!game) {
      return { success: false, game: null, error: 'Game not found' };
    }

    if (game.status !== 'playing') {
      return { success: false, game: null, error: 'Game not in progress' };
    }

    if (game.currentPlayer !== move.playerId) {
      return { success: false, game: null, error: 'Not your turn' };
    }

    if (move.position < 0 || move.position > 8) {
      return { success: false, game: null, error: 'Invalid position' };
    }

    if (game.board[move.position] !== null) {
      return { success: false, game: null, error: 'Position already taken' };
    }

    // Find player and their symbol
    const player = game.players.find(p => p.id === move.playerId);
    if (!player) {
      return { success: false, game: null, error: 'Player not in game' };
    }

    // Make the move
    game.board[move.position] = player.symbol;

    // Check for winner
    const winner = this.checkWinner(game.board);
    if (winner) {
      game.winner = winner;
      game.status = 'finished';
      this.updatePlayerStats(game, winner);
    } else if (this.isBoardFull(game.board)) {
      game.isDraw = true;
      game.status = 'finished';
      this.updatePlayerStats(game, null); // Draw
    } else {
      // Switch turns
      game.currentPlayer = game.players.find(p => p.id !== move.playerId)?.id || '';
    }

    return { success: true, game };
  }

  private checkWinner(board: (string | null)[]): string | null {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    return null;
  }

  private isBoardFull(board: (string | null)[]): boolean {
    return board.every(cell => cell !== null);
  }

  private updatePlayerStats(game: GameState, winner: string | null) {
    game.players.forEach(player => {
      const storedPlayer = this.players.get(player.id);
      if (storedPlayer) {
        storedPlayer.gamesPlayed++;
        
        if (winner === null) {
          // Draw
          storedPlayer.draws++;
          storedPlayer.points += 50; // +50 points for draw
        } else if (player.symbol === winner) {
          // Win
          storedPlayer.wins++;
          storedPlayer.points += 200; // +200 points for win
        } else {
          // Loss
          storedPlayer.losses++;
          // No points for loss (could be negative if desired)
        }
      }
    });
  }

  getGame(gameId: string): GameState | null {
    return this.games.get(gameId) || null;
  }

  getAllGames(): GameState[] {
    return Array.from(this.games.values());
  }

  getPlayerGames(playerId: string): GameState[] {
    return Array.from(this.games.values())
      .filter(game => game.players.some(p => p.id === playerId));
  }

  addPlayer(player: Player): void {
    // Check if player already exists, if not initialize with default stats
    const existingPlayer = this.players.get(player.id);
    if (!existingPlayer) {
      player.wins = 0;
      player.losses = 0;
      player.draws = 0;
      player.points = 0;
      player.gamesPlayed = 0;
    } else {
      // Keep existing stats but update name and symbol
      player.wins = existingPlayer.wins;
      player.losses = existingPlayer.losses;
      player.draws = existingPlayer.draws;
      player.points = existingPlayer.points;
      player.gamesPlayed = existingPlayer.gamesPlayed;
    }
    this.players.set(player.id, player);
  }

  getPlayer(playerId: string): Player | null {
    return this.players.get(playerId) || null;
  }

  restartGame(gameId: string): GameState | null {
    const game = this.games.get(gameId);
    if (!game || game.players.length !== 2) {
      return null;
    }

    // Reset game state but keep same players and game ID
    game.board = Array(9).fill(null);
    game.winner = null;
    game.isDraw = false;
    game.status = 'playing';
    game.createdAt = new Date();
    
    // Switch who goes first (alternate X and O)
    const currentXPlayer = game.players.find(p => p.symbol === 'X');
    const currentOPlayer = game.players.find(p => p.symbol === 'O');
    
    if (currentXPlayer && currentOPlayer) {
      // Swap symbols for next game
      currentXPlayer.symbol = 'O';
      currentOPlayer.symbol = 'X';
      game.currentPlayer = currentXPlayer.id; // New X player goes first
    }

    return game;
  }

  getLeaderboard(): LeaderboardEntry[] {
    const entries = Array.from(this.players.values())
      .filter(player => player.gamesPlayed > 0) // Only show players who have played
      .map(player => ({
        playerId: player.id,
        name: player.name,
        wins: player.wins,
        losses: player.losses,
        draws: player.draws,
        points: player.points,
        gamesPlayed: player.gamesPlayed,
        winRate: player.gamesPlayed > 0 ? 
          Math.round((player.wins / player.gamesPlayed) * 100) : 0,
        rank: 0 // Will be set below
      }))
      .sort((a, b) => {
        // Sort by points first, then by win rate, then by wins
        if (b.points !== a.points) return b.points - a.points;
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.wins - a.wins;
      });

    // Assign ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries.slice(0, 10); // Top 10
  }

  private generateGameId(): string {
    // Generate simple 5-digit number (e.g., "14789", "98723")
    return Math.floor(10000 + Math.random() * 90000).toString();
  }
}