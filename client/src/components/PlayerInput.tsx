import React, { useState } from 'react';

interface PlayerInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export const PlayerInput: React.FC<PlayerInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "Enter your name",
  maxLength = 20 
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative group">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`player-input
          w-full px-6 py-5 text-lg font-semibold text-gray-900 bg-gradient-to-r from-white to-gray-50
          border-2 rounded-2xl transition-all duration-300 min-h-[60px]
          ${focused ? 'border-blue-500 ring-4 ring-blue-100 shadow-lg shadow-blue-100/50 bg-gradient-to-r from-blue-50 to-white' : 
            'border-white/50'}
          placeholder-gray-500 focus:outline-none backdrop-blur-sm
          shadow-xl hover:shadow-2xl
        `}
      />
      
      {/* Subtle glow effect when focused */}
      {focused && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/10 to-purple-400/10 animate-pulse pointer-events-none"></div>
      )}
    </div>
  );
};