import React from 'react';
import type { LeaderboardEntry } from '../types/game';

interface GameResultModalProps {
  isVisible: boolean;
  winner: string | null;
  isDraw: boolean;
  pointsAwarded: { [playerId: string]: number };
  leaderboard: LeaderboardEntry[];
  currentPlayerId: string;
  onClose: () => void;
  onRematch: () => void;
  onBackToMenu: () => void;
}

export const GameResultModal: React.FC<GameResultModalProps> = ({
  isVisible,
  winner,
  isDraw,
  pointsAwarded,
  leaderboard,
  currentPlayerId,
  onClose,
  onRematch,
  onBackToMenu
}) => {
  if (!isVisible) return null;

  const currentPlayerPoints = pointsAwarded[currentPlayerId] || 0;
  const isWinner = winner && pointsAwarded[currentPlayerId] > 0;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{backgroundColor: 'rgba(0, 0, 0, 0.3)'}}>
      <div className="w-full max-w-sm mx-4 relative" style={{backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '85vh', overflow: 'auto', minWidth: '300px'}}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full"
          style={{backgroundColor: '#374151', color: '#d1d5db', cursor: 'pointer'}}
          onMouseEnter={(e) => {
            const target = e.target as HTMLElement;
            target.style.backgroundColor = '#4b5563';
            target.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            const target = e.target as HTMLElement;
            target.style.backgroundColor = '#374151';
            target.style.color = '#d1d5db';
          }}
        >
          ✕
        </button>
        
        {/* Header */}
        <div style={{textAlign: 'center', padding: '24px', paddingBottom: '16px'}}>
          <div style={{fontSize: '2.5rem', marginBottom: '12px'}}>
            {isDraw ? '🤝' : isWinner ? '🏆' : '😢'}
          </div>
          
          <h2 style={{
            fontSize: '1.125rem', 
            fontWeight: 'bold', 
            marginBottom: '8px',
            color: isDraw ? '#fbbf24' : isWinner ? '#4ade80' : '#f87171',
            lineHeight: '1.2'
          }}>
            {isDraw ? 'DRAW!' : isWinner ? 'WINNER!' : 'BETTER LUCK NEXT TIME!'}
          </h2>
          
          <div style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: currentPlayerPoints > 0 ? '#4ade80' : '#9ca3af'
          }}>
            {currentPlayerPoints > 0 ? `+${currentPlayerPoints} pts` : '+0 pts'}
          </div>
        </div>

        {/* Leaderboard */}
        <div style={{paddingLeft: '20px', paddingRight: '20px', paddingBottom: '16px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}>
            <span style={{fontSize: '1rem'}}>🏆</span>
            <h3 style={{fontSize: '1rem', fontWeight: '600', color: '#ffffff'}}>Leaderboard</h3>
          </div>
          
          <div style={{backgroundColor: '#000000', borderRadius: '8px', padding: '12px', border: '1px solid #1f2937'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '8px', paddingLeft: '8px', paddingRight: '8px'}}>
              <span>Player</span>
              <span>W/L/D</span>
              <span>Score</span>
            </div>
            
            {leaderboard.slice(0, 3).map((entry) => {
              const isCurrentPlayer = entry.playerId === currentPlayerId;
              
              return (
                <div
                  key={entry.playerId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    paddingLeft: '8px',
                    paddingRight: '8px',
                    borderRadius: '4px',
                    marginBottom: '4px',
                    backgroundColor: isCurrentPlayer ? 'rgba(37, 99, 235, 0.3)' : 'rgba(31, 41, 55, 0.5)',
                    border: isCurrentPlayer ? '1px solid rgba(59, 130, 246, 0.5)' : 'none'
                  }}
                >
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <span style={{color: '#9ca3af', fontSize: '0.75rem', width: '16px'}}>
                      {entry.rank}.
                    </span>
                    <span style={{
                      marginLeft: '8px',
                      fontWeight: '500',
                      fontSize: '0.8rem',
                      color: isCurrentPlayer ? '#93c5fd' : '#ffffff'
                    }}>
                      {entry.name.length > 8 ? entry.name.substring(0, 8) + '...' : entry.name}
                      {isCurrentPlayer && <span style={{fontSize: '0.65rem', color: '#60a5fa'}}> (you)</span>}
                    </span>
                  </div>
                  
                  <span style={{color: '#d1d5db', fontSize: '0.8rem'}}>
                    {entry.wins}/{entry.losses}/{entry.draws}
                  </span>
                  
                  <div style={{textAlign: 'right'}}>
                    <div style={{
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      color: isCurrentPlayer ? '#93c5fd' : '#ffffff'
                    }}>
                      {entry.points}
                    </div>
                    <div style={{fontSize: '0.7rem', color: '#9ca3af'}}>
                      {entry.gamesPlayed}m
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};