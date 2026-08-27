import React, { useState } from 'react';
import { formatCoins, DAILY_REWARDS } from '../utils/gameLogic';
import { Calendar, CheckCircle2, Tv, Send, Coins, Gamepad2, Key, Lock } from 'lucide-react';
import MemoryMinigame from './MemoryMinigame';
import KeyPuzzleGame from './KeyPuzzleGame';

export default function Earn({ coins, onClaimDailyReward, currentStreak, canClaimToday, onMinigameReward, onWinKey }) {
  const [activeTab, setActiveTab] = useState('daily'); // daily, tasks, minigame, keypuzzle

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-24 overflow-y-auto">
      <div className="flex items-center justify-center mb-6">
        <Coins className="w-16 h-16 text-[var(--color-cyber-gold)] drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]" />
      </div>
      <h2 className="text-2xl font-black text-center mb-6 neon-text-blue uppercase tracking-widest">Earn more</h2>
      
      <div className="flex gap-1 mb-6 glass-panel p-1">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-colors ${
            activeTab === 'daily' ? 'bg-[var(--color-cyber-blue)] text-black shadow-[0_0_10px_rgba(0,240,255,0.5)]' : 'text-gray-400 hover:text-[var(--color-cyber-blue)]'
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-colors ${
            activeTab === 'tasks' ? 'bg-[var(--color-cyber-blue)] text-black shadow-[0_0_10px_rgba(0,240,255,0.5)]' : 'text-gray-400 hover:text-[var(--color-cyber-blue)]'
          }`}
        >
          Tasks
        </button>
        <button
          onClick={() => setActiveTab('minigame')}
          className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'minigame' ? 'bg-[var(--color-cyber-gold)] text-black shadow-[0_0_10px_rgba(255,215,0,0.5)]' : 'text-gray-400 hover:text-[var(--color-cyber-gold)]'
          }`}
        >
          <Gamepad2 className="w-3 h-3" />
          <span>Match</span>
        </button>
        <button
          onClick={() => setActiveTab('keypuzzle')}
          className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'keypuzzle' ? 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'text-gray-400 hover:text-yellow-400'
          }`}
        >
          <Key className="w-3 h-3" />
          <span>Key Game</span>
        </button>
      </div>

      {activeTab === 'daily' && (
        <div className="glass-panel p-4 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-8 h-8 text-[var(--color-cyber-gold)] drop-shadow-[0_0_5px_rgba(255,215,0,0.8)]" />
            <div>
              <h3 className="font-bold text-lg text-white">Daily reward</h3>
              <p className="text-xs text-[var(--color-cyber-blue)]">Log in every day to keep your streak.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-6">
            {DAILY_REWARDS.map((reward, index) => {
              const isClaimed = index < currentStreak;
              const isNext = index === currentStreak && canClaimToday;
              
              return (
                <div 
                  key={index}
                  className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                    isClaimed ? 'bg-[var(--color-cyber-dark)] border-[var(--color-cyber-blue)] opacity-50' : 
                    isNext ? 'bg-[var(--color-cyber-dark)] border-[var(--color-cyber-gold)] shadow-[0_0_15px_rgba(255,215,0,0.4)]' : 
                    'bg-[var(--color-cyber-dark)] border-[var(--color-cyber-border)] opacity-60'
                  }`}
                >
                  <span className={`text-[10px] mb-1 ${isNext ? 'neon-text-gold' : 'text-gray-400'}`}>Day {index + 1}</span>
                  {isClaimed ? (
                    <CheckCircle2 className="w-5 h-5 text-[var(--color-cyber-blue)] mb-1" />
                  ) : (
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-black text-[10px] font-bold mb-1 ${isNext ? 'bg-[var(--color-cyber-gold)] shadow-[0_0_5px_rgba(255,215,0,0.5)]' : 'bg-gray-600'}`}>₹</div>
                  )}
                  <span className={`text-[10px] font-bold ${isNext ? 'text-white' : 'text-gray-500'}`}>{formatCoins(reward)}</span>
                </div>
              );
            })}
          </div>
          
          <button 
            disabled={!canClaimToday}
            onClick={() => onClaimDailyReward(DAILY_REWARDS[currentStreak])}
            className={`w-full py-4 rounded-xl font-black text-lg uppercase tracking-wider transition-all ${
              canClaimToday 
                ? 'bg-[var(--color-cyber-gold)] text-black shadow-[0_0_20px_rgba(255,215,0,0.6)] hover:bg-white hover:shadow-[0_0_30px_rgba(255,215,0,0.9)]' 
                : 'bg-[var(--color-cyber-dark)] text-gray-500 cursor-not-allowed border border-[var(--color-cyber-border)]'
            }`}
          >
            {canClaimToday ? 'Claim Reward' : 'Come back tomorrow'}
          </button>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-3">
          <div className="glass-panel p-4 flex items-center justify-between cursor-pointer hover:border-[var(--color-cyber-blue)] transition-colors hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <div className="flex items-center gap-3">
              <Tv className="w-10 h-10 text-[var(--color-cyber-pink)] drop-shadow-[0_0_5px_rgba(255,0,127,0.8)]" />
              <div>
                <h3 className="font-bold text-sm text-white">Subscribe to Utkarsh Channel</h3>
                <div className="flex items-center gap-1 font-bold text-[var(--color-cyber-gold)]">
                  <span className="text-[10px]">₹</span>
                  <span className="text-xs">+100,000</span>
                </div>
              </div>
            </div>
          </div>
          <div className="glass-panel p-4 flex items-center justify-between cursor-pointer hover:border-[var(--color-cyber-blue)] transition-colors hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <div className="flex items-center gap-3">
              <Send className="w-10 h-10 text-[var(--color-cyber-blue)] drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" />
              <div>
                <h3 className="font-bold text-sm text-white">Join Telegram Channel</h3>
                <div className="flex items-center gap-1 font-bold text-[var(--color-cyber-gold)]">
                  <span className="text-[10px]">₹</span>
                  <span className="text-xs">+50,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'minigame' && (
        <MemoryMinigame onWinReward={onMinigameReward} />
      )}

      {activeTab === 'keypuzzle' && (
        <KeyPuzzleGame onWinKey={onWinKey} />
      )}

      {/* 2026 Staking & Retention mechanic */}
      <div className="mt-8 glass-panel p-4 mb-4 border-yellow-500/50 shadow-[0_0_15px_rgba(251,191,36,0.2)]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-900/40 flex items-center justify-center border border-yellow-500/30">
            <Lock className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-yellow-400">Vault Staking</h3>
            <p className="text-xs text-gray-400">Hold $HMSTR to boost PPH</p>
          </div>
        </div>
        <p className="text-[10px] text-gray-300 mb-3 leading-relaxed">
          The HamsterVerse rewards loyalty. Lock your tokens in the game instead of withdrawing to a TON wallet to gain a permanent <span className="font-bold text-yellow-400">+10% PPH</span> bonus.
        </p>
        <button className="w-full py-2 bg-yellow-500 text-black font-black text-xs rounded-xl shadow-[0_0_10px_rgba(251,191,36,0.6)]">
          Lock Tokens (Coming Soon)
        </button>
      </div>
    </div>
  );
}
