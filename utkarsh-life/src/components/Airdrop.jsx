import React from 'react';
import { Smartphone, CheckCircle2, ChevronRight } from 'lucide-react';

export default function Airdrop() {
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
        
        <div className="glass-panel p-4 flex items-center justify-between cursor-pointer hover:border-[var(--color-cyber-blue)] transition-colors hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--color-cyber-dark)] rounded-xl flex items-center justify-center border border-[var(--color-cyber-blue)] group-hover:bg-[var(--color-cyber-blue)] group-hover:text-black transition-colors shadow-[0_0_10px_rgba(0,240,255,0.2)]">
              <Smartphone className="w-6 h-6 text-[var(--color-cyber-blue)] group-hover:text-black" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Connect your UPI ID</h3>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--color-cyber-blue)]" />
        </div>

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
    </div>
  );
}
