import React, { useState, useRef, useEffect } from 'react';
import { formatCoins, LEVELS, getDailyCipherWord, MORSE_CODE_DICT } from '../utils/gameLogic';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ScanText } from 'lucide-react';

export default function Exchange({ coins, energy, maxEnergy, onTap, levelIndex, onCipherSolved, cipherSolved }) {
  const [clicks, setClicks] = useState([]);
  const [cipherMode, setCipherMode] = useState(false);
  const [morseInput, setMorseInput] = useState('');
  const [decodedWord, setDecodedWord] = useState('');
  const coinRef = useRef(null);
  
  const targetWord = getDailyCipherWord();
  const tapStartTime = useRef(0);
  const cipherTimeout = useRef(null);

  const handlePointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (energy <= 0 && !cipherMode) return;

    tapStartTime.current = Date.now();
    clearTimeout(cipherTimeout.current);

    const rect = coinRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;

    coinRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(0.95)`;

    if (!cipherMode) {
      onTap(1);
      const newClick = { id: Date.now() + Math.random(), x: e.clientX, y: e.clientY };
      setClicks((prev) => [...prev, newClick]);
      setTimeout(() => {
        setClicks((prev) => prev.filter((c) => c.id !== newClick.id));
      }, 1000);
    }
  };

  const handlePointerUp = () => {
    if (coinRef.current) {
      coinRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    }

    if (cipherMode && !cipherSolved) {
      const duration = Date.now() - tapStartTime.current;
      const symbol = duration > 250 ? '-' : '.';
      
      setMorseInput(prev => prev + symbol);

      // Reset morse input if they wait too long before next tap (end of letter)
      cipherTimeout.current = setTimeout(() => {
        setMorseInput(currentMorse => {
          if (!currentMorse) return '';
          
          // Try to decode the current morse
          const letter = Object.keys(MORSE_CODE_DICT).find(key => MORSE_CODE_DICT[key] === currentMorse);
          
          if (letter) {
            setDecodedWord(prev => {
              const newWord = prev + letter;
              // Check if it matches target word so far
              if (targetWord.startsWith(newWord)) {
                if (newWord === targetWord) {
                  onCipherSolved();
                  setCipherMode(false);
                }
                return newWord;
              }
              // Failed match, reset word
              return '';
            });
          } else {
            // Invalid letter, reset word
            setDecodedWord('');
          }
          return ''; // clear input for next letter
        });
      }, 800);
    }
  };

  const progressPct = LEVELS[levelIndex + 1] 
    ? (coins / LEVELS[levelIndex + 1].minCoins) * 100
    : 100;

  return (
    <div className="flex flex-col items-center pt-4 pb-32 px-4 select-none touch-none h-full relative">
      
      <div className="w-full flex justify-end mb-4">
        <button 
          onClick={() => setCipherMode(!cipherMode)}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border transition-all ${
            cipherMode 
              ? 'bg-[var(--color-cyber-pink)] border-[var(--color-cyber-pink)] text-white shadow-[0_0_15px_rgba(255,0,127,0.6)]' 
              : 'glass-panel text-[var(--color-cyber-blue)]'
          }`}
        >
          <ScanText className="w-4 h-4" />
          {cipherSolved ? 'Cipher Solved!' : 'Daily Cipher'}
        </button>
      </div>

      {cipherMode && (
        <div className="mb-4 h-12 flex items-center justify-center text-3xl font-mono tracking-[0.5em] text-[var(--color-cyber-pink)] font-bold drop-shadow-[0_0_10px_rgba(255,0,127,0.8)]">
          {decodedWord.padEnd(targetWord.length, '_')}
        </div>
      )}

      {/* Coin Balance */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-transparent border-2 border-[var(--color-cyber-blue)] flex items-center justify-center text-[var(--color-cyber-blue)] font-bold text-xl shadow-[0_0_15px_rgba(0,240,255,0.5),inset_0_0_10px_rgba(0,240,255,0.3)]">
          ₹
        </div>
        <span className="text-5xl font-black tracking-tight neon-text-blue">
          {coins.toLocaleString()}
        </span>
      </div>

      {/* Level Progress */}
      <div className="w-full flex items-center justify-between px-4 mb-2">
        <span className="text-sm font-semibold neon-text-gold">{LEVELS[levelIndex].name}</span>
        <span className="text-sm font-semibold text-[var(--color-cyber-blue)]">
          Level {levelIndex + 1}/{LEVELS.length}
        </span>
      </div>
      <div className="w-full h-3 bg-gray-900 rounded-full mb-10 border border-gray-800 overflow-hidden shadow-[inset_0_0_5px_rgba(0,0,0,1)]">
        <div 
          className="h-full bg-[var(--color-cyber-blue)] rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(0,240,255,0.8)]"
          style={{ width: `${Math.min(progressPct, 100)}%` }}
        />
      </div>

      {/* Tapping Coin */}
      <div 
        ref={coinRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`w-[280px] h-[280px] rounded-full flex items-center justify-center cursor-pointer transition-transform duration-75 relative z-10 ${
          cipherMode 
            ? 'bg-[var(--color-cyber-dark)] border-4 border-[var(--color-cyber-pink)] shadow-[0_0_50px_rgba(255,0,127,0.5),inset_0_0_30px_rgba(255,0,127,0.3)]' 
            : 'bg-[var(--color-cyber-dark)] border-4 border-[var(--color-cyber-blue)] shadow-[0_0_50px_rgba(0,240,255,0.5),inset_0_0_30px_rgba(0,240,255,0.3)]'
        }`}
      >
        <div className={`absolute inset-3 rounded-full overflow-hidden flex flex-col items-center justify-center ${cipherMode ? 'bg-pink-950/50' : 'bg-cyan-950/50'}`}>
          <div className="w-40 h-40 bg-transparent rounded-full flex items-center justify-center mb-2">
            <span className="text-7xl drop-shadow-[0_0_20px_rgba(0,240,255,0.8)]">🧑🏻‍💻</span>
          </div>
          <span className={`text-2xl font-black uppercase tracking-widest ${cipherMode ? 'text-[var(--color-cyber-pink)] drop-shadow-[0_0_10px_rgba(255,0,127,0.8)]' : 'neon-text-blue'}`}>
            Utkarsh
          </span>
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
            className="absolute text-4xl font-black neon-text-gold pointer-events-none z-50"
            style={{ left: click.x - 20, top: click.y - 20 }}
          >
            +1
          </motion.div>
        ))}
      </AnimatePresence>

      {cipherMode && morseInput && (
        <div className="absolute top-[60%] left-1/2 -translate-x-1/2 text-5xl font-black text-[var(--color-cyber-pink)] pointer-events-none drop-shadow-[0_0_15px_rgba(255,0,127,0.8)] z-50 tracking-[0.2em]">
          {morseInput}
        </div>
      )}

      {/* Energy Bar */}
      <div className="absolute bottom-24 left-0 w-full px-6">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[var(--color-cyber-gold)] drop-shadow-[0_0_5px_rgba(255,215,0,0.8)]" />
            <span className="text-lg font-bold neon-text-gold">{energy} <span className="text-gray-500 font-normal">/ {maxEnergy}</span></span>
          </div>
        </div>
        <div className="w-full h-3 bg-gray-900 rounded-full border border-[var(--color-cyber-border)] p-[1px] shadow-[inset_0_0_5px_rgba(0,0,0,1)]">
          <div 
            className="h-full bg-[var(--color-cyber-gold)] rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(255,215,0,0.8)]"
            style={{ width: `${(energy / maxEnergy) * 100}%` }}
          />
        </div>
      </div>

    </div>
  );
}
