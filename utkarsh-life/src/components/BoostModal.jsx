import React from 'react';
import { Zap, Hand, BatteryCharging, X, Lock, CheckCircle2 } from 'lucide-react';
import { formatCoins, calculateBoosterCost } from '../utils/gameLogic';

export default function BoostModal({ 
  isOpen, 
  onClose, 
  coins, 
  multitapLevel, 
  energyLimitLevel, 
  freeRefillsLeft, 
  onUseFreeRefill, 
  onBuyMultitap, 
  onBuyEnergyLimit 
}) {
  if (!isOpen) return null;

  const multitapCost = calculateBoosterCost(2000, multitapLevel);
  const energyLimitCost = calculateBoosterCost(2000, energyLimitLevel);

  const canAffordMultitap = coins >= multitapCost;
  const canAffordEnergyLimit = coins >= energyLimitCost;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-6 relative max-h-[85vh] flex flex-col border-[var(--color-cyber-gold)] shadow-[0_0_40px_rgba(255,215,0,0.3)]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black neon-text-gold uppercase tracking-widest">Boosters</h2>
            <p className="text-xs text-gray-400">Increase tap power & energy limits</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center text-gray-400 hover:text-white hover:border-[var(--color-cyber-pink)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Free Daily Boosters */}
          <h3 className="text-xs font-black text-[var(--color-cyber-blue)] uppercase tracking-wider">Free Daily Boosters</h3>
          
          <div className="glass-panel p-4 flex items-center justify-between border-[var(--color-cyber-blue)] shadow-[0_0_10px_rgba(0,240,255,0.2)]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-blue)] flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                <Zap className="w-6 h-6 text-[var(--color-cyber-blue)] drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Full Energy Refill</h4>
                <p className="text-xs text-gray-400">{freeRefillsLeft}/6 available today</p>
              </div>
            </div>

            <button
              disabled={freeRefillsLeft <= 0}
              onClick={onUseFreeRefill}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                freeRefillsLeft > 0 
                  ? 'bg-[var(--color-cyber-blue)] text-black font-black shadow-[0_0_15px_rgba(0,240,255,0.5)] hover:bg-white' 
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
              }`}
            >
              Refill Free
            </button>
          </div>

          {/* Paid Boosters */}
          <h3 className="text-xs font-black text-[var(--color-cyber-gold)] uppercase tracking-wider mt-4">Boosters</h3>

          {/* Multitap */}
          <div className="glass-panel p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gold)] flex items-center justify-center shadow-[0_0_10px_rgba(255,215,0,0.3)]">
                <Hand className="w-6 h-6 text-[var(--color-cyber-gold)] drop-shadow-[0_0_5px_rgba(255,215,0,0.8)]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Multitap</h4>
                <p className="text-xs text-gray-400">+{multitapLevel + 1} per tap • Lvl {multitapLevel}</p>
              </div>
            </div>

            <button
              disabled={!canAffordMultitap}
              onClick={() => onBuyMultitap(multitapCost)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                canAffordMultitap 
                  ? 'bg-[var(--color-cyber-gold)] text-black font-black shadow-[0_0_15px_rgba(255,215,0,0.5)] hover:bg-white' 
                  : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
              }`}
            >
              {!canAffordMultitap && <Lock className="w-3 h-3" />}
              <span>₹{formatCoins(multitapCost)}</span>
            </button>
          </div>

          {/* Energy Limit */}
          <div className="glass-panel p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gold)] flex items-center justify-center shadow-[0_0_10px_rgba(255,215,0,0.3)]">
                <BatteryCharging className="w-6 h-6 text-[var(--color-cyber-gold)] drop-shadow-[0_0_5px_rgba(255,215,0,0.8)]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Energy Limit</h4>
                <p className="text-xs text-gray-400">+500 capacity • Lvl {energyLimitLevel}</p>
              </div>
            </div>

            <button
              disabled={!canAffordEnergyLimit}
              onClick={() => onBuyEnergyLimit(energyLimitCost)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                canAffordEnergyLimit 
                  ? 'bg-[var(--color-cyber-gold)] text-black font-black shadow-[0_0_15px_rgba(255,215,0,0.5)] hover:bg-white' 
                  : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
              }`}
            >
              {!canAffordEnergyLimit && <Lock className="w-3 h-3" />}
              <span>₹{formatCoins(energyLimitCost)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
