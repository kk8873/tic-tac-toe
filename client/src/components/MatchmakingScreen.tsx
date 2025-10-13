import React from 'react';

interface MatchmakingScreenProps {
  message: string;
  onCancel: () => void;
}

export const MatchmakingScreen: React.FC<MatchmakingScreenProps> = ({
  message,
  onCancel
}) => {
  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 text-center">
        
        {/* Loading Animation */}
        <div className="mb-6">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Status Message */}
        <h2 className="text-2xl font-bold text-white mb-2">
          Finding Match...
        </h2>
        
        <p className="text-white/80 mb-6">
          {message}
        </p>

        {/* Animated Dots */}
        <div className="flex justify-center space-x-1 mb-8">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="px-6 py-3 text-lg font-medium text-white bg-white/20 hover:bg-white/30 
                   rounded-lg transition-all duration-200 border border-white/30"
        >
          Cancel Search
        </button>

        {/* Tips */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <p className="text-white/60 text-sm">
            💡 Tip: Make sure you have a stable internet connection
          </p>
        </div>
      </div>
    </div>
  );
};