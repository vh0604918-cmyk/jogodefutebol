import React from 'react';
import { LayoutDashboard, Users, ArrowLeftRight, Dumbbell, Trophy, Landmark } from 'lucide-react';
import { sound } from '../utils/audio';

export type TabType = 'DASHBOARD' | 'TACTICS' | 'TRANSFERS' | 'TRAINING' | 'COMPETITIONS' | 'FINANCES';

interface NavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  incomingOffersCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  incomingOffersCount = 0,
}) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'DASHBOARD', label: 'Central', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'TACTICS', label: 'Elenco & Tática', icon: <Users className="w-4 h-4" /> },
    { id: 'TRANSFERS', label: 'Mercado da Bola', icon: <ArrowLeftRight className="w-4 h-4" />, badge: incomingOffersCount },
    { id: 'TRAINING', label: 'Treinamento', icon: <Dumbbell className="w-4 h-4" /> },
    { id: 'COMPETITIONS', label: 'Tabelas & Copas', icon: <Trophy className="w-4 h-4" /> },
    { id: 'FINANCES', label: 'Finanças & Diretoria', icon: <Landmark className="w-4 h-4" /> },
  ];

  return (
    <nav className="bg-neutral-900/60 border-b border-neutral-800/80 sticky top-[57px] z-20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar py-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                onSelectTab(tab.id);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {!!tab.badge && tab.badge > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-neutral-950 text-[10px] font-black flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
