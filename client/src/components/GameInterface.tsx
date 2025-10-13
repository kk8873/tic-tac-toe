import React from 'react';
import { GameBoard } from './GameBoard';
import type { GameState } from '../types/game';

interface GameInterfaceProps {
  gameState: GameState;
  playerSymbol: 'X' | 'O' | null;
  isMyTurn: boolean;
  gameMessage: string;
  onCellClick: (position: number) => void;
  onRequestRematch: () => void;
  onBackToMenu: () => void;
}

export const GameInterface: React.FC<GameInterfaceProps> = ({
  gameState,
  playerSymbol,
  isMyTurn,
  gameMessage,
  onCellClick,
  onRequestRematch,
  onBackToMenu
}) => {
  const myPlayer = gameState.players.find(p => p.symbol === playerSymbol);
  const opponent = gameState.players.find(p => p.symbol !== playerSymbol);

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Mobile Header with Back Button */}
      <div className="flex items-center justify-between mb-4 pt-2">
        <button
          onClick={onBackToMenu}
          className="flex items-center px-3 py-2 text-sm font-medium text-white bg-white/20 
                   hover:bg-white/30 rounded-full transition-all duration-200 shadow-lg"
        >
          <span className="mr-1">←</span> Back
        </button>
        
        <div className="text-white text-right">
          <div className="text-xs opacity-80">Game ID</div>
          <div className="text-xs font-mono">{gameState.id.substring(0, 8)}...</div>
        </div>
      </div>
      
      {/* Header */}
      <div className="text-center mb-6">

        {/* Player Info */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center text-white">
            <div className="text-center flex-1">
              <div className="text-lg font-semibold">{myPlayer?.name || 'You'}</div>
              <div className="text-sm opacity-80">({playerSymbol})</div>
            </div>
            
            <div className="text-2xl mx-4 opacity-50">VS</div>
            
            <div className="text-center flex-1">
              <div className="text-lg font-semibold">{opponent?.name || 'Opponent'}</div>
              <div className="text-sm opacity-80">({opponent?.symbol || '?'})</div>
            </div>
          </div>
        </div>

        {/* Game Status */}
        <div className="mb-6">
          <div className={`
            px-4 py-3 rounded-lg text-center font-medium
            ${gameState.status === 'finished' 
              ? gameState.winner 
                ? gameState.winner === playerSymbol 
                  ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
                  : 'bg-red-500/20 text-red-100 border border-red-400/30'
                : 'bg-yellow-500/20 text-yellow-100 border border-yellow-400/30'
              : isMyTurn 
                ? 'bg-blue-500/20 text-blue-100 border border-blue-400/30' 
                : 'bg-white/10 text-white/80 border border-white/20'
            }
          `}>
            {gameMessage}
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className={`mb-6 ${gameState.status === 'finished' ? 'mb-32' : ''}`}>
        <GameBoard
          gameState={gameState}
          isMyTurn={isMyTurn}
          onCellClick={onCellClick}
        />
      </div>

      {/* Game Controls - Mobile Style */}
      {gameState.status === 'finished' && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 border-t border-gray-700 p-4 safe-area-inset-bottom">
          <div className="max-w-md mx-auto space-y-3">
            <button
              onClick={onRequestRematch}
            className="w-full px-6 py-4 text-base font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 
                     rounded-xl hover:from-green-600 hover:to-green-700 transform transition-all duration-200 
                     active:scale-95 shadow-xl border border-white/20"
            >
            <span className="text-xl mr-2">🔄</span> Play Again
            </button>
            
            <button
              onClick={onBackToMenu}
            className="w-full px-6 py-4 text-base font-semibold text-white bg-gradient-to-r from-gray-600 to-gray-700 
                     rounded-xl hover:from-gray-700 hover:to-gray-800 transform transition-all duration-200 
                     active:scale-95 shadow-xl border border-white/20"
            >
            <span className="text-xl mr-2">🏠</span> Back to Menu
            </button>
          </div>
        </div>
      )}

      {/* Turn Indicator */}
      {gameState.status === 'playing' && (
        <div className="text-center mb-20">
          <div className={`
            inline-flex items-center px-4 py-2 rounded-full text-sm font-medium
            ${isMyTurn 
              ? 'bg-blue-500/20 text-blue-100' 
              : 'bg-white/10 text-white/80'
            }
          `}>
            {isMyTurn ? '🎯 Your Turn' : '⏳ Waiting...'}
          </div>
        </div>
      )}
    </div>
  );
};