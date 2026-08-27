import React from 'react';
import { X, Award, CheckCircle2, Lock } from 'lucide-react';
import { formatCoins } from '../utils/gameLogic';

export const ACHIEVEMENTS_LIST = [
  { id: 'ach_1', name: 'First Million', desc: 'Reach a balance of 1,000,000 coins', reward: 100000, condition: (state) => state.coins >= 1000000 },
  { id: 'ach_2', name: 'Key Master', desc: 'Collect at least 5 keys', reward: 250000, condition: (state) => state.keysCount >= 5 },
  { id: 'ach_3', name: 'Skin Collector', desc: 'Unlock at least 2 CEO skins', reward: 500000, condition: (state) => state.unlockedSkins.length >= 2 },
  { id: 'ach_4', name: 'Upgrade Guru', desc: 'Upgrade at least 10 cards', reward: 300000, condition: (state) => state.upgrades.filter(u => u.level > 0).length >= 10 },
  { id: 'ach_5', name: 'Cipher Hacker', desc: 'Solve the Daily Cipher', reward: 500000, condition: (state) => state.dailyCipherSolved },
];

export default function AchievementsModal({ isOpen, onClose, gameState }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-6 relative max-h-[85vh] flex flex-col border-[var(--color-cyber-blue)] shadow-[0_0_40px_rgba(0,240,255,0.3)]">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Award className="w-7 h-7 text-[var(--color-cyber-blue)] drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
            <div>
              <h2 className="text-2xl font-black text-[var(--color-cyber-blue)] uppercase tracking-widest">Achievements</h2>
              <p className="text-xs text-gray-400">Unlock milestones for coin rewards</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          {ACHIEVEMENTS_LIST.map((ach) => {
            const isCompleted = ach.condition(gameState);

            return (
              <div 
                key={ach.id}
                className={`glass-panel p-4 flex items-center justify-between transition-all ${
                  isCompleted 
                    ? 'border-green-500/50 bg-green-950/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]' 
                    : 'opacity-60 border-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    isCompleted ? 'bg-green-900/40 border-green-500 text-green-400' : 'bg-gray-800 border-gray-700 text-gray-500'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white leading-snug">{ach.name}</h3>
                    <p className="text-[10px] text-gray-400 mb-1">{ach.desc}</p>
                    <span className="text-[10px] font-bold text-[var(--color-cyber-gold)]">Reward: +₹{formatCoins(ach.reward)}</span>
                  </div>
                </div>

                {isCompleted && (
                  <span className="text-xs font-black text-green-400 uppercase tracking-wider bg-green-950 px-2 py-1 rounded-lg border border-green-500/40">
                    Unlocked
                  </span>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
