import React, { useState } from 'react';
import { Smartphone, CheckCircle2, ChevronRight, X } from 'lucide-react';

export default function Airdrop({ upiId, setUpiId }) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(upiId);

  const handleSave = () => {
    setUpiId(inputValue);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-24 overflow-y-auto">
      <div className="flex flex-col items-center mb-8 mt-4">
        <div className="w-24 h-24 bg-[var(--color-cyber-blue)] rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,240,255,0.8)] transform rotate-12 border-2 border-white">
          <span className="text-5xl font-black text-black drop-shadow-md">UPI</span>
        </div>
        <h2 className="text-3xl font-black text-center mb-2 neon-text-blue uppercase tracking-widest">Airdrop</h2>
        <p className="text-[var(--color-cyber-blue)] text-center text-sm px-4">
          Complete tasks to participate in the upcoming token Airdrop.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-sm text-[var(--color-cyber-blue)] mb-2 uppercase tracking-wider">Tasks List</h3>
        
        {!isEditing ? (
          <div 
            className="glass-panel p-4 flex items-center justify-between cursor-pointer hover:border-[var(--color-cyber-blue)] transition-colors hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] group"
            onClick={() => setIsEditing(true)}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors shadow-[0_0_10px_rgba(0,240,255,0.2)] ${upiId ? 'bg-[var(--color-cyber-blue)] text-black border-[var(--color-cyber-blue)]' : 'bg-[var(--color-cyber-dark)] border-[var(--color-cyber-blue)] group-hover:bg-[var(--color-cyber-blue)] group-hover:text-black'}`}>
                {upiId ? <CheckCircle2 className="w-6 h-6" /> : <Smartphone className="w-6 h-6 text-[var(--color-cyber-blue)] group-hover:text-black" />}
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Connect your UPI ID</h3>
                {upiId && <p className="text-xs text-[var(--color-cyber-pink)] neon-text-pink mt-1">{upiId}</p>}
              </div>
            </div>
            {upiId ? (
               <CheckCircle2 className="w-5 h-5 text-[var(--color-cyber-blue)]" />
            ) : (
               <ChevronRight className="w-5 h-5 text-[var(--color-cyber-blue)]" />
            )}
          </div>
        ) : (
          <div className="glass-panel p-4 flex flex-col gap-3 border-[var(--color-cyber-blue)] shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-sm text-white">Enter UPI ID</h3>
              <button onClick={() => { setIsEditing(false); setInputValue(upiId); }} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. yourname@bank"
              className="w-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-border)] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[var(--color-cyber-blue)]"
            />
            <button 
              onClick={handleSave}
              className="w-full neon-btn py-2 text-sm"
            >
              Save & Connect
            </button>
          </div>
        )}

        <div className="glass-panel p-4 flex items-center justify-between opacity-50 cursor-not-allowed">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--color-cyber-dark)] rounded-xl flex items-center justify-center border border-[var(--color-cyber-border)]">
              <CheckCircle2 className="w-6 h-6 text-[var(--color-cyber-blue)]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--color-cyber-blue)]">Join UTKARSH LIFE channel</h3>
            </div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-[var(--color-cyber-pink)] drop-shadow-[0_0_5px_rgba(255,0,127,0.8)]" />
        </div>
      </div>

      {/* Season 2 Roadmap Banner */}
      <div className="mt-8 space-y-4">
        <h3 className="font-bold text-sm text-yellow-400 mb-2 uppercase tracking-wider">Season 2 Roadmap</h3>
        <div className="glass-panel p-5 bg-gradient-to-br from-yellow-900/30 to-black border-yellow-500/50 shadow-[0_0_20px_rgba(251,191,36,0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full translate-x-10 -translate-y-10" />
          
          <h4 className="text-lg font-black text-white mb-2">The HamsterVerse is coming!</h4>
          <p className="text-xs text-gray-300 mb-4 leading-relaxed">
            Season 1 is complete! 15% of the total token supply is officially reserved to fund the Season 2 economy. Prepare for the integration of NFTs, external minigames, and our standalone Progressive Web App (PWA).
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_5px_rgba(251,191,36,0.8)]" />
              <span className="text-xs text-gray-200">10-Month Vesting Lockup Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--color-cyber-blue)] shadow-[0_0_5px_rgba(0,240,255,0.8)]" />
              <span className="text-xs text-gray-200">Anti-Cheat Sybil Filters Deployed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--color-cyber-pink)] shadow-[0_0_5px_rgba(255,0,127,0.8)]" />
              <span className="text-xs text-gray-200">Standalone PWA Launching Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
