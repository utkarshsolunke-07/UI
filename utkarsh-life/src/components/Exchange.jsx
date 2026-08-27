import React, { useState, useRef } from 'react';
import { formatCoins, LEVELS } from '../utils/gameLogic';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function Exchange({ coins, energy, maxEnergy, onTap, levelIndex }) {
  const [clicks, setClicks] = useState([]);
  const coinRef = useRef(null);

  const handlePointerDown = (e) => {
    // Only allow left clicks or touch
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    
    if (energy <= 0) return;

    const rect = coinRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 3D tilt calculation
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;

    coinRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(0.95)`;

    // Register tap
    onTap(1);
    
    // Add floating text
    const newClick = { id: Date.now() + Math.random(), x: e.clientX, y: e.clientY };
    setClicks((prev) => [...prev, newClick]);

    // Remove floating text after animation
    setTimeout(() => {
      setClicks((prev) => prev.filter((c) => c.id !== newClick.id));
    }, 1000);
  };

  const handlePointerUp = () => {
    if (coinRef.current) {
      coinRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    }
  };

  const progressPct = LEVELS[levelIndex + 1] 
    ? (coins / LEVELS[levelIndex + 1].minCoins) * 100
    : 100;

  return (
    <div className="flex flex-col items-center pt-8 pb-32 px-4 select-none touch-none h-full relative">
      
      {/* Coin Balance */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-accent-gold flex items-center justify-center text-black font-bold text-xl shadow-[0_0_15px_rgba(251,191,36,0.5)]">
          ₹
        </div>
        <span className="text-5xl font-black tracking-tight drop-shadow-md">
          {coins.toLocaleString()}
        </span>
      </div>

      {/* Level Progress */}
      <div className="w-full flex items-center justify-between px-4 mb-2">
        <span className="text-sm font-semibold text-gray-300">{LEVELS[levelIndex].name}</span>
        <span className="text-sm font-semibold text-gray-400">
          Level {levelIndex + 1}/{LEVELS.length}
        </span>
      </div>
      <div className="w-full h-3 bg-gray-800 rounded-full mb-12 border border-gray-700 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-yellow-600 to-accent-gold rounded-full transition-all duration-300"
          style={{ width: `${Math.min(progressPct, 100)}%` }}
        />
      </div>

      {/* Tapping Coin */}
      <div 
        ref={coinRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-[280px] h-[280px] rounded-full bg-gradient-to-br from-gray-700 to-black border-4 border-gray-600 shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center cursor-pointer transition-transform duration-75 relative z-10"
      >
        <div className="absolute inset-2 rounded-full border border-gray-500/30 overflow-hidden bg-gray-800 flex flex-col items-center justify-center">
          {/* Avatar Placeholder */}
          <div className="w-40 h-40 bg-gradient-to-br from-accent-gold to-orange-500 rounded-full flex items-center justify-center shadow-inner mb-2">
            <span className="text-6xl">🧑🏻‍💻</span>
          </div>
          <span className="text-xl font-black text-white uppercase tracking-widest drop-shadow-md">Utkarsh</span>
        </div>
      </div>

      {/* Floating texts */}
      <AnimatePresence>
        {clicks.map((click) => (
          <motion.div
            key={click.id}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -100, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute text-3xl font-black text-white pointer-events-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] z-50"
            style={{ left: click.x - 20, top: click.y - 20 }}
          >
            +1
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Energy Bar */}
      <div className="absolute bottom-24 left-0 w-full px-6">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1">
            <Zap className="w-5 h-5 text-accent-gold fill-accent-gold" />
            <span className="text-lg font-bold">{energy} <span className="text-gray-500">/ {maxEnergy}</span></span>
          </div>
        </div>
        <div className="w-full h-4 bg-gray-800 rounded-full border border-gray-700 p-[2px]">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-accent-gold rounded-full transition-all duration-300"
            style={{ width: `${(energy / maxEnergy) * 100}%` }}
          />
        </div>
      </div>

    </div>
  );
}
