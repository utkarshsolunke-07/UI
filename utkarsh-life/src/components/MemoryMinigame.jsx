import React, { useState, useEffect } from 'react';
import { Gamepad2, RefreshCw, Trophy, Clock } from 'lucide-react';
import { formatCoins } from '../utils/gameLogic';

const CARD_SYMBOLS = ['🚀', '⚡', '💎', '🔥', '🤖', '👑', '🎯', '💰'];

export default function MemoryMinigame({ onWinReward }) {
  const [cards, setCards] = useState([]);
  const [flippedIndex, setFlippedIndex] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [won, setWon] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const initGame = () => {
    const deck = [...CARD_SYMBOLS, ...CARD_SYMBOLS]
      .sort(() => Math.random() - 0.5)
      .map((symbol, idx) => ({ id: idx, symbol }));

    setCards(deck);
    setFlippedIndex([]);
    setMatchedPairs([]);
    setTimeLeft(30);
    setWon(false);
    setGameStarted(true);
  };

  useEffect(() => {
    let timer;
    if (gameStarted && !won && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && gameStarted && !won) {
      setGameStarted(false);
      alert('Time expired! Try again.');
    }
    return () => clearInterval(timer);
  }, [gameStarted, won, timeLeft]);

  const handleCardClick = (index) => {
    if (!gameStarted || won || flippedIndex.includes(index) || matchedPairs.includes(cards[index].symbol)) {
      return;
    }

    if (flippedIndex.length === 0) {
      setFlippedIndex([index]);
    } else if (flippedIndex.length === 1) {
      const firstIndex = flippedIndex[0];
      setFlippedIndex([firstIndex, index]);

      if (cards[firstIndex].symbol === cards[index].symbol) {
        const newMatched = [...matchedPairs, cards[index].symbol];
        setMatchedPairs(newMatched);
        setFlippedIndex([]);

        if (newMatched.length === CARD_SYMBOLS.length) {
          setWon(true);
          setGameStarted(false);
          onWinReward(500000);
        }
      } else {
        setTimeout(() => {
          setFlippedIndex([]);
        }, 800);
      }
    }
  };

  return (
    <div className="glass-panel p-4 flex flex-col items-center shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <Gamepad2 className="w-6 h-6 text-[var(--color-cyber-gold)] drop-shadow-[0_0_5px_rgba(255,215,0,0.8)]" />
        <h3 className="font-black text-lg text-white uppercase tracking-wider">Crypto Memory Match</h3>
      </div>

      <p className="text-xs text-[var(--color-cyber-blue)] text-center mb-4">
        Match all 8 pairs in under 30 seconds to win <span className="font-bold text-[var(--color-cyber-gold)]">500,000 coins</span>!
      </p>

      {!gameStarted && !won && (
        <button
          onClick={initGame}
          className="neon-btn w-full max-w-xs flex items-center justify-center gap-2 mb-4"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Start Minigame</span>
        </button>
      )}

      {won && (
        <div className="text-center p-4 bg-green-950/40 border border-green-500 rounded-2xl mb-4 w-full">
          <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-2 animate-bounce" />
          <h4 className="font-black text-lg text-green-400">VICTORY!</h4>
          <p className="text-xs text-gray-300 mb-3">You won +500,000 coins!</p>
          <button
            onClick={initGame}
            className="px-4 py-2 bg-green-500 text-black font-bold rounded-xl text-xs"
          >
            Play Again
          </button>
        </div>
      )}

      {gameStarted && (
        <>
          <div className="flex justify-between items-center w-full px-2 mb-4">
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-[var(--color-cyber-gold)]">
              <Clock className="w-4 h-4" />
              <span>{timeLeft}s remaining</span>
            </div>
            <span className="text-xs font-bold text-[var(--color-cyber-blue)]">
              Matched: {matchedPairs.length}/{CARD_SYMBOLS.length}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 w-full max-w-xs aspect-square">
            {cards.map((card, index) => {
              const isFlipped = flippedIndex.includes(index);
              const isMatched = matchedPairs.includes(card.symbol);
              const isVisible = isFlipped || isMatched;

              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(index)}
                  className={`aspect-square rounded-xl border text-2xl flex items-center justify-center transition-all duration-300 ${
                    isMatched
                      ? 'bg-green-950/40 border-green-500 text-white opacity-40'
                      : isFlipped
                      ? 'bg-[var(--color-cyber-dark)] border-[var(--color-cyber-blue)] shadow-[0_0_15px_rgba(0,240,255,0.5)] scale-105'
                      : 'glass-panel hover:border-[var(--color-cyber-blue)]'
                  }`}
                >
                  {isVisible ? card.symbol : '❓'}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
