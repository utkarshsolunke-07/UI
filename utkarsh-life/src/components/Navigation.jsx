import React from 'react';
import { Pickaxe, Users, Coins, Gem, Target } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'exchange', label: 'Exchange', icon: Coins },
    { id: 'mine', label: 'Mine', icon: Pickaxe },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'earn', label: 'Earn', icon: Target },
    { id: 'airdrop', label: 'Airdrop', icon: Gem },
  ];

  return (
    <div className="absolute bottom-0 w-full max-w-md bg-card-bg/95 backdrop-blur-md border-t border-gray-800 pb-safe rounded-t-2xl z-40">
      <div className="flex justify-around items-center p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 w-16 ${
                isActive ? 'bg-gray-800 text-white scale-105' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-accent-gold' : ''}`} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
