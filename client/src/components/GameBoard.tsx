import React from 'react';
import type { GameState } from '../types/game';

interface GameBoardProps {
  gameState: GameState;
  isMyTurn: boolean;
  onCellClick: (position: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  gameState, 
  isMyTurn, 
  onCellClick 
}) => {
  return (
    <div className="game-board">
      {gameState.board.map((cell, index) => {
        const isEmpty = cell === null;
        const isClickable = isEmpty && isMyTurn && gameState.status === 'playing';
        
        return (
          <button
            key={index}
            className={`
              game-cell
              ${!isClickable ? 'disabled' : ''}
              ${cell === 'X' ? 'x' : cell === 'O' ? 'o' : ''}
            `}
            onClick={() => isClickable && onCellClick(index)}
            disabled={!isClickable}
            aria-label={`Cell ${index + 1}, ${cell || 'empty'}`}
          >
            {cell}
          </button>
        );
      })}
    </div>
  );
};