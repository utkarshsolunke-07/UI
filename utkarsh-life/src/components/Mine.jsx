import React, { useState } from 'react';
import { formatCoins, calculateUpgradeCost, calculateUpgradePph } from '../utils/gameLogic';
import { TrendingUp, Lock } from 'lucide-react';

export default function Mine({ coins, upgrades, onBuy }) {
  const [activeCategory, setActiveCategory] = useState('PR & Team');
  const categories = ['PR & Team', 'Markets', 'Legal'];

  const handleBuy = (upgrade) => {
    const cost = calculateUpgradeCost(upgrade.cost, upgrade.level);
    const addedPph = calculateUpgradePph(upgrade.pph, upgrade.level) - (upgrade.level > 0 ? calculateUpgradePph(upgrade.pph, upgrade.level - 1) : 0);
    onBuy(upgrade.id, cost, addedPph);
  };

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-24">
      {/* Categories */}
      <div className="flex gap-2 mb-6 bg-card-bg p-1 rounded-xl border border-gray-800">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeCategory === cat 
                ? 'bg-gray-700 text-white shadow-md' 
                : 'text-gray-400 hover:text-gray-200'
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
            // new pph it gives - old pph
            const currentPph = u.level > 0 ? calculateUpgradePph(u.pph, u.level - 1) : 0;
            const nextPph = calculateUpgradePph(u.pph, u.level);
            const pphIncrease = nextPph - currentPph;
            
            const canAfford = coins >= cost;

            return (
              <div 
                key={u.id} 
                className={`bg-card-bg border rounded-2xl p-3 flex flex-col justify-between transition-all ${
                  canAfford ? 'border-gray-700 hover:border-gray-500 cursor-pointer' : 'border-gray-800 opacity-60 cursor-not-allowed'
                }`}
                onClick={() => canAfford && handleBuy(u)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center border border-gray-700">
                    <TrendingUp className="w-6 h-6 text-accent-gold" />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">lvl {u.level}</span>
                  </div>
                </div>
                
                <h3 className="font-bold text-sm mb-1 line-clamp-1">{u.name}</h3>
                
                <div className="flex justify-between text-xs mb-3">
                  <span className="text-gray-400">Profit per hour</span>
                  <div className="flex items-center gap-1 font-bold text-accent-gold">
                    <span className="text-[10px]">₹</span>
                    <span>+{formatCoins(pphIncrease)}</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-800 pt-3 flex items-center justify-center gap-2">
                  {!canAfford && <Lock className="w-3 h-3 text-gray-500" />}
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-accent-gold flex items-center justify-center text-black text-[10px] font-bold">₹</div>
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
