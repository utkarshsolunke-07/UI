import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Exchange from './components/Exchange';
import Mine from './components/Mine';
import Earn from './components/Earn';
import Friends from './components/Friends';
import Airdrop from './components/Airdrop';
import SkillsModal from './components/SkillsModal';
import BoostModal from './components/BoostModal';
import SkinsModal from './components/SkinsModal';
import LeagueModal from './components/LeagueModal';
import MarketEventBanner from './components/MarketEventBanner';
import { 
  INITIAL_UPGRADES, 
  INITIAL_SKILLS, 
  LEVELS, 
  MAX_ENERGY_LEVELS, 
  RECHARGE_RATE_PER_SEC, 
  getLevelIndex, 
  getDailyComboCards,
  MARKET_EVENTS,
  CEO_SKINS
} from './utils/gameLogic';

function App() {
  const [activeTab, setActiveTab] = useState('exchange');
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isBoostOpen, setIsBoostOpen] = useState(false);
  const [isSkinsOpen, setIsSkinsOpen] = useState(false);
  const [isLeagueOpen, setIsLeagueOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Game State
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('ul_coins');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [keysCount, setKeysCount] = useState(() => {
    const saved = localStorage.getItem('ul_keys');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const [upgrades, setUpgrades] = useState(() => {
    const saved = localStorage.getItem('ul_upgrades');
    return saved ? JSON.parse(saved) : INITIAL_UPGRADES;
  });

  const [skills, setSkills] = useState(() => {
    const saved = localStorage.getItem('ul_skills');
    return saved ? JSON.parse(saved) : INITIAL_SKILLS;
  });

  // Booster States
  const [multitapLevel, setMultitapLevel] = useState(() => {
    const saved = localStorage.getItem('ul_multitap');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [energyLimitLevel, setEnergyLimitLevel] = useState(() => {
    const saved = localStorage.getItem('ul_energy_limit');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [freeRefillsLeft, setFreeRefillsLeft] = useState(() => {
    const savedDate = localStorage.getItem('ul_refill_date');
    const today = new Date().toISOString().split('T')[0];
    if (savedDate === today) {
      const savedCount = localStorage.getItem('ul_refills_left');
      return savedCount ? parseInt(savedCount, 10) : 6;
    }
    return 6;
  });

  // Skins State
  const [selectedSkin, setSelectedSkin] = useState(() => {
    return localStorage.getItem('ul_selected_skin') || 'skin_default';
  });

  const [unlockedSkins, setUnlockedSkins] = useState(() => {
    const saved = localStorage.getItem('ul_unlocked_skins');
    return saved ? JSON.parse(saved) : ['skin_default'];
  });

  const [upiId, setUpiId] = useState(() => {
    return localStorage.getItem('ul_upi') || '';
  });

  const [lastSavedTime, setLastSavedTime] = useState(() => {
    const saved = localStorage.getItem('ul_last_time');
    return saved ? parseInt(saved, 10) : Date.now();
  });

  // Dynamic Market Event State
  const [activeEvent, setActiveEvent] = useState(null);
  const [eventTimeLeft, setEventTimeLeft] = useState(0);

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
  const baseMaxEnergy = MAX_ENERGY_LEVELS[levelIndex] || MAX_ENERGY_LEVELS[MAX_ENERGY_LEVELS.length - 1];
  const maxEnergy = baseMaxEnergy + (energyLimitLevel * 500);

  const [energy, setEnergy] = useState(() => {
    const saved = localStorage.getItem('ul_energy');
    return saved ? parseInt(saved, 10) : maxEnergy;
  });
  
  // Calculate PPH with Skill Multipliers & Market Events
  const basePph = upgrades.reduce((total, u) => {
    if (u.level > 0) {
      let uPph = 0;
      for (let i = 1; i <= u.level; i++) {
        uPph += Math.floor(u.pph * Math.pow(1.2, i));
      }
      return total + uPph;
    }
    return total;
  }, 0);

  const intelSkill = skills.find(s => s.id === 's4');
  const intelMultiplier = 1 + (intelSkill ? intelSkill.level * 0.05 : 0);

  let eventMultiplier = 1;
  if (activeEvent?.id === 'bull_run') eventMultiplier = 2;
  if (activeEvent?.id === 'bear_market') eventMultiplier = 0.5;
  if (activeEvent?.id === 'hmstr_collapse') eventMultiplier = 0.1;
  if (activeEvent?.id === 'token_burn') eventMultiplier = 3;

  const activeSkinObj = CEO_SKINS.find(s => s.id === selectedSkin) || CEO_SKINS[0];
  const skinMultiplier = activeSkinObj.multiplier || 1;

  const pph = Math.floor(basePph * intelMultiplier * eventMultiplier * skinMultiplier);

  // Energy Recharge Calculation based on Skill Tree
  const rechargeSkill = skills.find(s => s.id === 's2');
  const effectiveRechargeRate = RECHARGE_RATE_PER_SEC + (rechargeSkill ? rechargeSkill.level : 0);

  // Auto-Tap Bot Skill logic
  const autoTapSkill = skills.find(s => s.id === 's1');
  const autoTapRate = autoTapSkill ? autoTapSkill.level : 0; // coins per sec

  const tapPower = 1 + multitapLevel;

  // Auto-save & energy recharge & passive income & auto-bot
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const deltaSec = (now - lastSavedTime) / 1000;
      
      if (deltaSec >= 1) {
        setEnergy(prev => Math.min(prev + Math.floor(effectiveRechargeRate * deltaSec), maxEnergy));
        
        let earned = 0;
        if (pph > 0) {
          earned += (pph / 3600) * deltaSec;
        }

        // Auto Bot Taps
        if (autoTapRate > 0) {
          earned += autoTapRate * deltaSec;
        }

        if (earned > 0) {
          setCoins(prev => prev + earned);
        }

        setLastSavedTime(now);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lastSavedTime, maxEnergy, pph, effectiveRechargeRate, autoTapRate]);

  // Market Event Timer & Random Generator
  useEffect(() => {
    let eventTimer;
    if (activeEvent && eventTimeLeft > 0) {
      eventTimer = setInterval(() => {
        setEventTimeLeft(prev => {
          if (prev <= 1) {
            setActiveEvent(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(eventTimer);
  }, [activeEvent, eventTimeLeft]);

  // Random Market Event Trigger every 90s
  useEffect(() => {
    const triggerTimer = setInterval(() => {
      if (!activeEvent && Math.random() > 0.4) {
        const randomEvent = MARKET_EVENTS[Math.floor(Math.random() * MARKET_EVENTS.length)];
        setActiveEvent(randomEvent);
        if (randomEvent.id === 'energy_surge') {
          setEnergy(maxEnergy);
          setTimeout(() => setActiveEvent(null), 3000);
        } else {
          setEventTimeLeft(randomEvent.durationSec);
        }
      }
    }, 90000);

    return () => clearInterval(triggerTimer);
  }, [activeEvent, maxEnergy]);

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

  // Save to localStorage with Client-Side Debouncing (Sync Simulation)
  useEffect(() => {
    setIsSyncing(true);
    
    const handler = setTimeout(() => {
      localStorage.setItem('ul_coins', Math.floor(coins).toString());
      localStorage.setItem('ul_keys', keysCount.toString());
      localStorage.setItem('ul_energy', energy.toString());
      localStorage.setItem('ul_upgrades', JSON.stringify(upgrades));
      localStorage.setItem('ul_skills', JSON.stringify(skills));
      localStorage.setItem('ul_multitap', multitapLevel.toString());
      localStorage.setItem('ul_energy_limit', energyLimitLevel.toString());
      localStorage.setItem('ul_refills_left', freeRefillsLeft.toString());
      localStorage.setItem('ul_refill_date', getTodayStr());
      localStorage.setItem('ul_selected_skin', selectedSkin);
      localStorage.setItem('ul_unlocked_skins', JSON.stringify(unlockedSkins));
      localStorage.setItem('ul_last_time', lastSavedTime.toString());
      
      if (dailyCipherSolved) localStorage.setItem('ul_cipher', getTodayStr());
      localStorage.setItem('ul_combo_date', getTodayStr());
      localStorage.setItem('ul_combo_cards', JSON.stringify(comboFound));
      
      if (lastLoginDate) localStorage.setItem('ul_login_date', lastLoginDate);
      localStorage.setItem('ul_streak', currentStreak.toString());
      localStorage.setItem('ul_upi', upiId);

      setIsSyncing(false);
    }, 2500); // 2.5s debounce simulating write-behind cache payload

    return () => clearTimeout(handler);
  }, [coins, keysCount, energy, upgrades, skills, multitapLevel, energyLimitLevel, freeRefillsLeft, selectedSkin, unlockedSkins, lastSavedTime, dailyCipherSolved, comboFound, lastLoginDate, currentStreak, upiId]);

  const handleTap = (amount = 1) => {
    const energyCost = tapPower;
    if (energy >= energyCost) {
      // Check for Critical Tap Skill
      const critSkill = skills.find(s => s.id === 's3');
      const critChance = critSkill ? critSkill.level * 0.05 : 0;
      const isCrit = Math.random() < critChance;
      const finalMultiplier = isCrit ? 5 : 1;

      setEnergy(prev => prev - energyCost);
      setCoins(prev => prev + (amount * finalMultiplier));
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

  const handleUpgradeSkill = (skillId, cost) => {
    if (coins >= cost) {
      setCoins(prev => prev - cost);
      setSkills(prev => prev.map(s => {
        if (s.id === skillId && s.level < s.maxLevel) {
          return { ...s, level: s.level + 1 };
        }
        return s;
      }));
    }
  };

  const handleUseFreeRefill = () => {
    if (freeRefillsLeft > 0) {
      setFreeRefillsLeft(prev => prev - 1);
      setEnergy(maxEnergy);
    }
  };

  const handleBuyMultitap = (cost) => {
    if (coins >= cost) {
      setCoins(prev => prev - cost);
      setMultitapLevel(prev => prev + 1);
    }
  };

  const handleBuyEnergyLimit = (cost) => {
    if (coins >= cost) {
      setCoins(prev => prev - cost);
      setEnergyLimitLevel(prev => prev + 1);
    }
  };

  const handleBuySkin = (skinId, cost) => {
    if (coins >= cost && !unlockedSkins.includes(skinId)) {
      setCoins(prev => prev - cost);
      const newUnlocked = [...unlockedSkins, skinId];
      setUnlockedSkins(newUnlocked);
      setSelectedSkin(skinId);
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

  const handleMinigameReward = (amount) => {
    setCoins(prev => prev + amount);
  };

  const handleWinKey = (count = 1) => {
    setKeysCount(prev => prev + count);
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-white max-w-md mx-auto relative overflow-hidden shadow-2xl border-x border-[var(--color-cyber-border)]">
      <Header 
        coins={Math.floor(coins)} 
        pph={pph} 
        levelIndex={levelIndex} 
        keysCount={keysCount}
        selectedSkin={selectedSkin}
        onOpenSkills={() => setIsSkillsOpen(true)}
        onOpenBoost={() => setIsBoostOpen(true)}
        onOpenSkins={() => setIsSkinsOpen(true)}
        onOpenLeague={() => setIsLeagueOpen(true)}
        isSyncing={isSyncing}
      />

      <MarketEventBanner 
        event={activeEvent}
        timeLeft={eventTimeLeft}
        onResolveBearMarket={() => setActiveEvent(null)}
      />
      
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
            selectedSkin={selectedSkin}
            tapPower={tapPower}
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
            onMinigameReward={handleMinigameReward}
            onWinKey={handleWinKey}
          />
        )}
        {activeTab === 'airdrop' && (
          <Airdrop upiId={upiId} setUpiId={setUpiId} />
        )}
      </div>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <SkillsModal 
        isOpen={isSkillsOpen}
        onClose={() => setIsSkillsOpen(false)}
        skills={skills}
        coins={coins}
        onUpgradeSkill={handleUpgradeSkill}
      />

      <BoostModal 
        isOpen={isBoostOpen}
        onClose={() => setIsBoostOpen(false)}
        coins={coins}
        multitapLevel={multitapLevel}
        energyLimitLevel={energyLimitLevel}
        freeRefillsLeft={freeRefillsLeft}
        onUseFreeRefill={handleUseFreeRefill}
        onBuyMultitap={handleBuyMultitap}
        onBuyEnergyLimit={handleBuyEnergyLimit}
      />

      <SkinsModal 
        isOpen={isSkinsOpen}
        onClose={() => setIsSkinsOpen(false)}
        coins={coins}
        levelIndex={levelIndex}
        selectedSkin={selectedSkin}
        onSelectSkin={setSelectedSkin}
        unlockedSkins={unlockedSkins}
        onBuySkin={handleBuySkin}
      />

      <LeagueModal 
        isOpen={isLeagueOpen}
        onClose={() => setIsLeagueOpen(false)}
        coins={coins}
        levelIndex={levelIndex}
      />

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
