import React from 'react';
import { formatCoins, LEVELS, CEO_SKINS } from '../utils/gameLogic';
import { Settings, Cpu, Zap, Key, Shirt, ChevronRight, CloudUpload, CloudCog } from 'lucide-react';

export default function Header({ pph, levelIndex, keysCount, selectedSkin, onOpenSkills, onOpenBoost, onOpenSkins, onOpenLeague, isSyncing }) {
  const currentLevel = LEVELS[levelIndex];
  const activeSkinObj = CEO_SKINS.find(s => s.id === selectedSkin) || CEO_SKINS[0];
  
  return (
    <div className="flex flex-col px-4 pt-4 pb-2 bg-gradient-to-b from-[var(--color-cyber-dark)] to-transparent sticky top-0 z-40">
      {/* Top Profile & Utility Buttons */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <button 
            onClick={onOpenSkins}
            className="flex items-center gap-2 glass-panel px-2.5 py-1 hover:border-[var(--color-cyber-pink)] transition-all cursor-pointer group"
          >
            {activeSkinObj.image ? (
              <img src={activeSkinObj.image} alt="Avatar" className="w-8 h-8 object-contain drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" />
            ) : (
              <span className="text-xl drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]">{activeSkinObj.emoji}</span>
            )}
            <div className="text-left">
              <span className="font-bold text-xs text-white block leading-none">Utkarsh</span>
              <span className="text-[9px] text-[var(--color-cyber-pink)] font-black uppercase tracking-wider">Skins 👕</span>
            </div>
          </button>
          
          {/* Write-Behind Sync Indicator */}
          <div className={`flex items-center justify-center p-1.5 rounded-full transition-all duration-300 ${isSyncing ? 'bg-[var(--color-cyber-blue)]/20 shadow-[0_0_10px_rgba(0,240,255,0.5)]' : 'bg-transparent opacity-30'}`}>
            {isSyncing ? <CloudUpload className="w-4 h-4 text-[var(--color-cyber-blue)] animate-pulse" /> : <CloudCog className="w-4 h-4 text-gray-500" />}
          </div>
        </div>

        <div className="flex gap-1.5">
          <button 
            onClick={onOpenBoost}
            className="px-2.5 py-1.5 glass-panel border-[var(--color-cyber-gold)] flex items-center gap-1 text-xs font-black text-[var(--color-cyber-gold)] hover:bg-[var(--color-cyber-gold)] hover:text-black transition-all shadow-[0_0_10px_rgba(255,215,0,0.3)]"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Boost</span>
          </button>
          
          <button 
            onClick={onOpenSkills}
            className="px-2.5 py-1.5 glass-panel border-[var(--color-cyber-blue)] flex items-center gap-1 text-xs font-black text-[var(--color-cyber-blue)] hover:bg-[var(--color-cyber-blue)] hover:text-black transition-all shadow-[0_0_10px_rgba(0,240,255,0.3)]"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Skills</span>
          </button>
        </div>
      </div>
      
      {/* Rank, Keys & PPH Bar */}
      <div className="flex gap-1.5">
        <button onClick={onOpenLeague} className="flex-1 glass-panel p-1.5 flex flex-col justify-center items-center hover:border-[var(--color-cyber-pink)] transition-all cursor-pointer group">
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-[var(--color-cyber-pink)] uppercase font-black tracking-wider mb-0.5">Rank</span>
            <ChevronRight className="w-3 h-3 text-[var(--color-cyber-pink)] group-hover:translate-x-0.5 transition-transform" />
          </div>
          <span className="text-xs font-bold neon-text-blue line-clamp-1">{currentLevel.name}</span>
        </button>

        <div className="flex-1 glass-panel p-1.5 flex flex-col justify-center items-center border-yellow-500/50">
          <span className="text-[9px] text-yellow-400 uppercase font-black tracking-wider mb-0.5">Keys</span>
          <div className="flex items-center gap-1 text-xs font-black text-yellow-400">
            <Key className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span>{keysCount}</span>
          </div>
        </div>
        
        <div className="flex-[2] glass-panel p-1.5 flex flex-col justify-center items-center">
          <span className="text-[9px] text-[var(--color-cyber-pink)] uppercase font-black tracking-wider mb-0.5">Profit per hour</span>
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 rounded-full bg-[var(--color-cyber-gold)] flex items-center justify-center text-black text-[9px] font-bold shadow-[0_0_5px_rgba(255,215,0,0.5)]">₹</div>
            <span className="text-xs font-bold neon-text-gold">+{formatCoins(pph)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
