import React from 'react';
import { Bot, Zap, Flame, Brain, X, Lock, CheckCircle2 } from 'lucide-react';
import { formatCoins, calculateSkillCost } from '../utils/gameLogic';

const ICON_MAP = {
  Bot,
  Zap,
  Flame,
  Brain
};

export default function SkillsModal({ isOpen, onClose, skills, coins, onUpgradeSkill }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-6 relative max-h-[85vh] flex flex-col border-[var(--color-cyber-blue)] shadow-[0_0_40px_rgba(0,240,255,0.3)]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black neon-text-blue uppercase tracking-widest">Skill Tree</h2>
            <p className="text-xs text-gray-400">Unlock permanent abilities & multipliers</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center text-gray-400 hover:text-white hover:border-[var(--color-cyber-pink)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Skills list */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {skills.map((skill) => {
            const IconComponent = ICON_MAP[skill.icon] || Bot;
            const isMaxed = skill.level >= skill.maxLevel;
            const cost = calculateSkillCost(skill.baseCost, skill.costMultiplier, skill.level);
            const canAfford = coins >= cost && !isMaxed;

            return (
              <div 
                key={skill.id} 
                className={`glass-panel p-4 flex flex-col justify-between transition-all ${
                  isMaxed ? 'border-green-500/50 bg-green-950/20' :
                  canAfford ? 'hover:border-[var(--color-cyber-blue)] hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]' : 'opacity-60'
                }`}
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${
                    isMaxed ? 'bg-green-950 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' :
                    canAfford ? 'bg-[var(--color-cyber-dark)] border-[var(--color-cyber-blue)] shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'bg-gray-800 border-gray-700'
                  }`}>
                    <IconComponent className={`w-6 h-6 ${
                      isMaxed ? 'text-green-400' :
                      canAfford ? 'text-[var(--color-cyber-blue)] drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]' : 'text-gray-500'
                    }`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-sm text-white">{skill.name}</h3>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        isMaxed ? 'bg-green-900/60 text-green-300 border border-green-500' : 'bg-gray-800 text-[var(--color-cyber-pink)]'
                      }`}>
                        {isMaxed ? 'MAX' : `Lvl ${skill.level}/${skill.maxLevel}`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 leading-snug">{skill.desc}</p>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-[var(--color-cyber-border)]">
                  {isMaxed ? (
                    <div className="flex items-center gap-1 text-green-400 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Fully Mastered</span>
                    </div>
                  ) : (
                    <button
                      disabled={!canAfford}
                      onClick={() => onUpgradeSkill(skill.id, cost)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                        canAfford 
                          ? 'bg-[var(--color-cyber-gold)] text-black font-black shadow-[0_0_10px_rgba(255,215,0,0.5)] hover:bg-white' 
                          : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                      }`}
                    >
                      {!canAfford && <Lock className="w-3 h-3" />}
                      <span>Upgrade: ₹{formatCoins(cost)}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
