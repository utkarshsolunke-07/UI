import React, { useState } from 'react';
import { formatCoins, calculateUpgradeCost, calculateUpgradePph, getDailyComboCards } from '../utils/gameLogic';
import { soundManager } from '../utils/soundManager';
import { TrendingUp, Lock, HelpCircle } from 'lucide-react';

export default function Mine({ coins, upgrades, onBuy, comboFound, onComboCardFound }) {
  const [activeCategory, setActiveCategory] = useState('PR & Team');
  const categories = ['PR & Team', 'Markets', 'Legal', 'Web3', 'Specials'];

  const targetComboCards = getDailyComboCards();

  const handleBuy = (upgrade) => {
    const cost = calculateUpgradeCost(upgrade.cost, upgrade.level);
    const addedPph = calculateUpgradePph(upgrade.pph, upgrade.level) - (upgrade.level > 0 ? calculateUpgradePph(upgrade.pph, upgrade.level - 1) : 0);
    soundManager.playPurchase();
    onBuy(upgrade.id, cost, addedPph);
    
    if (targetComboCards.includes(upgrade.id) && !comboFound.includes(upgrade.id)) {
      onComboCardFound(upgrade.id);
    }
  };

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-24">
      {/* Daily Combo UI */}
      <div className="mb-4 glass-panel p-3 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <span className="font-bold text-sm neon-text-blue">Daily Combo</span>
          <div className="flex items-center gap-1 font-bold text-[var(--color-cyber-gold)] text-xs bg-[var(--color-cyber-dark)] px-2 py-1 rounded-full border border-[var(--color-cyber-gold)] shadow-[0_0_10px_rgba(255,215,0,0.3)]">
            <span>₹</span>
            <span>+5,000,000</span>
          </div>
        </div>
        <div className="flex justify-between gap-2">
          {[0, 1, 2].map((index) => {
            const foundCardId = comboFound[index];
            const foundCard = foundCardId ? upgrades.find(u => u.id === foundCardId) : null;
            
            return (
              <div key={index} className={`flex-1 aspect-square rounded-xl border flex flex-col items-center justify-center relative overflow-hidden transition-all ${foundCard ? 'border-[var(--color-cyber-gold)] bg-[var(--color-cyber-dark)] shadow-[0_0_15px_rgba(255,215,0,0.4)]' : 'border-[var(--color-cyber-border)] bg-transparent'}`}>
                {foundCard ? (
                  <>
                    <TrendingUp className="w-5 h-5 text-[var(--color-cyber-gold)] mb-1 drop-shadow-[0_0_5px_rgba(255,215,0,0.8)]" />
                    <span className="text-[9px] font-bold text-center leading-tight px-1 neon-text-gold">{foundCard.name}</span>
                    <div className="absolute inset-0 bg-yellow-900/20" />
                  </>
                ) : (
                  <HelpCircle className="w-6 h-6 text-[var(--color-cyber-blue)] opacity-50" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-6 glass-panel p-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeCategory === cat 
                ? 'bg-[var(--color-cyber-blue)] text-black shadow-[0_0_10px_rgba(0,240,255,0.5)]' 
                : 'text-gray-400 hover:text-[var(--color-cyber-blue)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Upgrade Cards */}
      <div className="grid grid-cols-2 gap-3 overflow-y-auto pb-4">
        {upgrades
          .filter((u) => u.category === activeCategory)
          .map((u) => {
            const cost = calculateUpgradeCost(u.cost, u.level);
            const currentPph = u.level > 0 ? calculateUpgradePph(u.pph, u.level - 1) : 0;
            const nextPph = calculateUpgradePph(u.pph, u.level);
            const pphIncrease = nextPph - currentPph;
            
            const canAfford = coins >= cost;

            return (
              <div 
                key={u.id} 
                className={`glass-panel p-3 flex flex-col justify-between transition-all ${
                  canAfford ? 'hover:border-[var(--color-cyber-blue)] hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer' : 'opacity-60 cursor-not-allowed'
                }`}
                onClick={() => canAfford && handleBuy(u)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border overflow-hidden ${canAfford ? 'bg-[var(--color-cyber-dark)] border-[var(--color-cyber-blue)] shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'bg-gray-800 border-gray-700'}`}>
                    {u.image ? (
                      <img src={u.image} alt={u.name} className="w-full h-full object-cover" />
                    ) : (
                      <TrendingUp className={`w-6 h-6 ${canAfford ? 'text-[var(--color-cyber-blue)] drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]' : 'text-gray-500'}`} />
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[var(--color-cyber-pink)] font-bold uppercase drop-shadow-[0_0_5px_rgba(255,0,127,0.5)]">lvl {u.level}</span>
                  </div>
                </div>
                
                <h3 className="font-bold text-sm mb-1 line-clamp-1">{u.name}</h3>
                
                <div className="flex justify-between text-xs mb-3">
                  <span className="text-gray-400">Profit per hour</span>
                  <div className="flex items-center gap-1 font-bold text-[var(--color-cyber-gold)]">
                    <span className="text-[10px]">₹</span>
                    <span>+{formatCoins(pphIncrease)}</span>
                  </div>
                </div>
                
                <div className={`border-t pt-3 flex items-center justify-center gap-2 ${canAfford ? 'border-[var(--color-cyber-border)]' : 'border-gray-800'}`}>
                  {!canAfford && <Lock className="w-3 h-3 text-gray-500" />}
                  <div className="flex items-center gap-1">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-black text-[10px] font-bold ${canAfford ? 'bg-[var(--color-cyber-gold)] shadow-[0_0_5px_rgba(255,215,0,0.5)]' : 'bg-gray-600'}`}>₹</div>
                    <span className={`font-bold ${canAfford ? 'text-white' : 'text-gray-500'}`}>
                      {formatCoins(cost)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
