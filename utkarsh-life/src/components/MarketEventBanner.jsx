import React from 'react';
import { TrendingUp, AlertTriangle, Zap } from 'lucide-react';

export default function MarketEventBanner({ event, timeLeft, onResolveBearMarket }) {
  if (!event) return null;

  const isBull = event.id === 'bull_run';
  const isBear = event.id === 'bear_market';

  return (
    <div className={`mx-4 mb-2 p-3 rounded-xl border flex items-center justify-between shadow-lg transition-all animate-pulse ${
      isBull 
        ? 'bg-yellow-950/40 border-[var(--color-cyber-gold)] text-[var(--color-cyber-gold)] shadow-[0_0_20px_rgba(255,215,0,0.4)]' 
        : 'bg-red-950/50 border-[var(--color-cyber-pink)] text-[var(--color-cyber-pink)] shadow-[0_0_20px_rgba(255,0,127,0.4)]'
    }`}>
      <div className="flex items-center gap-3">
        {isBull ? (
          <TrendingUp className="w-6 h-6 text-[var(--color-cyber-gold)] drop-shadow-[0_0_5px_rgba(255,215,0,0.8)]" />
        ) : (
          <AlertTriangle className="w-6 h-6 text-[var(--color-cyber-pink)] drop-shadow-[0_0_5px_rgba(255,0,127,0.8)]" />
        )}
        <div>
          <h4 className="font-black text-xs uppercase tracking-wider">{event.name}</h4>
          <p className="text-[10px] opacity-80">{event.desc}</p>
        </div>
      </div>

      {isBear ? (
        <button 
          onClick={onResolveBearMarket}
          className="bg-[var(--color-cyber-pink)] text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-[0_0_10px_rgba(255,0,127,0.8)] hover:bg-white hover:text-black transition-all"
        >
          Fix Crisis!
        </button>
      ) : (
        <div className="text-xs font-mono font-black border px-2 py-1 rounded-md border-current">
          {timeLeft}s
        </div>
      )}
    </div>
  );
}
