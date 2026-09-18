import React from 'react';
import { CareerSave } from '../types/game';
import { ClubBadge } from './ClubBadge';
import { Volume2, VolumeX, PlusCircle, Award, TrendingUp, DollarSign, Crown, Edit2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  career: CareerSave;
  onNewCareer: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenOwnerModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  career,
  onNewCareer,
  soundEnabled,
  onToggleSound,
  onOpenOwnerModal,
}) => {
  const currentTeam = career.teams.find((t) => t.id === career.clubId) || career.teams[0];
  const ownerName = career.ownerName || 'VH';

  const formatBRL = (val: number) => {
    if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
    return `R$ ${(val / 1000).toFixed(0)}K`;
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <header className="sticky top-0 z-30 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Club & Manager Info */}
        <div className="flex items-center gap-3">
          <ClubBadge team={currentTeam} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                {currentTeam.name}
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Série {currentTeam.division}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-neutral-400">
              <span>Técnico: <strong className="text-neutral-200">{career.managerName}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Reputação: <strong className="text-amber-400">{career.managerReputation}</strong>
              </span>
              <span>•</span>
              <span className="font-mono text-emerald-400 font-semibold">
                Rodada {career.currentRound} / {career.maxRounds}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Owner badge, Finances, Board Confidence & Actions */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Owner of the Game Badge */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenOwnerModal();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/50 hover:border-amber-400 text-amber-300 hover:text-amber-200 transition-all shadow-sm hover:shadow-amber-500/10 cursor-pointer group"
            title="Dono do Jogo Oficial - Clique para alterar nome"
          >
            <Crown className="w-4 h-4 text-amber-400 fill-amber-400/40 group-hover:scale-110 transition-transform shrink-0" />
            <div className="text-left leading-tight">
              <span className="block text-[9px] uppercase font-bold tracking-wider text-amber-400/80">
                Dono do Jogo
              </span>
              <span className="text-xs font-black text-white group-hover:text-amber-300 transition-colors truncate max-w-[120px] sm:max-w-[160px] block">
                {ownerName}
              </span>
            </div>
            <Edit2 className="w-3 h-3 text-amber-400/60 group-hover:text-amber-300 ml-0.5 opacity-60 group-hover:opacity-100" />
          </button>

          {/* Transfer Budget */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800" title="Orçamento para Transferências">
            <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-left">
              <span className="block text-[10px] text-neutral-400 leading-none">Orçamento</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {formatBRL(career.finances.transferBudget)}
              </span>
            </div>
          </div>

          {/* Board Confidence */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold ${getConfidenceColor(
              career.boardConfidence
            )}`}
            title="Confiança da Diretoria"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] uppercase tracking-tighter opacity-80 leading-none">Diretoria</span>
              <span>{career.boardConfidence}%</span>
            </div>
          </div>

          {/* Audio toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleSound();
            }}
            className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
            title={soundEnabled ? 'Silenciar Áudio' : 'Ativar Sons do Estádio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
          </button>

          {/* New Career */}
          <button
            onClick={() => {
              sound.playClick();
              onNewCareer();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Jogo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
