import React from 'react';
import { Users, Gift, Copy, CheckCircle2 } from 'lucide-react';
import { formatCoins } from '../utils/gameLogic';

export default function Friends({ coins }) {
  const [copied, setCopied] = React.useState(false);
  
  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-24 overflow-y-auto">
      <div className="flex flex-col items-center mb-6 mt-4">
        <h2 className="text-3xl font-black text-center mb-2 neon-text-blue uppercase tracking-widest">Invite Friends!</h2>
        <p className="text-[var(--color-cyber-blue)] text-center text-sm">You and your friend will receive bonuses</p>
      </div>

      <div className="space-y-3 mb-8">
        <div className="glass-panel p-4 flex items-center justify-between cursor-pointer hover:border-[var(--color-cyber-blue)] transition-colors hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--color-cyber-dark)] rounded-xl flex items-center justify-center border border-[var(--color-cyber-gold)] shadow-[0_0_10px_rgba(255,215,0,0.2)]">
              <Gift className="w-6 h-6 text-[var(--color-cyber-gold)] drop-shadow-[0_0_5px_rgba(255,215,0,0.8)]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Invite a friend</h3>
              <div className="flex items-center gap-1 font-bold text-[var(--color-cyber-gold)] mt-1">
                <div className="w-3 h-3 rounded-full bg-[var(--color-cyber-gold)] flex items-center justify-center text-black text-[8px] font-bold shadow-[0_0_5px_rgba(255,215,0,0.5)]">₹</div>
                <span className="text-xs">+5,000</span>
                <span className="text-[10px] text-[var(--color-cyber-blue)] font-normal ml-1">for you and your friend</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center justify-between cursor-pointer hover:border-[var(--color-cyber-blue)] transition-colors hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] border-[var(--color-cyber-pink)] shadow-[0_0_15px_rgba(255,0,127,0.2)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-pink)] rounded-xl flex items-center justify-center shadow-[0_0_10px_rgba(255,0,127,0.2)]">
              <Gift className="w-6 h-6 text-[var(--color-cyber-pink)] drop-shadow-[0_0_5px_rgba(255,0,127,0.8)]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Invite a friend with Telegram Premium</h3>
              <div className="flex items-center gap-1 font-bold text-[var(--color-cyber-gold)] mt-1">
                <div className="w-3 h-3 rounded-full bg-[var(--color-cyber-gold)] flex items-center justify-center text-black text-[8px] font-bold shadow-[0_0_5px_rgba(255,215,0,0.5)]">₹</div>
                <span className="text-xs">+25,000</span>
                <span className="text-[10px] text-[var(--color-cyber-blue)] font-normal ml-1">for you and your friend</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3 className="font-bold text-lg mb-4 text-white">List of your friends</h3>
      <div className="glass-panel p-8 flex flex-col items-center justify-center mb-6">
        <Users className="w-12 h-12 text-[var(--color-cyber-blue)] mb-3 opacity-50" />
        <p className="text-[var(--color-cyber-blue)] text-sm opacity-70">You haven't invited anyone yet</p>
      </div>

      <div className="fixed bottom-[90px] left-0 w-full px-4 flex gap-2">
        <button className="flex-1 neon-btn">
          Invite a friend
        </button>
        <button 
          onClick={handleCopy}
          className="w-14 glass-panel flex items-center justify-center rounded-xl transition-all hover:bg-[var(--color-cyber-blue)] hover:border-[var(--color-cyber-blue)] group"
        >
          {copied ? <CheckCircle2 className="w-6 h-6 text-[var(--color-cyber-pink)] drop-shadow-[0_0_5px_rgba(255,0,127,0.8)]" /> : <Copy className="w-6 h-6 text-[var(--color-cyber-blue)] group-hover:text-black" />}
        </button>
      </div>
    </div>
  );
}
