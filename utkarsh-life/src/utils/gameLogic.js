export const LEVELS = [
  { name: 'Bronze', minCoins: 0 },
  { name: 'Silver', minCoins: 5000 },
  { name: 'Gold', minCoins: 25000 },
  { name: 'Platinum', minCoins: 100000 },
  { name: 'Diamond', minCoins: 1000000 },
  { name: 'Epic', minCoins: 2000000 },
  { name: 'Legendary', minCoins: 10000000 },
  { name: 'Master', minCoins: 50000000 },
  { name: 'GrandMaster', minCoins: 100000000 },
  { name: 'Lord', minCoins: 1000000000 },
  { name: 'Creator', minCoins: 18000000000 },
];

export const MAX_ENERGY_LEVELS = [
  1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 7000, 8000, 10000
];

export const RECHARGE_RATE_PER_SEC = 3;

export function getLevelIndex(coins) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (coins >= LEVELS[i].minCoins) {
      return i;
    }
  }
  return 0;
}

export function formatCoins(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
}

export const INITIAL_UPGRADES = [
  // PR & Team
  { id: 'u1', name: 'PR Campaign', pph: 100, cost: 500, category: 'PR & Team', level: 0 },
  { id: 'u2', name: 'Social Media', pph: 250, cost: 1200, category: 'PR & Team', level: 0 },
  { id: 'u3', name: 'Hire Influencer', pph: 500, cost: 3000, category: 'PR & Team', level: 0 },
  { id: 'u10', name: 'Support Team', pph: 750, cost: 4000, category: 'PR & Team', level: 0 },
  { id: 'u11', name: 'Security Team', pph: 1200, cost: 8000, category: 'PR & Team', level: 0 },
  { id: 'u12', name: 'Tokenomics Expert', pph: 2000, cost: 15000, category: 'PR & Team', level: 0 },
  { id: 'u29', name: 'Redis Caching', pph: 2500, cost: 18000, category: 'PR & Team', level: 0 },
  { id: 'u30', name: 'PostgreSQL DB', pph: 3500, cost: 26000, category: 'PR & Team', level: 0 },
  { id: 'u31', name: 'TON FunC Dev', pph: 5000, cost: 42000, category: 'PR & Team', level: 0 },
  // Markets
  { id: 'u4', name: 'BTC Pairs', pph: 300, cost: 1500, category: 'Markets', level: 0 },
  { id: 'u5', name: 'Margin Trading', pph: 800, cost: 4500, category: 'Markets', level: 0 },
  { id: 'u6', name: 'Web3 Integration', pph: 1500, cost: 10000, category: 'Markets', level: 0 },
  { id: 'u13', name: 'Ethereum Pairs', pph: 600, cost: 3500, category: 'Markets', level: 0 },
  { id: 'u14', name: 'Derivatives', pph: 2500, cost: 18000, category: 'Markets', level: 0 },
  { id: 'u15', name: 'NFT Marketplace', pph: 5000, cost: 40000, category: 'Markets', level: 0 },
  // Legal
  { id: 'u7', name: 'License Asia', pph: 400, cost: 2000, category: 'Legal', level: 0 },
  { id: 'u8', name: 'License Europe', pph: 1200, cost: 7000, category: 'Legal', level: 0 },
  { id: 'u9', name: 'SEC Compliance', pph: 2500, cost: 18000, category: 'Legal', level: 0 },
  { id: 'u16', name: 'License UAE', pph: 3000, cost: 22000, category: 'Legal', level: 0 },
  { id: 'u17', name: 'KYC Tier 2', pph: 1500, cost: 11000, category: 'Legal', level: 0 },
  { id: 'u18', name: 'AML System', pph: 4000, cost: 35000, category: 'Legal', level: 0 },
  { id: 'u32', name: 'Vesting Lockup', pph: 8000, cost: 75000, category: 'Legal', level: 0 },
  { id: 'u35', name: 'Settle Tyumen Lawsuit', pph: 15000, cost: 130000, category: 'Legal', level: 0 },
  // Web3
  { id: 'u24', name: 'Oracle Nodes', pph: 3500, cost: 28000, category: 'Web3', level: 0 },
  { id: 'u25', name: 'Smart Contracts', pph: 6000, cost: 50000, category: 'Web3', level: 0 },
  { id: 'u26', name: 'DEX Integration', pph: 8500, cost: 80000, category: 'Web3', level: 0 },
  { id: 'u33', name: 'Jetton Contract', pph: 12000, cost: 120000, category: 'Web3', level: 0 },
  { id: 'u34', name: 'HamsterVerse NFT', pph: 20000, cost: 250000, category: 'Web3', level: 0 },
  // Specials
  { id: 'u19', name: 'Joe Rogan Podcast', pph: 10000, cost: 100000, category: 'Specials', level: 0 },
  { id: 'u20', name: 'Dubai Office', pph: 15000, cost: 150000, category: 'Specials', level: 0 },
  { id: 'u21', name: 'HamsterTube', pph: 5000, cost: 45000, category: 'Specials', level: 0 },
  { id: 'u22', name: 'Utkarsh Token Launch', pph: 25000, cost: 300000, category: 'Specials', level: 0 },
  { id: 'u23', name: 'X Integration', pph: 8000, cost: 75000, category: 'Specials', level: 0 },
  { id: 'u27', name: 'Cheater Banwave', pph: 12000, cost: 110000, category: 'Specials', level: 0 },
  { id: 'u28', name: 'The Dust Drop', pph: 18000, cost: 200000, category: 'Specials', level: 0 },
  { id: 'u36', name: 'Hold $HMSTR Boost', pph: 35000, cost: 400000, category: 'Specials', level: 0 },
  { id: 'u37', name: 'Hamster Fight Club', pph: 45000, cost: 500000, category: 'Specials', level: 0 },
  { id: 'u38', name: 'GameDev Heroes', pph: 55000, cost: 650000, category: 'Specials', level: 0 },
];

