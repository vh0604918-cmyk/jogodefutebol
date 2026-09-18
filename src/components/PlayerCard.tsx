import React from 'react';
import { Player } from '../types/game';

interface PlayerCardProps {
  player: Player;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  selected?: boolean;
  showDetails?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  size = 'md',
  onClick,
  selected = false,
  showDetails = true,
}) => {
  const getOvrColor = (ovr: number) => {
    if (ovr >= 82) return 'from-amber-400 via-yellow-500 to-amber-600 text-neutral-950';
    if (ovr >= 78) return 'from-emerald-400 via-teal-500 to-emerald-700 text-neutral-950';
    if (ovr >= 74) return 'from-blue-400 via-indigo-500 to-blue-700 text-white';
    return 'from-neutral-700 via-neutral-800 to-neutral-900 text-neutral-200';
  };

  const getPositionBadge = (pos: string) => {
    switch (pos) {
      case 'GOL':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'ZAG':
      case 'LD':
      case 'LE':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'VOL':
      case 'MC':
      case 'MEI':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      default:
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
    }
  };

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
    return `R$ ${(val / 1000).toFixed(0)}K`;
  };

  if (size === 'sm') {
    return (
      <div
        onClick={onClick}
        className={`flex items-center justify-between p-2 rounded-lg bg-neutral-900/80 border transition-all cursor-pointer ${
          selected ? 'border-emerald-500 ring-2 ring-emerald-500/40 bg-neutral-850' : 'border-neutral-800 hover:border-neutral-700'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-mono font-bold text-neutral-400 w-4">{player.number}</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getPositionBadge(player.position)}`}>
            {player.position}
          </span>
          <span className="text-sm font-semibold text-neutral-100 truncate">{player.commonName}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex flex-col items-end">
            <span className="text-xs font-display font-bold text-emerald-400">{player.overall}</span>
            <div className="w-10 h-1 bg-neutral-800 rounded-full overflow-hidden mt-0.5">
              <div
                className={`h-full ${player.stamina > 70 ? 'bg-emerald-500' : player.stamina > 45 ? 'bg-amber-500' : 'bg-rose-500'}`}
                style={{ width: `${player.stamina}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative group rounded-xl p-3.5 bg-gradient-to-b from-neutral-900 to-neutral-950 border transition-all duration-200 cursor-pointer overflow-hidden ${
        selected
          ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] -translate-y-1'
          : 'border-neutral-800/80 hover:border-neutral-600 hover:-translate-y-0.5'
      }`}
    >
      {/* Top Banner: OVR & Position & Name */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-11 h-11 rounded-lg flex flex-col items-center justify-center font-display font-black bg-gradient-to-br shadow-md ${getOvrColor(
              player.overall
            )}`}
          >
            <span className="text-base leading-none">{player.overall}</span>
            <span className="text-[9px] uppercase tracking-tighter opacity-80">OVR</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getPositionBadge(player.position)}`}>
                {player.position}
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">#{player.number}</span>
            </div>
            <h4 className="text-sm font-bold text-white tracking-tight truncate max-w-[130px]">
              {player.commonName}
            </h4>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-neutral-400">Idade: {player.age} anos</div>
          <div className="text-[11px] font-mono font-semibold text-emerald-400">{formatCurrency(player.value)}</div>
        </div>
      </div>

      {/* FC 26 Stats Hexa/Pill Row */}
      {showDetails && (
        <div className="mt-3 pt-2.5 border-t border-neutral-800/80 grid grid-cols-6 gap-1 text-center font-display text-[11px]">
          <div className="bg-neutral-950/60 rounded py-1">
            <span className="block text-[9px] text-neutral-500 font-sans">RIT</span>
            <span className="font-bold text-neutral-200">{player.stats.pace}</span>
          </div>
          <div className="bg-neutral-950/60 rounded py-1">
            <span className="block text-[9px] text-neutral-500 font-sans">FIN</span>
            <span className="font-bold text-neutral-200">{player.stats.shooting}</span>
          </div>
          <div className="bg-neutral-950/60 rounded py-1">
            <span className="block text-[9px] text-neutral-500 font-sans">PAS</span>
            <span className="font-bold text-neutral-200">{player.stats.passing}</span>
          </div>
          <div className="bg-neutral-950/60 rounded py-1">
            <span className="block text-[9px] text-neutral-500 font-sans">DRI</span>
            <span className="font-bold text-neutral-200">{player.stats.dribbling}</span>
          </div>
          <div className="bg-neutral-950/60 rounded py-1">
            <span className="block text-[9px] text-neutral-500 font-sans">DEF</span>
            <span className="font-bold text-neutral-200">{player.stats.defense}</span>
          </div>
          <div className="bg-neutral-950/60 rounded py-1">
            <span className="block text-[9px] text-neutral-500 font-sans">FIS</span>
            <span className="font-bold text-neutral-200">{player.stats.physical}</span>
          </div>
        </div>
      )}

      {/* Footer: Stamina and Morale */}
      <div className="mt-2.5 flex items-center justify-between text-[10px] text-neutral-400">
        <div className="flex items-center gap-1.5">
          <span>Energia:</span>
          <div className="w-12 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${player.stamina > 70 ? 'bg-emerald-500' : player.stamina > 45 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${player.stamina}%` }}
            />
          </div>
          <span className="font-mono text-neutral-300">{player.stamina}%</span>
        </div>

        {player.potential > player.overall && (
          <div className="text-amber-400 font-bold text-[10px] flex items-center gap-0.5" title="Potencial Futuro">
            <span>POT: {player.potential}</span>
          </div>
        )}
      </div>
    </div>
  );
};
