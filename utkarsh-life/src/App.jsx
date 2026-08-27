import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Exchange from './components/Exchange';
import Mine from './components/Mine';
import { INITIAL_UPGRADES, LEVELS, MAX_ENERGY_LEVELS, RECHARGE_RATE_PER_SEC, getLevelIndex } from './utils/gameLogic';

function App() {
  const [activeTab, setActiveTab] = useState('exchange');
  
  // Game State
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('ul_coins');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const [energy, setEnergy] = useState(() => {
    const saved = localStorage.getItem('ul_energy');
    return saved ? parseInt(saved, 10) : MAX_ENERGY_LEVELS[0];
  });
  
  const [upgrades, setUpgrades] = useState(() => {
    const saved = localStorage.getItem('ul_upgrades');
    return saved ? JSON.parse(saved) : INITIAL_UPGRADES;
  });

  const [lastSavedTime, setLastSavedTime] = useState(() => {
    const saved = localStorage.getItem('ul_last_time');
    return saved ? parseInt(saved, 10) : Date.now();
  });

  const [offlineEarnings, setOfflineEarnings] = useState(0);

  const levelIndex = getLevelIndex(coins);
  const maxEnergy = MAX_ENERGY_LEVELS[levelIndex] || MAX_ENERGY_LEVELS[MAX_ENERGY_LEVELS.length - 1];
  
  const pph = upgrades.reduce((total, u) => {
    if (u.level > 0) {
      // we need a helper to calc total pph of an upgrade based on its level
      // Actually INITIAL_UPGRADES has pph which we recalculate.
      // Wait, in Hamster Kombat, PPH is explicitly shown. Let's calculate total PPH.
      let uPph = 0;
      let currentBase = u.pph;
      for (let i = 1; i <= u.level; i++) {
        uPph += Math.floor(u.pph * Math.pow(1.2, i));
      }
      return total + uPph;
    }
    return total;
  }, 0);

  // Auto-save & energy recharge & passive income
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const deltaSec = (now - lastSavedTime) / 1000;
      
      if (deltaSec >= 1) {
        // Energy recharge
        setEnergy(prev => Math.min(prev + Math.floor(RECHARGE_RATE_PER_SEC * deltaSec), maxEnergy));
        
        // Passive income (PPH is per hour, so divide by 3600 per sec)
        if (pph > 0) {
          const earned = (pph / 3600) * deltaSec;
          setCoins(prev => prev + earned);
        }

        setLastSavedTime(now);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lastSavedTime, maxEnergy, pph]);

  // Offline earnings calculation on mount
  useEffect(() => {
    const now = Date.now();
    const savedTime = localStorage.getItem('ul_last_time');
    if (savedTime) {
      const deltaSec = (now - parseInt(savedTime, 10)) / 1000;
      if (deltaSec > 60 && pph > 0) { // minimum 1 minute to show offline earnings
        const maxOfflineSec = 3 * 3600; // max 3 hours
        const effectiveSec = Math.min(deltaSec, maxOfflineSec);
        const earned = Math.floor((pph / 3600) * effectiveSec);
        setOfflineEarnings(earned);
        setCoins(prev => prev + earned);
      }
    }
  }, []); // Run once on mount

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('ul_coins', Math.floor(coins).toString());
    localStorage.setItem('ul_energy', energy.toString());
    localStorage.setItem('ul_upgrades', JSON.stringify(upgrades));
    localStorage.setItem('ul_last_time', lastSavedTime.toString());
  }, [coins, energy, upgrades, lastSavedTime]);

  const handleTap = (tapCount = 1) => {
    if (energy >= tapCount) {
      setEnergy(prev => prev - tapCount);
      setCoins(prev => prev + tapCount);
    }
  };

  const handleBuyUpgrade = (upgradeId, cost, addedPph) => {
    if (coins >= cost) {
      setCoins(prev => prev - cost);
      setUpgrades(prev => prev.map(u => {
        if (u.id === upgradeId) {
          return { ...u, level: u.level + 1 };
        }
        return u;
      }));
    }
  };

  return (
    <div className="flex flex-col h-full bg-game-bg text-white max-w-md mx-auto relative overflow-hidden shadow-2xl border-x border-gray-900">
      <Header coins={Math.floor(coins)} pph={pph} levelIndex={levelIndex} />
      
      <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
        {activeTab === 'exchange' && (
          <Exchange 
            coins={Math.floor(coins)} 
            energy={energy} 
            maxEnergy={maxEnergy} 
            onTap={handleTap} 
            levelIndex={levelIndex}
          />
        )}
        {activeTab === 'mine' && (
          <Mine 
            coins={Math.floor(coins)} 
            upgrades={upgrades} 
            onBuy={handleBuyUpgrade} 
          />
        )}
        {activeTab === 'friends' && (
          <div className="p-6 text-center text-gray-400 mt-20">
            <h2 className="text-2xl font-bold mb-4 text-white">Friends</h2>
            <p>Invite friends and get bonuses. (Coming Soon)</p>
          </div>
        )}
        {activeTab === 'earn' && (
          <div className="p-6 text-center text-gray-400 mt-20">
            <h2 className="text-2xl font-bold mb-4 text-white">Earn</h2>
            <p>Complete tasks to earn more coins. (Coming Soon)</p>
          </div>
        )}
        {activeTab === 'airdrop' && (
          <div className="p-6 text-center text-gray-400 mt-20">
            <h2 className="text-2xl font-bold mb-4 text-white">Airdrop</h2>
            <p>Connect your TON wallet. (Coming Soon)</p>
          </div>
        )}
      </div>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {offlineEarnings > 0 && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-card-bg p-8 rounded-3xl border border-accent-gold shadow-[0_0_50px_rgba(251,191,36,0.3)] text-center w-full max-w-xs transform scale-100 animate-bounce-short">
            <h3 className="text-xl font-bold mb-4">Offline Earnings</h3>
            <div className="text-4xl font-bold text-accent-gold mb-6 flex items-center justify-center gap-2">
              <span className="w-8 h-8 rounded-full bg-accent-gold flex items-center justify-center text-black text-sm">₹</span>
              +{offlineEarnings}
            </div>
            <button 
              className="bg-accent-gold text-black w-full py-3 rounded-xl font-bold text-lg"
              onClick={() => setOfflineEarnings(0)}
            >
              Collect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
