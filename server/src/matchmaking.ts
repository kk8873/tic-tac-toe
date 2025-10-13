import { Player, GameState } from './types';
import { GameLogic } from './gameLogic';

export class MatchmakingService {
  private waitingPlayers: Player[] = [];
  private gameLogic: GameLogic;

  constructor(gameLogic: GameLogic) {
    this.gameLogic = gameLogic;
  }

  addPlayerToQueue(player: Player): { matched: boolean; game?: GameState } {
    // Check if player already in queue
    const existingPlayerIndex = this.waitingPlayers.findIndex(p => p.id === player.id);
    if (existingPlayerIndex !== -1) {
      return { matched: false };
    }

    // Add player to game logic
    this.gameLogic.addPlayer(player);

    // Try to match with waiting player
    if (this.waitingPlayers.length > 0) {
      const opponent = this.waitingPlayers.shift()!;
      opponent.symbol = 'X'; // First player is X
      player.symbol = 'O'; // Second player is O

      // Create game with first player, then join second player
      const game = this.gameLogic.createGame(opponent);
      this.gameLogic.joinGame(game.id, player);
      
      return { matched: true, game };
    } else {
      // Add to waiting queue
      this.waitingPlayers.push(player);
      return { matched: false };
    }
  }

  removePlayerFromQueue(playerId: string): void {
    const index = this.waitingPlayers.findIndex(p => p.id === playerId);
    if (index !== -1) {
      this.waitingPlayers.splice(index, 1);
    }
  }

  getQueueStatus(): { playersInQueue: number; estimatedWaitTime: string } {
    const playersInQueue = this.waitingPlayers.length;
    const estimatedWaitTime = playersInQueue === 0 ? 'Instant match' : '< 30 seconds';
    
    return {
      playersInQueue,
      estimatedWaitTime
    };
  }

  createPrivateGame(player: Player): GameState {
    this.gameLogic.addPlayer(player);
    player.symbol = 'X'; // Host is always X
    return this.gameLogic.createGame(player);
  }

  joinPrivateGame(gameId: string, player: Player): GameState | null {
    this.gameLogic.addPlayer(player);
    return this.gameLogic.joinGame(gameId, player);
  }
}