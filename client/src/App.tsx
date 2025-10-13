import React from 'react';
import { useGame } from './hooks/useGame';
import { GameMenu } from './components/GameMenu';
import { GameInterface } from './components/GameInterface';
import { MatchmakingScreen } from './components/MatchmakingScreen';
import { GameResultModal } from './components/GameResultModal';
import { socketService } from './services/socket';

function App() {
  const {
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
  } = useGame();

  const renderCurrentPhase = () => {
    switch (gamePhase) {
      case 'menu':
        return (
          <GameMenu
            playerName={playerName}
            onPlayerNameChange={setPlayerName}
            onStartMatchmaking={startMatchmaking}
            onCreatePrivateGame={createPrivateGame}
            onJoinPrivateGame={joinPrivateGame}
            isConnected={isConnected}
          />
        );

      case 'matchmaking':
        return (
          <MatchmakingScreen
            message={gameMessage}
            onCancel={stopMatchmaking}
          />
        );

      case 'playing':
      case 'finished':
        if (!gameState) return null;
        return (
          <GameInterface
            gameState={gameState}
            playerSymbol={playerSymbol}
            isMyTurn={isMyTurn}
            gameMessage={gameMessage}
            onCellClick={makeMove}
            onRequestRematch={requestRematch}
            onBackToMenu={backToMenu}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="w-full max-w-lg relative z-10">
        {renderCurrentPhase()}
        
        {/* Global Message Display */}
        {gameMessage && gamePhase === 'menu' && (
          <div className="mt-6 text-center animate-in fade-in slide-in-from-top duration-500">
            <div className="inline-block px-6 py-3 bg-gradient-to-r from-black/20 to-black/10 backdrop-blur-sm rounded-2xl text-white/95 text-sm font-medium border border-white/20 shadow-xl">
              {gameMessage}
            </div>
          </div>
        )}
      </div>

      {/* Game Result Modal */}
      {gameResult && (
        <GameResultModal
          isVisible={showResultModal}
          winner={gameResult.winner}
          isDraw={gameResult.isDraw}
          pointsAwarded={gameResult.pointsAwarded}
          leaderboard={gameResult.leaderboard}
          currentPlayerId={socketService.getSocket()?.id || ''}
          onClose={closeResultModal}
          onRematch={requestRematch}
          onBackToMenu={backToMenu}
        />
      )}
    </div>
  );
}

export default App;
