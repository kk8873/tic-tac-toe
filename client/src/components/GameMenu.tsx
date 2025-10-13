import React, { useState } from 'react';
import { PlayerInput } from './PlayerInput';

interface GameMenuProps {
  playerName: string;
  onPlayerNameChange: (name: string) => void;
  onStartMatchmaking: () => void;
  onCreatePrivateGame: () => void;
  onJoinPrivateGame: (gameId: string) => void;
  isConnected: boolean;
}

export const GameMenu: React.FC<GameMenuProps> = ({
  playerName,
  onPlayerNameChange,
  onStartMatchmaking,
  onCreatePrivateGame,
  onJoinPrivateGame,
  isConnected
}) => {
  const [showPrivateGameInput, setShowPrivateGameInput] = useState(false);
  const [gameId, setGameId] = useState('');

  const handleJoinPrivateGame = () => {
    if (gameId.trim()) {
      onJoinPrivateGame(gameId.trim());
      setGameId('');
      setShowPrivateGameInput(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border-0 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-400/20 to-yellow-400/20 rounded-full blur-2xl transform -translate-x-12 translate-y-12"></div>
      <div className="text-center mb-16 relative z-10">
        <div className="mb-8">
          <h1 className="game-title text-5xl font-black text-yellow-400 mb-4 tracking-tight drop-shadow-lg">
            Tic-Tac-Toe
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 rounded-full mx-auto mb-8"></div>
          
          {/* Connection Status moved here */}
          <p className="text-white/90 text-base font-medium mb-6">Multiplayer • Real-time</p>
          <div className={`flex items-center justify-center rounded-full px-4 py-2 backdrop-blur-sm border mx-auto w-fit transition-all duration-300 ${
            isConnected ? 'bg-green-500/20 border-green-400/50 text-green-100' : 'bg-red-500/20 border-red-400/50 text-red-100'
          }`}>
            <div className={`w-2.5 h-2.5 rounded-full mr-3 transition-all duration-300 ${
              isConnected ? 'bg-green-400 shadow-lg shadow-green-400/50 animate-pulse' : 'bg-red-400 shadow-lg shadow-red-400/50'
            }`} />
            <span className="text-sm font-semibold">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Input Section with proper spacing */}
      <div className="mb-8 relative z-10">
        <PlayerInput
          value={playerName}
          onChange={onPlayerNameChange}
          placeholder="Enter your name"
        />
      </div>

      <div className="space-y-4 relative z-10">
        <button
          onClick={onStartMatchmaking}
          disabled={!playerName.trim() || !isConnected}
          className="find-match-button group w-full px-6 py-5 text-lg font-bold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 
                   rounded-2xl disabled:from-gray-500 disabled:to-gray-600 
                   disabled:cursor-not-allowed transition-all duration-300 min-h-[60px]
                   hover:shadow-2xl shadow-xl 
                   border border-white/20 relative overflow-hidden backdrop-blur-sm"
        >
          <span className="relative z-10 flex items-center justify-center">
            <span className="mr-2">🎯</span>
            Find Match
            <span className="ml-2 text-xl">⚡</span>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </button>

        <div className="flex space-x-3">
          <button
            onClick={onCreatePrivateGame}
            disabled={!playerName.trim() || !isConnected}
            className="create-private-button flex-1 px-4 py-4 text-sm font-semibold text-white bg-gradient-to-r from-white/15 to-white/8
                     disabled:from-gray-500/20 disabled:to-gray-600/20 disabled:cursor-not-allowed
                     rounded-2xl transition-all duration-300 border-0 min-h-[50px] shadow-lg
                     backdrop-blur-sm"
          >
            <span className="flex items-center justify-center text-center">
              <span className="mr-2 text-base">🔒</span>
              <span className="text-sm font-bold">Create Private</span>
            </span>
          </button>

          <button
            onClick={() => setShowPrivateGameInput(!showPrivateGameInput)}
            disabled={!playerName.trim() || !isConnected}
            className="join-private-button flex-1 px-4 py-4 text-sm font-semibold text-white bg-gradient-to-r from-white/15 to-white/8
                     disabled:from-gray-500/20 disabled:to-gray-600/20 disabled:cursor-not-allowed
                     rounded-2xl transition-all duration-300 border-0 min-h-[50px] shadow-lg
                     backdrop-blur-sm"
          >
            <span className="flex items-center justify-center text-center">
              <span className="mr-2 text-base">🎮</span>
              <span className="text-sm font-bold">Join Private</span>
            </span>
          </button>
        </div>

        {showPrivateGameInput && (
          <div className="space-y-4 p-6 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl border-0 backdrop-blur-xl shadow-2xl animate-in slide-in-from-top duration-300">
            <input
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="Enter Game ID"
              className="w-full px-4 py-4 text-base bg-white/95 rounded-2xl border-0 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-200 placeholder-gray-500 shadow-lg font-semibold"
            />
            <button
              onClick={handleJoinPrivateGame}
              disabled={!gameId.trim()}
              className="join-game-button w-full px-4 py-4 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 
                       disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed rounded-2xl transition-all duration-300 min-h-[50px]
                       shadow-lg hover:shadow-xl border-0"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">🚀</span>
                <span className="font-bold">Join Game</span>
              </span>
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 pt-5 border-t border-white/10 relative z-10">
        <div className="text-center">
          <p className="text-white/80 text-sm font-semibold mb-4 tracking-wide uppercase">Game Features</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center p-4 bg-gradient-to-b from-white/15 to-white/5 rounded-2xl backdrop-blur-sm border-0 shadow-lg">
              <span className="text-2xl mb-2 filter drop-shadow-sm">⚡</span>
              <span className="text-xs text-white/90 font-semibold">Real-time</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gradient-to-b from-white/15 to-white/5 rounded-2xl backdrop-blur-sm border-0 shadow-lg">
              <span className="text-2xl mb-2 filter drop-shadow-sm">📱</span>
              <span className="text-xs text-white/90 font-semibold">Mobile PWA</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gradient-to-b from-white/15 to-white/5 rounded-2xl backdrop-blur-sm border-0 shadow-lg">
              <span className="text-2xl mb-2 filter drop-shadow-sm">🛡️</span>
              <span className="text-xs text-white/90 font-semibold">Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};