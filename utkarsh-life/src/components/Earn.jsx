import React, { useState } from 'react';
import { formatCoins, DAILY_REWARDS } from '../utils/gameLogic';
import { Calendar, CheckCircle2, Tv, Send, Coins } from 'lucide-react';

export default function Earn({ coins, onClaimDailyReward, currentStreak, canClaimToday }) {
  const [activeTab, setActiveTab] = useState('daily'); // daily or tasks

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-24 overflow-y-auto">
      <div className="flex items-center justify-center mb-6">
        <Coins className="w-16 h-16 text-accent-gold drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
      </div>
      <h2 className="text-2xl font-bold text-center mb-6">Earn more coins</h2>
      
      <div className="flex gap-2 mb-6 bg-card-bg p-1 rounded-xl border border-gray-800">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
            activeTab === 'daily' ? 'bg-gray-700 text-white' : 'text-gray-400'
          }`}
        >
          Daily rewards
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
            activeTab === 'tasks' ? 'bg-gray-700 text-white' : 'text-gray-400'
          }`}
        >
          Tasks list
        </button>
      </div>

      {activeTab === 'daily' ? (
        <div className="bg-card-bg rounded-2xl p-4 border border-gray-800 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-8 h-8 text-accent-gold" />
            <div>
              <h3 className="font-bold text-lg">Daily reward</h3>
              <p className="text-xs text-gray-400">Log in every day without skipping to keep your streak.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-6">
            {DAILY_REWARDS.map((reward, index) => {
              const isClaimed = index < currentStreak;
              const isNext = index === currentStreak && canClaimToday;
              
              return (
                <div 
                  key={index}
                  className={`flex flex-col items-center p-2 rounded-xl border ${
                    isClaimed ? 'bg-green-900/20 border-green-500/50' : 
                    isNext ? 'bg-gray-700 border-accent-gold shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 
                    'bg-gray-800 border-gray-700 opacity-60'
                  }`}
                >
                  <span className="text-[10px] text-gray-400 mb-1">Day {index + 1}</span>
                  {isClaimed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 mb-1" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-accent-gold flex items-center justify-center text-black text-[10px] font-bold mb-1">₹</div>
                  )}
                  <span className="text-[10px] font-bold">{formatCoins(reward)}</span>
                </div>
              );
            })}
          </div>
          
          <button 
            disabled={!canClaimToday}
            onClick={() => onClaimDailyReward(DAILY_REWARDS[currentStreak])}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
              canClaimToday 
                ? 'bg-accent-gold text-black hover:bg-yellow-400' 
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {canClaimToday ? 'Claim Reward' : 'Come back tomorrow'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-card-bg rounded-2xl p-4 border border-gray-800 flex items-center justify-between cursor-pointer hover:border-gray-600 transition-colors">
            <div className="flex items-center gap-3">
              <Tv className="w-10 h-10 text-red-500" />
              <div>
                <h3 className="font-bold text-sm">Subscribe to Utkarsh Channel</h3>
                <div className="flex items-center gap-1 font-bold text-accent-gold">
                  <span className="text-[10px]">₹</span>
                  <span className="text-xs">+100,000</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-card-bg rounded-2xl p-4 border border-gray-800 flex items-center justify-between cursor-pointer hover:border-gray-600 transition-colors">
            <div className="flex items-center gap-3">
              <Send className="w-10 h-10 text-blue-400" />
              <div>
                <h3 className="font-bold text-sm">Join Telegram Channel</h3>
                <div className="flex items-center gap-1 font-bold text-accent-gold">
                  <span className="text-[10px]">₹</span>
                  <span className="text-xs">+50,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
