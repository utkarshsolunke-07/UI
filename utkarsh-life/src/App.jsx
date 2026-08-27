import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Exchange from './components/Exchange';
import Mine from './components/Mine';
import Earn from './components/Earn';
import Friends from './components/Friends';
import Airdrop from './components/Airdrop';
import { INITIAL_UPGRADES, LEVELS, MAX_ENERGY_LEVELS, RECHARGE_RATE_PER_SEC, getLevelIndex, getDailyComboCards } from './utils/gameLogic';

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

  // Daily States
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  
  const [dailyCipherSolved, setDailyCipherSolved] = useState(() => {
    const saved = localStorage.getItem('ul_cipher');
    return saved === getTodayStr();
  });

  const [comboFound, setComboFound] = useState(() => {
    const savedDate = localStorage.getItem('ul_combo_date');
    if (savedDate === getTodayStr()) {
      return JSON.parse(localStorage.getItem('ul_combo_cards') || '[]');
    }
    return [];
  });

  const [lastLoginDate, setLastLoginDate] = useState(() => localStorage.getItem('ul_login_date'));
  const [currentStreak, setCurrentStreak] = useState(() => parseInt(localStorage.getItem('ul_streak') || '0', 10));

  const [offlineEarnings, setOfflineEarnings] = useState(0);

  const levelIndex = getLevelIndex(coins);
  const maxEnergy = MAX_ENERGY_LEVELS[levelIndex] || MAX_ENERGY_LEVELS[MAX_ENERGY_LEVELS.length - 1];
  
  const pph = upgrades.reduce((total, u) => {
    if (u.level > 0) {
      let uPph = 0;
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
        setEnergy(prev => Math.min(prev + Math.floor(RECHARGE_RATE_PER_SEC * deltaSec), maxEnergy));
        
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
      if (deltaSec > 60 && pph > 0) {
        const maxOfflineSec = 3 * 3600; // max 3 hours
        const effectiveSec = Math.min(deltaSec, maxOfflineSec);
        const earned = Math.floor((pph / 3600) * effectiveSec);
        setOfflineEarnings(earned);
        setCoins(prev => prev + earned);
      }
    }
  }, []); 

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('ul_coins', Math.floor(coins).toString());
    localStorage.setItem('ul_energy', energy.toString());
    localStorage.setItem('ul_upgrades', JSON.stringify(upgrades));
    localStorage.setItem('ul_last_time', lastSavedTime.toString());
    
    if (dailyCipherSolved) localStorage.setItem('ul_cipher', getTodayStr());
    localStorage.setItem('ul_combo_date', getTodayStr());
    localStorage.setItem('ul_combo_cards', JSON.stringify(comboFound));
    
    if (lastLoginDate) localStorage.setItem('ul_login_date', lastLoginDate);
    localStorage.setItem('ul_streak', currentStreak.toString());
  }, [coins, energy, upgrades, lastSavedTime, dailyCipherSolved, comboFound, lastLoginDate, currentStreak]);

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

  const handleCipherSolved = () => {
    setDailyCipherSolved(true);
    setCoins(prev => prev + 1000000);
    alert("Cipher Solved! You earned 1,000,000 coins.");
  };

  const handleComboCardFound = (cardId) => {
    const newCombo = [...comboFound, cardId];
    setComboFound(newCombo);
    if (newCombo.length === 3) {
      setCoins(prev => prev + 5000000);
      alert("Daily Combo Found! You earned 5,000,000 coins.");
    }
  };

  const canClaimToday = lastLoginDate !== getTodayStr();
  const handleClaimDailyReward = (amount) => {
    if (canClaimToday) {
      setCoins(prev => prev + amount);
      setCurrentStreak(prev => prev + 1);
      setLastLoginDate(getTodayStr());
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
            onCipherSolved={handleCipherSolved}
            cipherSolved={dailyCipherSolved}
          />
        )}
        {activeTab === 'mine' && (
          <Mine 
            coins={Math.floor(coins)} 
            upgrades={upgrades} 
            onBuy={handleBuyUpgrade} 
            comboFound={comboFound}
            onComboCardFound={handleComboCardFound}
          />
        )}
        {activeTab === 'friends' && (
          <Friends coins={coins} />
        )}
        {activeTab === 'earn' && (
          <Earn 
            coins={coins}
            onClaimDailyReward={handleClaimDailyReward}
            currentStreak={currentStreak}
            canClaimToday={canClaimToday}
          />
        )}
        {activeTab === 'airdrop' && (
          <Airdrop />
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
