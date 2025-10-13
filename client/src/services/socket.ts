import { io, Socket } from 'socket.io-client';
import type { SocketEvents } from '../types/game';

class SocketService {
  private socket: Socket<SocketEvents> | null = null;

  connect(serverUrl: string = 'http://localhost:3000') {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  // Game methods
  joinQueue(playerName: string) {
    this.socket?.emit('join_queue', { name: playerName });
  }

  leaveQueue() {
    this.socket?.emit('leave_queue');
  }

  createPrivateGame(playerName: string) {
    this.socket?.emit('create_private_game', { name: playerName });
  }

  joinPrivateGame(gameId: string, playerName: string) {
    this.socket?.emit('join_private_game', {
      gameId,
      playerData: { name: playerName }
    });
  }

  makeMove(gameId: string, position: number) {
    this.socket?.emit('make_move', { gameId, position });
  }

  requestRematch(gameId: string) {
    this.socket?.emit('request_rematch', { gameId });
  }

  // Event listeners
  onGameFound(callback: (data: any) => void) {
    this.socket?.on('game_found', callback);
  }

  onQueued(callback: (data: any) => void) {
    this.socket?.on('queued', callback);
  }

  onPrivateGameCreated(callback: (data: any) => void) {
    this.socket?.on('private_game_created', callback);
  }

  onGameStarted(callback: (data: any) => void) {
    this.socket?.on('game_started', callback);
  }

  onYourSymbol(callback: (data: { symbol: 'X' | 'O' }) => void) {
    this.socket?.on('your_symbol', callback);
  }

  onGameUpdate(callback: (data: any) => void) {
    this.socket?.on('game_update', callback);
  }

  onGameFinished(callback: (data: any) => void) {
    this.socket?.on('game_finished', callback);
  }

  onGameRestarted(callback: (data: any) => void) {
    this.socket?.on('game_restarted', callback);
  }

  onLeftQueue(callback: (data: any) => void) {
    this.socket?.on('left_queue', callback);
  }

  onError(callback: (data: { message: string }) => void) {
    this.socket?.on('error', callback);
  }

  // Remove event listeners
  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event as any, callback);
  }
}

export const socketService = new SocketService();