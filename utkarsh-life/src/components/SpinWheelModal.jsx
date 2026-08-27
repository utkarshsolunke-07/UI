import React, { useState } from 'react';
import { X, Sparkles, Trophy } from 'lucide-react';
import { soundManager } from '../utils/soundManager';

const WHEEL_PRIZES = [
  { id: 1, label: '100K Coins', type: 'coins', value: 100000, color: '#00f0ff' },
  { id: 2, label: '1 Key 🔑', type: 'keys', value: 1, color: '#ffd700' },
  { id: 3, label: '500K Coins', type: 'coins', value: 500000, color: '#ff007f' },
  { id: 4, label: '2 Keys 🔑', type: 'keys', value: 2, color: '#a855f7' },
  { id: 5, label: '1M Coins! 🚀', type: 'coins', value: 1000000, color: '#22c55e' },
  { id: 6, label: 'Energy Surge ⚡', type: 'energy', value: 1000, color: '#f59e0b' },
];

export default function SpinWheelModal({ isOpen, onClose, onRewardClaimed }) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState(null);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (spinning) return;
    soundManager.playTap();
    setSpinning(true);
    setWonPrize(null);

    const randomIndex = Math.floor(Math.random() * WHEEL_PRIZES.length);
    const extraRounds = 5 * 360;
    const segmentAngle = 360 / WHEEL_PRIZES.length;
    const targetAngle = extraRounds + (randomIndex * segmentAngle);

    setRotation(targetAngle);

    setTimeout(() => {
      const prize = WHEEL_PRIZES[randomIndex];
      setWonPrize(prize);
      setSpinning(false);
      soundManager.playWin();
      onRewardClaimed(prize);
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-6 relative flex flex-col items-center border-[var(--color-cyber-gold)] shadow-[0_0_40px_rgba(255,215,0,0.3)]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-xl glass-panel flex items-center justify-center text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
          <h2 className="text-2xl font-black text-yellow-400 uppercase tracking-widest">Daily Wheel</h2>
        </div>
        <p className="text-xs text-gray-400 mb-6">Spin to win instant coins, keys, & boosters!</p>

        {/* Wheel Container */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-6">
          {/* Pointer */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-yellow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]" />

          {/* Wheel Graphic */}
          <div 
            className="w-full h-full rounded-full border-4 border-yellow-400 shadow-[0_0_30px_rgba(255,215,0,0.4)] relative overflow-hidden transition-transform duration-[3500ms] cubic-bezier(0.15, 0.85, 0.35, 1)"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {WHEEL_PRIZES.map((prize, idx) => {
              const angle = idx * (360 / WHEEL_PRIZES.length);
              return (
                <div
                  key={prize.id}
                  className="absolute w-1/2 h-1/2 top-0 right-0 origin-bottom-left flex items-center justify-center"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    backgroundColor: idx % 2 === 0 ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 0, 127, 0.15)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <span 
                    className="text-[10px] font-black uppercase text-white tracking-wider transform rotate-45 translate-x-3 translate-y-3"
                    style={{ color: prize.color }}
                  >
                    {prize.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Center Hub */}
          <div className="absolute w-14 h-14 rounded-full bg-[var(--color-cyber-dark)] border-2 border-yellow-400 flex items-center justify-center shadow-[0_0_15px_rgba(255,215,0,0.8)] z-10">
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </div>
        </div>

        {/* Won Prize Notice */}
        {wonPrize && (
          <div className="text-center p-3 mb-4 bg-yellow-950/40 border border-yellow-500 rounded-xl w-full animate-bounce-short">
            <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
            <h4 className="font-bold text-sm text-yellow-400">YOU WON: {wonPrize.label}!</h4>
          </div>
        )}

        {/* Action Button */}
        <button
          disabled={spinning}
          onClick={handleSpin}
          className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${
            spinning 
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
              : 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(255,215,0,0.6)] hover:scale-105'
          }`}
        >
          {spinning ? 'Spinning...' : 'Spin the Wheel! 🎰'}
        </button>

      </div>
    </div>
  );
}
