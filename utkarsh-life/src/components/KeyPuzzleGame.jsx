import React, { useState, useEffect } from 'react';
import { Key, Clock, Trophy, RefreshCw } from 'lucide-react';

export default function KeyPuzzleGame({ onWinKey }) {
  const [board, setBoard] = useState([1, 2, 3, 4, 5, 6, 7, 8, 0]); // 0 is blank
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [won, setWon] = useState(false);

  const shuffleBoard = () => {
    let arr = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    for (let i = 0; i < 20; i++) {
      const zeroIdx = arr.indexOf(0);
      const neighbors = getValidMoves(zeroIdx);
      const randMove = neighbors[Math.floor(Math.random() * neighbors.length)];
      arr[zeroIdx] = arr[randMove];
      arr[randMove] = 0;
    }
    setBoard(arr);
    setTimeLeft(60);
    setWon(false);
    setIsPlaying(true);
  };

  const getValidMoves = (zeroIdx) => {
    const moves = [];
    const row = Math.floor(zeroIdx / 3);
    const col = zeroIdx % 3;

    if (row > 0) moves.push(zeroIdx - 3); // Up
    if (row < 2) moves.push(zeroIdx + 3); // Down
    if (col > 0) moves.push(zeroIdx - 1); // Left
    if (col < 2) moves.push(zeroIdx + 1); // Right
    return moves;
  };

  const handleTileClick = (index) => {
    if (!isPlaying || won) return;

    const zeroIdx = board.indexOf(0);
    const validMoves = getValidMoves(zeroIdx);

    if (validMoves.includes(index)) {
      const newBoard = [...board];
      newBoard[zeroIdx] = board[index];
      newBoard[index] = 0;
      setBoard(newBoard);

      // Check win condition [1, 2, 3, 4, 5, 6, 7, 8, 0]
      const solved = newBoard.every((val, idx) => val === (idx === 8 ? 0 : idx + 1));
      if (solved) {
        setWon(true);
        setIsPlaying(false);
        onWinKey(1);
      }
    }
  };

  useEffect(() => {
    let timer;
    if (isPlaying && !won && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && isPlaying && !won) {
      setIsPlaying(false);
      alert('Time expired! Try again.');
    }
    return () => clearInterval(timer);
  }, [isPlaying, won, timeLeft]);

  return (
    <div className="glass-panel p-4 flex flex-col items-center shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <Key className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" />
        <h3 className="font-black text-lg text-white uppercase tracking-wider">Sliding Key Puzzle</h3>
      </div>

      <p className="text-xs text-[var(--color-cyber-blue)] text-center mb-4">
        Arrange numbers 1-8 in order within 60 seconds to earn <span className="font-bold text-yellow-400">1 🔑 Key</span>!
      </p>

      {!isPlaying && !won && (
        <button
          onClick={shuffleBoard}
          className="neon-btn w-full max-w-xs flex items-center justify-center gap-2 mb-4"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Start Key Puzzle</span>
        </button>
      )}

      {won && (
        <div className="text-center p-4 bg-yellow-950/40 border border-yellow-500 rounded-2xl mb-4 w-full">
          <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-2 animate-bounce" />
          <h4 className="font-black text-lg text-yellow-400">KEY UNLOCKED!</h4>
          <p className="text-xs text-gray-300 mb-3">You claimed +1 🔑 Key!</p>
          <button
            onClick={shuffleBoard}
            className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-xl text-xs"
          >
            Play Again
          </button>
        </div>
      )}

      {isPlaying && (
        <>
          <div className="flex justify-between items-center w-full px-2 mb-4">
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-[var(--color-cyber-gold)]">
              <Clock className="w-4 h-4" />
              <span>{timeLeft}s remaining</span>
            </div>
            <span className="text-xs font-bold text-[var(--color-cyber-blue)]">Goal: 1 2 3 / 4 5 6 / 7 8 _</span>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full max-w-[240px] aspect-square p-2 glass-panel border-[var(--color-cyber-blue)]">
            {board.map((num, idx) => (
              <button
                key={idx}
                onClick={() => handleTileClick(idx)}
                className={`aspect-square rounded-xl border text-xl font-black flex items-center justify-center transition-all ${
                  num === 0
                    ? 'bg-transparent border-dashed border-gray-700'
                    : 'bg-[var(--color-cyber-dark)] border-[var(--color-cyber-blue)] text-[var(--color-cyber-blue)] shadow-[0_0_10px_rgba(0,240,255,0.3)] hover:scale-105'
                }`}
              >
                {num !== 0 ? num : ''}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
