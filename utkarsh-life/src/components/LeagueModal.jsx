import React, { useRef, useEffect } from 'react';
import { X, Trophy, ChevronRight } from 'lucide-react';
import { LEVELS, formatCoins } from '../utils/gameLogic';

export default function LeagueModal({ isOpen, onClose, coins, levelIndex }) {
  const currentLevel = LEVELS[levelIndex];
  const nextLevel = LEVELS[levelIndex + 1];
  
  const progress = nextLevel 
    ? Math.min(100, (coins / nextLevel.minCoins) * 100)
    : 100;
    
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      // Scroll to the active element
      const activeEl = scrollRef.current.querySelector('.active-league');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [isOpen, levelIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black neon-text-gold uppercase tracking-widest flex items-center gap-2">
          <Trophy className="w-6 h-6 text-[var(--color-cyber-gold)]" />
          Leagues
        </h2>
        <button onClick={onClose} className="p-2 glass-panel rounded-full text-white hover:text-[var(--color-cyber-pink)] hover:border-[var(--color-cyber-pink)] transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      {nextLevel && (
        <div className="glass-panel p-4 mb-6 shadow-[0_0_15px_rgba(255,215,0,0.2)] border-[var(--color-cyber-gold)]">
          <h3 className="font-bold text-sm text-center mb-2">Road to {nextLevel.name}</h3>
          <div className="flex justify-between text-xs mb-1 font-bold">
            <span className="text-[var(--color-cyber-gold)]">{formatCoins(coins)}</span>
            <span className="text-gray-400">{formatCoins(nextLevel.minCoins)}</span>
          </div>
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden shadow-inner border border-gray-700">
            <div 
              className="h-full bg-gradient-to-r from-[var(--color-cyber-gold)] to-yellow-300 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(255,215,0,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-8 scrollbar-hide">
        {LEVELS.map((level, idx) => {
          const isActive = idx === levelIndex;
          const isUnlocked = idx <= levelIndex;
          
          return (
            <div 
              key={idx}
              className={`glass-panel p-4 flex items-center justify-between transition-all ${
                isActive ? 'border-[var(--color-cyber-gold)] shadow-[0_0_15px_rgba(255,215,0,0.3)] bg-[var(--color-cyber-dark)] active-league transform scale-[1.02]' : 
                isUnlocked ? 'border-[var(--color-cyber-blue)] opacity-90' : 
                'border-gray-800 opacity-50 grayscale'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg ${
                  isActive ? 'border-[var(--color-cyber-gold)] bg-gradient-to-br from-yellow-900 to-black' : 
                  isUnlocked ? 'border-[var(--color-cyber-blue)] bg-[var(--color-cyber-dark)]' : 
                  'border-gray-700 bg-gray-900'
                }`}>
                  <Trophy className={`w-7 h-7 ${
                    isActive ? 'text-[var(--color-cyber-gold)] drop-shadow-[0_0_8px_rgba(255,215,0,1)]' : 
                    isUnlocked ? 'text-[var(--color-cyber-blue)]' : 
                    'text-gray-600'
                  }`} />
                </div>
                <div>
                  <h3 className={`font-black text-lg ${isActive ? 'neon-text-gold' : isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                    {level.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-gray-400">From</span>
                    <div className="flex items-center gap-1 font-bold">
                      <span className={`text-[10px] ${isUnlocked ? 'text-[var(--color-cyber-gold)]' : 'text-gray-500'}`}>₹</span>
                      <span className={`text-xs ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>{formatCoins(level.minCoins)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {isActive && (
                <div className="px-3 py-1 bg-[var(--color-cyber-gold)] text-black font-black text-xs rounded-full shadow-[0_0_10px_rgba(255,215,0,0.5)]">
                  CURRENT
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
