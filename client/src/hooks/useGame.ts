import { useState, useEffect, useCallback } from 'react';
import { socketService } from '../services/socket';
import type { GameState, GamePhase, LeaderboardEntry } from '../types/game';

interface UseGameReturn {
  gameState: GameState | null;
  gamePhase: GamePhase;
  playerSymbol: 'X' | 'O' | null;
  playerName: string;
  gameMessage: string;
  isMyTurn: boolean;
  isConnected: boolean;
  showResultModal: boolean;
  gameResult: {
    winner: string | null;
    isDraw: boolean;
    pointsAwarded: { [playerId: string]: number };
    leaderboard: LeaderboardEntry[];
  } | null;
  
  setPlayerName: (name: string) => void;
  startMatchmaking: () => void;
  stopMatchmaking: () => void;
  createPrivateGame: () => void;
  joinPrivateGame: (gameId: string) => void;
  makeMove: (position: number) => void;
  requestRematch: () => void;
  closeResultModal: () => void;
  backToMenu: () => void;
}

export const useGame = (): UseGameReturn => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>('menu');
  const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O' | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [gameMessage, setGameMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [gameResult, setGameResult] = useState<{
    winner: string | null;
    isDraw: boolean;
    pointsAwarded: { [playerId: string]: number };
    leaderboard: LeaderboardEntry[];
  } | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const socket = socketService.connect(
      import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'
    );

    setIsConnected(socketService.isConnected());

    // Socket event handlers
    const handleConnect = () => {
      setIsConnected(true);
      console.log('Connected to server');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  // Set up game event listeners
  useEffect(() => {
    socketService.onQueued((data) => {
      setGamePhase('matchmaking');
      setGameMessage(data.message);
    });

    socketService.onGameFound((data) => {
      setGameState(data.game);
      setPlayerSymbol(data.yourSymbol);
      setGamePhase('playing');
      setGameMessage('Game found! Good luck!');
    });

    socketService.onPrivateGameCreated((data) => {
      setGameState(data.game);
      setPlayerSymbol(data.yourSymbol);
      setGamePhase('playing');
      setGameMessage(`Private game created! Share game ID: ${data.gameId}`);
    });

    socketService.onGameStarted((data) => {
      setGameState(data.game);
      setGamePhase('playing');
      setGameMessage(data.message);
    });

    socketService.onYourSymbol((data) => {
      setPlayerSymbol(data.symbol);
    });

    socketService.onGameUpdate((data) => {
      setGameState(data.game);
      
      if (data.game.status === 'playing') {
        const currentPlayerName = data.game.players.find((p: any) => p.id === data.game.currentPlayer)?.name;
        setGameMessage(`${currentPlayerName}'s turn`);
      }
    });

    socketService.onGameFinished((data) => {
      setGameState(data.game);
      setGamePhase('finished');
      setGameMessage(data.message);
      
      // Show result modal with leaderboard
      setGameResult({
        winner: data.game.winner,
        isDraw: data.game.isDraw,
        pointsAwarded: data.pointsAwarded,
        leaderboard: data.leaderboard
      });
      setShowResultModal(true);
    });

    socketService.onGameRestarted((data) => {
      setGameState(data.game);
      setGamePhase('playing');
      setGameMessage(data.message);
      setShowResultModal(false); // Close modal when game restarts
      setGameResult(null);
    });

    socketService.onLeftQueue((data) => {
      setGamePhase('menu');
      setGameMessage(data.message);
    });

    socketService.onError((data) => {
      setGameMessage(`Error: ${data.message}`);
    });

    return () => {
      socketService.off('queued');
      socketService.off('game_found');
      socketService.off('private_game_created');
      socketService.off('game_started');
      socketService.off('your_symbol');
      socketService.off('game_update');
      socketService.off('game_finished');
      socketService.off('game_restarted');
      socketService.off('left_queue');
      socketService.off('error');
    };
  }, []);

  const isMyTurn = gameState?.currentPlayer === socketService.getSocket()?.id;

  const startMatchmaking = useCallback(() => {
    if (!playerName.trim()) {
      setGameMessage('Please enter your name first');
      return;
    }
    socketService.joinQueue(playerName.trim());
    setGameMessage('Looking for opponent...');
  }, [playerName]);

  const stopMatchmaking = useCallback(() => {
    socketService.leaveQueue();
  }, []);

  const createPrivateGame = useCallback(() => {
    if (!playerName.trim()) {
      setGameMessage('Please enter your name first');
      return;
    }
    socketService.createPrivateGame(playerName.trim());
  }, [playerName]);

  const joinPrivateGame = useCallback((gameId: string) => {
    if (!playerName.trim()) {
      setGameMessage('Please enter your name first');
      return;
    }
    socketService.joinPrivateGame(gameId, playerName.trim());
  }, [playerName]);

  const makeMove = useCallback((position: number) => {
    if (!gameState || !isMyTurn || gameState.board[position] !== null) {
      return;
    }
    socketService.makeMove(gameState.id, position);
  }, [gameState, isMyTurn]);

  const requestRematch = useCallback(() => {
    if (!gameState) return;
    socketService.requestRematch(gameState.id);
  }, [gameState]);

  const closeResultModal = useCallback(() => {
    setShowResultModal(false);
    setGameResult(null);
  }, []);

  const backToMenu = useCallback(() => {
    setGameState(null);
    setGamePhase('menu');
    setPlayerSymbol(null);
    setGameMessage('');
    setShowResultModal(false);
    setGameResult(null);
  }, []);

  return {
    gameState,
    gamePhase,
    playerSymbol,
    playerName,
    gameMessage,
    isMyTurn,
    isConnected,
    showResultModal,
    gameResult,
    
    setPlayerName,
    startMatchmaking,
    stopMatchmaking,
    createPrivateGame,
    joinPrivateGame,
    makeMove,
    requestRematch,
    closeResultModal,
    backToMenu
  };
};