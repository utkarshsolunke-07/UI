import React from 'react';
import { formatCoins, LEVELS } from '../utils/gameLogic';
import { Settings, UserCircle2 } from 'lucide-react';

export default function Header({ pph, levelIndex }) {
  const currentLevel = LEVELS[levelIndex];
  
  return (
    <div className="flex flex-col px-4 pt-4 pb-2 bg-gradient-to-b from-black/80 to-transparent sticky top-0 z-40 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <UserCircle2 className="w-8 h-8 text-gray-400" />
          <span className="font-semibold text-sm">Utkarsh (CEO)</span>
        </div>
        <button className="p-2 bg-gray-800 rounded-lg">
          <Settings className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      
      <div className="flex gap-2">
        <div className="flex-1 bg-card-bg/80 border border-gray-800 rounded-xl p-2 flex flex-col justify-center items-center">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Rank</span>
          <span className="text-xs font-bold text-accent-gold">{currentLevel.name}</span>
        </div>
        
        <div className="flex-[2] bg-card-bg/80 border border-gray-800 rounded-xl p-2 flex flex-col justify-center items-center">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Profit per hour</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-accent-gold flex items-center justify-center text-black text-[10px] font-bold">₹</div>
            <span className="text-sm font-bold">+{formatCoins(pph)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
