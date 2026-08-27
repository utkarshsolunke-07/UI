import React from 'react';
import { Wallet, CheckCircle2, ChevronRight } from 'lucide-react';

export default function Airdrop() {
  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-24 overflow-y-auto">
      <div className="flex flex-col items-center mb-8 mt-4">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.5)] transform rotate-12">
          <span className="text-5xl font-black text-white drop-shadow-md">TON</span>
        </div>
        <h2 className="text-3xl font-black text-center mb-2">Airdrop Tasks</h2>
        <p className="text-gray-400 text-center text-sm px-4">
          Complete tasks to participate in the upcoming token Airdrop.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-sm text-gray-400 mb-2">Tasks List</h3>
        
        <div className="bg-card-bg rounded-2xl p-4 border border-gray-800 flex items-center justify-between cursor-pointer hover:border-gray-700 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center border border-gray-700 group-hover:bg-blue-900/30 group-hover:border-blue-500/50 transition-colors">
              <Wallet className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Connect your TON wallet</h3>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </div>

        <div className="bg-card-bg rounded-2xl p-4 border border-gray-800 flex items-center justify-between opacity-50 cursor-not-allowed">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center border border-gray-700">
              <CheckCircle2 className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Join UTKARSH LIFE channel</h3>
            </div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        </div>
      </div>
    </div>
  );
}
