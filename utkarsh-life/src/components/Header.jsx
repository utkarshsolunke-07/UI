import React from 'react';
import { formatCoins, LEVELS } from '../utils/gameLogic';
import { Settings, UserCircle2 } from 'lucide-react';

export default function Header({ pph, levelIndex }) {
  const currentLevel = LEVELS[levelIndex];
  
  return (
    <div className="flex flex-col px-4 pt-4 pb-2 bg-gradient-to-b from-[var(--color-cyber-dark)] to-transparent sticky top-0 z-40">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <UserCircle2 className="w-8 h-8 text-[var(--color-cyber-blue)] drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" />
          <span className="font-bold text-sm text-white">Utkarsh (CEO)</span>
        </div>
        <button className="p-2 glass-panel hover:bg-[var(--color-cyber-blue)] transition-colors group">
          <Settings className="w-5 h-5 text-[var(--color-cyber-blue)] group-hover:text-black" />
        </button>
      </div>
      
      <div className="flex gap-2">
        <div className="flex-1 glass-panel p-2 flex flex-col justify-center items-center">
          <span className="text-[10px] text-[var(--color-cyber-pink)] uppercase font-black tracking-wider mb-1">Rank</span>
          <span className="text-xs font-bold neon-text-blue">{currentLevel.name}</span>
        </div>
        
        <div className="flex-[2] glass-panel p-2 flex flex-col justify-center items-center">
          <span className="text-[10px] text-[var(--color-cyber-pink)] uppercase font-black tracking-wider mb-1">Profit per hour</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-[var(--color-cyber-gold)] flex items-center justify-center text-black text-[10px] font-bold shadow-[0_0_5px_rgba(255,215,0,0.5)]">₹</div>
            <span className="text-sm font-bold neon-text-gold">+{formatCoins(pph)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
