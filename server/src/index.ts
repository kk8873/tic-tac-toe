import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import { GameLogic } from './gameLogic';
import { MatchmakingService } from './matchmaking';
import { Player, GameMove } from './types';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const gameLogic = new GameLogic();
const matchmaking = new MatchmakingService(gameLogic);

// REST API endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/games', (req, res) => {
  const games = gameLogic.getAllGames();
  res.json(games);
});

app.get('/api/leaderboard', (req, res) => {
  const leaderboard = gameLogic.getLeaderboard();
  res.json(leaderboard);
});

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('join_queue', (playerData: { name: string }) => {
    const player: Player = {
      id: socket.id,
      name: playerData.name || `Player_${socket.id.substring(0, 6)}`,
      symbol: 'X',
      wins: 0,
      losses: 0,
      draws: 0,
      points: 0,
      gamesPlayed: 0
    };

    const result = matchmaking.addPlayerToQueue(player);
    
    if (result.matched && result.game) {
      // Notify both players about the match
      result.game.players.forEach(p => {
        io.to(p.id).emit('game_found', {
          game: result.game,
          yourSymbol: p.symbol
        });
      });
      
      // Join both players to game room
      result.game.players.forEach(p => {
        io.sockets.sockets.get(p.id)?.join(result.game!.id);
      });
      
      console.log(`Game ${result.game.id} started between ${result.game.players.map(p => p.name).join(' vs ')}`);
    } else {
      socket.emit('queued', {
        message: 'Looking for opponent...',
        queueStatus: matchmaking.getQueueStatus()
      });
    }
  });

  socket.on('create_private_game', (playerData: { name: string }) => {
    const player: Player = {
      id: socket.id,
      name: playerData.name || `Player_${socket.id.substring(0, 6)}`,
      symbol: 'X',
      wins: 0,
      losses: 0,
      draws: 0,
      points: 0,
      gamesPlayed: 0
    };

    const game = matchmaking.createPrivateGame(player);
    socket.join(game.id);
    
    socket.emit('private_game_created', {
      game,
      gameId: game.id,
      yourSymbol: player.symbol
    });
    
    console.log(`Private game ${game.id} created by ${player.name}`);
  });

  socket.on('join_private_game', (data: { gameId: string, playerData: { name: string } }) => {
    const player: Player = {
      id: socket.id,
      name: data.playerData.name || `Player_${socket.id.substring(0, 6)}`,
      symbol: 'O',
      wins: 0,
      losses: 0,
      draws: 0,
      points: 0,
      gamesPlayed: 0
    };

    const game = matchmaking.joinPrivateGame(data.gameId, player);
    
    if (game) {
      socket.join(game.id);
      
      // Notify both players
      io.to(game.id).emit('game_started', {
        game,
        message: 'Game started!'
      });
      
      game.players.forEach(p => {
        io.to(p.id).emit('your_symbol', { symbol: p.symbol });
      });
      
      console.log(`Player ${player.name} joined private game ${game.id}`);
    } else {
      socket.emit('error', {
        message: 'Could not join game. Game may be full or not exist.'
      });
    }
  });

  socket.on('make_move', (moveData: { gameId: string, position: number }) => {
    const move: GameMove = {
      gameId: moveData.gameId,
      playerId: socket.id,
      position: moveData.position
    };

    const result = gameLogic.makeMove(move);
    
    if (result.success && result.game) {
      // Broadcast game update to all players in the game
      io.to(result.game.id).emit('game_update', {
        game: result.game
      });
      
      if (result.game.status === 'finished') {
        let message = '';
        let pointsAwarded: { [playerId: string]: number } = {};
        
        if (result.game.winner) {
          const winnerPlayer = result.game.players.find(p => p.symbol === result.game!.winner);
          const loserPlayer = result.game.players.find(p => p.symbol !== result.game!.winner);
          message = `${winnerPlayer?.name} wins! +200 pts`;
          
          if (winnerPlayer) pointsAwarded[winnerPlayer.id] = 200;
          if (loserPlayer) pointsAwarded[loserPlayer.id] = 0;
        } else if (result.game.isDraw) {
          message = "It's a draw! +50 pts each";
          result.game.players.forEach(player => {
            pointsAwarded[player.id] = 50;
          });
        }
        
        // Get updated leaderboard
        const leaderboard = gameLogic.getLeaderboard();
        
        io.to(result.game.id).emit('game_finished', {
          game: result.game,
          message,
          pointsAwarded,
          leaderboard
        });
        
        console.log(`Game ${result.game.id} finished: ${message}`);
      }
    } else {
      socket.emit('error', {
        message: result.error || 'Invalid move'
      });
    }
  });

  socket.on('leave_queue', () => {
    matchmaking.removePlayerFromQueue(socket.id);
    socket.emit('left_queue', { message: 'Left matchmaking queue' });
  });

  socket.on('request_rematch', (data: { gameId: string }) => {
    const game = gameLogic.getGame(data.gameId);
    
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    const isPlayerInGame = game.players.some(p => p.id === socket.id);
    if (!isPlayerInGame) {
      socket.emit('error', { message: 'You are not in this game' });
      return;
    }

    // Restart the game
    const restartedGame = gameLogic.restartGame(data.gameId);
    
    if (restartedGame) {
      // Notify both players about the rematch
      io.to(data.gameId).emit('game_restarted', {
        game: restartedGame,
        message: 'New game started! Symbols switched.'
      });

      // Send updated symbol info to each player
      restartedGame.players.forEach(player => {
        io.to(player.id).emit('your_symbol', { symbol: player.symbol });
      });

      console.log(`Game ${data.gameId} restarted by player ${socket.id}`);
    } else {
      socket.emit('error', { message: 'Could not restart game' });
    }
  });

  socket.on('disconnect', () => {
    matchmaking.removePlayerFromQueue(socket.id);
    console.log('Player disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🎮 WebSocket server ready for connections`);
  console.log(`🌐 CORS enabled for: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
});