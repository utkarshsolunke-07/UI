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
  { id: 'u1', name: 'PR Campaign', pph: 100, cost: 500, category: 'PR & Team', level: 0 },
  { id: 'u2', name: 'Social Media', pph: 250, cost: 1200, category: 'PR & Team', level: 0 },
  { id: 'u3', name: 'Hire Influencer', pph: 500, cost: 3000, category: 'PR & Team', level: 0 },
  { id: 'u4', name: 'BTC Pairs', pph: 300, cost: 1500, category: 'Markets', level: 0 },
  { id: 'u5', name: 'Margin Trading', pph: 800, cost: 4500, category: 'Markets', level: 0 },
  { id: 'u6', name: 'Web3 Integration', pph: 1500, cost: 10000, category: 'Markets', level: 0 },
  { id: 'u7', name: 'License Asia', pph: 400, cost: 2000, category: 'Legal', level: 0 },
  { id: 'u8', name: 'License Europe', pph: 1200, cost: 7000, category: 'Legal', level: 0 },
  { id: 'u9', name: 'SEC Compliance', pph: 2500, cost: 18000, category: 'Legal', level: 0 },
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