export function calculateUpgradeCost(baseCost, currentLevel) {
  return Math.floor(baseCost * Math.pow(1.5, currentLevel));
}

export function calculateUpgradePph(basePph, currentLevel) {
  return Math.floor(basePph * Math.pow(1.2, currentLevel + 1));
}

export const DAILY_REWARDS = [
  500, 1000, 2500, 5000, 15000, 25000, 100000, 500000, 1000000, 5000000
];

export const MORSE_CODE_DICT = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..'
};

// Daily logic based on Date
export function getDailyCipherWord() {
  const words = ['WEB3', 'TOKEN', 'WALLET', 'BLOCK', 'CHAIN', 'CRYPTO', 'BITCOIN', 'UTKARSH'];
  const todayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % words.length;
  return words[todayIndex];
}

export function getDailyComboCards() {
  const comboSets = [
    ['u1', 'u4', 'u7'],
    ['u2', 'u5', 'u8'],
    ['u3', 'u6', 'u9'],
    ['u1', 'u5', 'u9'],
    ['u3', 'u4', 'u8'],
  ];
  const todayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % comboSets.length;
  return comboSets[todayIndex];
}

export const INITIAL_SKILLS = [
  { id: 's1', name: 'Auto-Tap Bot', desc: 'Automatically taps coins for you continuously.', level: 0, maxLevel: 5, baseCost: 10000, costMultiplier: 2.5, icon: 'Bot' },
  { id: 's2', name: 'Energy Overcharge', desc: 'Boosts energy recharge speed by +1 coin/sec per lvl.', level: 0, maxLevel: 5, baseCost: 15000, costMultiplier: 2.2, icon: 'Zap' },
  { id: 's3', name: 'Critical Taps', desc: 'Adds +5% chance per lvl for 5x coins per tap.', level: 0, maxLevel: 5, baseCost: 25000, costMultiplier: 3.0, icon: 'Flame' },
  { id: 's4', name: 'Market Intel', desc: 'Increases all Profit-Per-Hour by +5% per lvl.', level: 0, maxLevel: 5, baseCost: 50000, costMultiplier: 2.8, icon: 'Brain' },
];

export function calculateSkillCost(baseCost, costMultiplier, currentLevel) {
  return Math.floor(baseCost * Math.pow(costMultiplier, currentLevel));
}

export const MARKET_EVENTS = [
  { id: 'bull_run', name: '🚀 BULL RUN!', type: 'POSITIVE', desc: 'Crypto markets are booming! PPH earnings are doubled (2x) for 60 seconds.', durationSec: 60 },
  { id: 'energy_surge', name: '⚡ ENERGY SURGE!', type: 'POSITIVE', desc: 'Lightning strikes! Instant 100% energy refill!', durationSec: 0 },
  { id: 'bear_market', name: '🐻 BEAR CRISIS!', type: 'NEGATIVE', desc: 'Panic selling! PPH reduced by 50% until resolved!', durationSec: 45 },
  { id: 'hmstr_collapse', name: '📉 HMSTR COLLAPSE!', type: 'NEGATIVE', desc: '$HMSTR crashes to $0.00018! All profits are heavily reduced (0.1x) for 30 seconds.', durationSec: 30 },
  { id: 'token_burn', name: '🔥 TOKEN BURN!', type: 'POSITIVE', desc: 'Devs bought back and burned tokens! PPH is tripled (3x) for 45 seconds.', durationSec: 45 }
];

export const CEO_SKINS = [
  { id: 'skin_default', name: 'Default Dev', emoji: '🧑🏻‍💻', image: '/images/default_ceo_hamster.png', requiredLevel: 0, cost: 0, desc: 'The starting Utkarsh developer avatar.', multiplier: 1.0 },
  { id: 'skin_hacker', name: 'Cyber Hacker (NFT)', emoji: '🥷', requiredLevel: 2, cost: 50000, desc: 'Master of crypto ciphers. Grants +5% PPH.', multiplier: 1.05 },
  { id: 'skin_trader', name: 'Wall St Bull (NFT)', emoji: '👔', requiredLevel: 4, cost: 250000, desc: 'High-stakes trader. Grants +10% PPH.', multiplier: 1.10 },
  { id: 'skin_king', name: 'Crypto King (NFT)', emoji: '👑', image: '/images/king_nft_hamster.png', requiredLevel: 6, cost: 1000000, desc: 'Ruler of the blockchain realm. Grants +20% PPH.', multiplier: 1.20 },
  { id: 'skin_astronaut', name: 'To The Moon (NFT)', emoji: '👩‍🚀', image: '/images/astronaut_nft_hamster.png', requiredLevel: 8, cost: 5000000, desc: 'Ready to launch. Grants +50% PPH.', multiplier: 1.50 },
];

export function calculateBoosterCost(baseCost, currentLevel) {
  return Math.floor(baseCost * Math.pow(2, currentLevel));
}


