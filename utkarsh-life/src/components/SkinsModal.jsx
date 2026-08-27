import React from 'react';
import { X, Lock, Check } from 'lucide-react';
import { CEO_SKINS, formatCoins } from '../utils/gameLogic';

export default function SkinsModal({ isOpen, onClose, coins, levelIndex, selectedSkin, onSelectSkin, unlockedSkins, onBuySkin }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-6 relative max-h-[85vh] flex flex-col border-[var(--color-cyber-pink)] shadow-[0_0_40px_rgba(255,0,127,0.3)]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black text-[var(--color-cyber-pink)] uppercase tracking-widest drop-shadow-[0_0_10px_rgba(255,0,127,0.8)]">CEO Skins</h2>
            <p className="text-xs text-gray-400">Customize your avatar look & style</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center text-gray-400 hover:text-white hover:border-[var(--color-cyber-pink)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Skins Grid */}
        <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1 flex-1">
          {CEO_SKINS.map((skin) => {
            const isUnlocked = unlockedSkins.includes(skin.id) || levelIndex >= skin.requiredLevel;
            const isSelected = selectedSkin === skin.id;
            const canAfford = coins >= skin.cost;

            return (
              <div
                key={skin.id}
                className={`glass-panel p-4 flex flex-col items-center justify-between text-center transition-all ${
                  isSelected 
                    ? 'border-2 border-[var(--color-cyber-blue)] shadow-[0_0_20px_rgba(0,240,255,0.6)] bg-cyan-950/20' 
                    : isUnlocked ? 'hover:border-gray-500 cursor-pointer' : 'opacity-60 border-gray-800'
                }`}
                onClick={() => isUnlocked && onSelectSkin(skin.id)}
              >
                <div className="h-16 flex items-center justify-center my-2 drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                  {skin.image ? (
                    <img src={skin.image} alt={skin.name} className="max-h-full object-contain" />
                  ) : (
                    <span className="text-5xl">{skin.emoji}</span>
                  )}
                </div>
                
                <div className="w-full">
                  <div className="flex justify-center items-center gap-2 mb-1">
                    <span className="font-bold text-sm neon-text-blue">{skin.name}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mb-2 leading-tight">{skin.desc}</p>
                  
                  {skin.multiplier > 1 && (
                    <div className="text-[10px] font-black text-yellow-400 mb-3 bg-yellow-900/30 border border-yellow-500/50 py-1 px-2 rounded-lg inline-block">
                      ⚡ NFT: +{(skin.multiplier * 100 - 100).toFixed(0)}% PPH
                    </div>
                  )}
                </div>

                {isSelected ? (
                  <div className="w-full py-2 bg-[var(--color-cyber-blue)] text-black font-black text-xs rounded-xl flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(0,240,255,0.5)]">
                    <Check className="w-4 h-4" />
                    <span>Equipped</span>
                  </div>
                ) : isUnlocked ? (
                  <button 
                    onClick={() => onSelectSkin(skin.id)}
                    className="w-full py-2 bg-gray-800 border border-gray-700 text-white font-bold text-xs rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    Select
                  </button>
                ) : (
                  <button 
                    disabled={!canAfford}
                    onClick={(e) => {
                      e.stopPropagation();
                      canAfford && onBuySkin(skin.id, skin.cost);
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                      canAfford 
                        ? 'bg-[var(--color-cyber-gold)] text-black font-black shadow-[0_0_10px_rgba(255,215,0,0.5)]' 
                        : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                    }`}
                  >
                    {!canAfford && <Lock className="w-3 h-3" />}
                    <span>Buy: ₹{formatCoins(skin.cost)}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
