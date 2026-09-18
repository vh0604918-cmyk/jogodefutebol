import React, { useState } from 'react';
import { Team } from '../types/game';
import { ClubBadge } from './ClubBadge';
import { calculateTeamRating } from '../utils/simulation';
import { Trophy, Shield, DollarSign, User, Play, Sparkles, Crown } from 'lucide-react';
import { sound } from '../utils/audio';

interface ClubSelectModalProps {
  teams: Team[];
  onSelectClub: (teamId: string, managerName: string, ownerName: string) => void;
  isOpen: boolean;
  initialOwnerName?: string;
}

export const ClubSelectModal: React.FC<ClubSelectModalProps> = ({
  teams,
  onSelectClub,
  isOpen,
  initialOwnerName = 'VH (vh0604918)',
}) => {
  if (!isOpen) return null;

  const [selectedDivision, setSelectedDivision] = useState<'A' | 'B'>('A');
  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    teams.find((t) => t.division === 'A')?.id || teams[0].id
  );
  const [managerName, setManagerName] = useState<string>('Prof. Muricy');
  const [ownerName, setOwnerName] = useState<string>(initialOwnerName || 'VH');

  const filteredTeams = teams.filter((t) => t.division === selectedDivision);
  const currentTeam = teams.find((t) => t.id === selectedTeamId) || filteredTeams[0];
  const ratings = calculateTeamRating(currentTeam);

  const formatBRL = (val: number) => {
    if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
    return `R$ ${(val / 1000).toFixed(0)}K`;
  };

  const handleStart = () => {
    sound.playFanfare();
    onSelectClub(selectedTeamId, managerName.trim() || 'Técnico Campeão', ownerName.trim() || 'VH');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-5xl rounded-3xl bg-neutral-950 border border-neutral-800 shadow-2xl p-5 sm:p-8 space-y-6 animate-fade-in my-auto">
        {/* Header Title */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            MODO CARREIRA • FC BRASIL 26
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Escolha seu Clube & Comece sua Jornada
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto">
            Assuma o comando de um gigante do futebol brasileiro, gerencie contratações e leve seu clube à glória eterna.
          </p>
        </div>

        {/* Division Selector */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              setSelectedDivision('A');
              const firstA = teams.find((t) => t.division === 'A');
              if (firstA) setSelectedTeamId(firstA.id);
            }}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedDivision === 'A'
                ? 'bg-emerald-500 text-neutral-950 shadow-lg shadow-emerald-500/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            Brasileirão Série A (20 Clubes)
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setSelectedDivision('B');
              const firstB = teams.find((t) => t.division === 'B');
              if (firstB) setSelectedTeamId(firstB.id);
            }}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedDivision === 'B'
                ? 'bg-emerald-500 text-neutral-950 shadow-lg shadow-emerald-500/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            Brasileirão Série B (20 Clubes)
          </button>
        </div>

        {/* Main Selection Area: Grid of Clubs + Details Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Club Badges Grid: 7 Cols */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredTeams.map((team) => {
              const isSelected = selectedTeamId === team.id;
              return (
                <div
                  key={team.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedTeamId(team.id);
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500/40 -translate-y-0.5 shadow-lg'
                      : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850'
                  }`}
                >
                  <ClubBadge team={team} size="md" />
                  <div className="min-w-0 w-full">
                    <span className="block text-xs font-bold text-white truncate">{team.name}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      OVR {calculateTeamRating(team).overall}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Club Details Preview & Manager setup: 5 Cols */}
          <div className="lg:col-span-5 rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-5">
            {/* Club Header */}
            <div className="flex items-center gap-4 border-b border-neutral-800 pb-4">
              <ClubBadge team={currentTeam} size="lg" />
              <div>
                <h3 className="text-xl font-black text-white">{currentTeam.name}</h3>
                <span className="text-xs text-neutral-400">
                  {currentTeam.stadium} • {currentTeam.city}, {currentTeam.state}
                </span>
              </div>
            </div>

            {/* Ratings Breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block uppercase font-bold">Ataque</span>
                <span className="text-lg font-black font-display text-white">{ratings.attack}</span>
              </div>
              <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block uppercase font-bold">Meio</span>
                <span className="text-lg font-black font-display text-white">{ratings.midfield}</span>
              </div>
              <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block uppercase font-bold">Defesa</span>
                <span className="text-lg font-black font-display text-white">{ratings.defense}</span>
              </div>
            </div>

            {/* Financial & Board Expectations */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-neutral-800/80">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Orçamento de Transferências:
                </span>
                <strong className="text-emerald-400 font-mono font-bold">
                  {formatBRL(currentTeam.budget)}
                </strong>
              </div>

              <div className="flex justify-between py-1.5 border-b border-neutral-800/80">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  Expectativa da Diretoria:
                </span>
                <strong className="text-neutral-200">
                  {currentTeam.division === 'A'
                    ? ratings.overall >= 80
                      ? 'Lutar pelo Título & Libertadores'
                      : ratings.overall >= 75
                      ? 'Classificação Sul-Americana'
                      : 'Permanência na Série A'
                    : 'Acesso à Série A (G4)'}
                </strong>
              </div>
            </div>

            {/* Owner & Manager Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-amber-400 font-semibold mb-1.5 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  Dono do Jogo (Proprietário):
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Ex: VH"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-amber-500/40 text-xs text-amber-300 font-bold placeholder:text-neutral-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-300 font-semibold mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  Nome do Treinador:
                </label>
                <input
                  type="text"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="Ex: Seu Nome ou Apelido"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStart}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-black text-sm shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Assumir o {currentTeam.name}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
