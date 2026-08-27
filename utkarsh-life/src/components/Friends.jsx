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
        <h2 className="text-3xl font-black text-center mb-2">Invite Friends!</h2>
        <p className="text-gray-400 text-center text-sm">You and your friend will receive bonuses</p>
      </div>

      <div className="space-y-3 mb-8">
        <div className="bg-card-bg rounded-2xl p-4 border border-gray-800 flex items-center justify-between cursor-pointer hover:border-gray-700 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Invite a friend</h3>
              <div className="flex items-center gap-1 font-bold text-accent-gold mt-1">
                <div className="w-3 h-3 rounded-full bg-accent-gold flex items-center justify-center text-black text-[8px] font-bold">₹</div>
                <span className="text-xs">+5,000</span>
                <span className="text-[10px] text-gray-500 font-normal ml-1">for you and your friend</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card-bg rounded-2xl p-4 border border-gray-800 flex items-center justify-between cursor-pointer hover:border-gray-700 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-900/30 border border-blue-800 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Invite a friend with Telegram Premium</h3>
              <div className="flex items-center gap-1 font-bold text-accent-gold mt-1">
                <div className="w-3 h-3 rounded-full bg-accent-gold flex items-center justify-center text-black text-[8px] font-bold">₹</div>
                <span className="text-xs">+25,000</span>
                <span className="text-[10px] text-gray-500 font-normal ml-1">for you and your friend</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3 className="font-bold text-lg mb-4">List of your friends</h3>
      <div className="bg-card-bg rounded-2xl p-8 border border-gray-800 flex flex-col items-center justify-center mb-6">
        <Users className="w-12 h-12 text-gray-600 mb-3" />
        <p className="text-gray-400 text-sm">You haven't invited anyone yet</p>
      </div>

      <div className="fixed bottom-[90px] left-0 w-full px-4 flex gap-2">
        <button className="flex-1 bg-accent-gold text-black py-4 rounded-xl font-bold text-lg shadow-[0_0_15px_rgba(251,191,36,0.3)]">
          Invite a friend
        </button>
        <button 
          onClick={handleCopy}
          className="w-14 bg-gray-800 border border-gray-700 flex items-center justify-center rounded-xl transition-colors hover:bg-gray-700"
        >
          {copied ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Copy className="w-6 h-6 text-gray-300" />}
        </button>
      </div>
    </div>
  );
}
