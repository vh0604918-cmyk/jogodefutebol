import React, { useState } from 'react';
import { CareerSave, Player, Team, TransferOffer } from '../types/game';
import { PlayerCard } from './PlayerCard';
import { ClubBadge } from './ClubBadge';
import { Search, DollarSign, ArrowUpRight, Check, X, Filter, UserPlus } from 'lucide-react';
import { sound } from '../utils/audio';

interface TransfersViewProps {
  career: CareerSave;
  onUpdateCareer: (updated: CareerSave) => void;
}

export const TransfersView: React.FC<TransfersViewProps> = ({ career, onUpdateCareer }) => {
  const currentTeam = career.teams.find((t) => t.id === career.clubId) || career.teams[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('TODOS');
  const [divisionFilter, setDivisionFilter] = useState<'ALL' | 'A' | 'B'>('ALL');
  const [activeTab, setActiveTab] = useState<'MARKET' | 'MY_SQUAD' | 'OFFERS'>('MARKET');

  // Negotiation Modal
  const [negotiatingPlayer, setNegotiatingPlayer] = useState<{
    player: Player;
    sellerTeam: Team;
  } | null>(null);

  const [offerValue, setOfferValue] = useState<number>(0);
  const [offerWage, setOfferWage] = useState<number>(0);
  const [negotiationMessage, setNegotiationMessage] = useState<string | null>(null);
  const [negotiationStatus, setNegotiationStatus] = useState<'PENDING' | 'ACCEPTED' | 'REJECTED' | null>(null);

  // All players not in user's team
  const allOtherPlayers: { player: Player; team: Team }[] = [];
  career.teams.forEach((team) => {
    if (team.id !== currentTeam.id) {
      if (divisionFilter === 'ALL' || team.division === divisionFilter) {
        team.players.forEach((p) => {
          allOtherPlayers.push({ player: p, team });
        });
      }
    }
  });

  const filteredMarket = allOtherPlayers.filter(({ player, team }) => {
    const matchesSearch =
      player.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (positionFilter === 'TODOS') return true;
    if (positionFilter === 'ATA') return ['ATA', 'PE', 'PD'].includes(player.position);
    if (positionFilter === 'MEI') return ['MEI', 'MC', 'VOL'].includes(player.position);
    if (positionFilter === 'DEF') return ['ZAG', 'LE', 'LD'].includes(player.position);
    if (positionFilter === 'GOL') return player.position === 'GOL';

    return true;
  });

  const formatBRL = (val: number) => {
    if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
    return `R$ ${(val / 1000).toFixed(0)}K`;
  };

  const startNegotiation = (player: Player, sellerTeam: Team) => {
    sound.playClick();
    setNegotiatingPlayer({ player, sellerTeam });
    setOfferValue(player.value);
    setOfferWage(Math.round(player.wage * 1.15));
    setNegotiationMessage(null);
    setNegotiationStatus('PENDING');
  };

  const submitOffer = () => {
    if (!negotiatingPlayer) return;
    const { player, sellerTeam } = negotiatingPlayer;

    if (offerValue > career.finances.transferBudget) {
      setNegotiationMessage('Orçamento insuficiente! Seu clube não tem fundos para esta transferência.');
      return;
    }

    // Realistic negotiation AI acceptance probability
    const valueRatio = offerValue / player.value;
    const wageRatio = offerWage / player.wage;

    if (valueRatio >= 0.95 && wageRatio >= 1.1) {
      // Deal ACCEPTED!
      sound.playFanfare();
      setNegotiationStatus('ACCEPTED');
      setNegotiationMessage(
        `Proposta aceita! O ${sellerTeam.shortName} aceitou ${formatBRL(
          offerValue
        )} e o jogador ${player.commonName} assinou contrato por ${formatBRL(offerWage)}/mês!`
      );

      // Execute transfer in career state
      const updatedSellerTeam: Team = {
        ...sellerTeam,
        budget: sellerTeam.budget + offerValue,
        players: sellerTeam.players.filter((p) => p.id !== player.id),
        lineupIds: sellerTeam.lineupIds.filter((id) => id !== player.id),
      };

      const transferredPlayer: Player = {
        ...player,
        wage: offerWage,
        contractYears: 3,
        morale: 95,
      };

      const updatedUserTeam: Team = {
        ...currentTeam,
        players: [...currentTeam.players, transferredPlayer],
        budget: career.finances.transferBudget - offerValue,
      };

      const updatedTeams = career.teams.map((t) => {
        if (t.id === sellerTeam.id) return updatedSellerTeam;
        if (t.id === currentTeam.id) return updatedUserTeam;
        return t;
      });

      const updatedFinances = {
        ...career.finances,
        transferBudget: career.finances.transferBudget - offerValue,
        weeklyWageBill: career.finances.weeklyWageBill + Math.round(offerWage / 4),
      };

      const newNews = [
        {
          id: `trans_${Date.now()}`,
          date: '18/09/2026',
          title: `BOMBA NO MERCADO: ${player.commonName} é anunciado pelo ${currentTeam.shortName}!`,
          summary: `Em negociação milionária de ${formatBRL(
            offerValue
          )}, o atleta reforça a equipe na sequência da temporada.`,
          category: 'TRANSFERENCIA' as const,
          important: true,
        },
        ...career.news,
      ];

      setTimeout(() => {
        onUpdateCareer({
          ...career,
          teams: updatedTeams,
          finances: updatedFinances,
          news: newNews,
        });
      }, 1500);
    } else if (valueRatio < 0.8) {
      sound.playClick();
      setNegotiationStatus('REJECTED');
      setNegotiationMessage(
        `Proposta recusada pelo ${sellerTeam.shortName}! Eles consideram o valor oferecido ofensivo para um jogador deste calibre.`
      );
    } else {
      sound.playClick();
      const counter = Math.round(player.value * 1.1);
      setNegotiationMessage(
        `Contraproposta do ${sellerTeam.shortName}: Eles aceitam liberar ${player.commonName} por no mínimo ${formatBRL(
          counter
        )}.`
      );
      setOfferValue(counter);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs: Mercado / Meu Elenco (Vendas) / Propostas Recebidas */}
      <div className="flex items-center justify-between flex-wrap gap-4 p-4 rounded-xl bg-neutral-900 border border-neutral-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('MARKET')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'MARKET' ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-800 text-neutral-300 hover:text-white'
            }`}
          >
            Buscar Jogadores no Mercado
          </button>
          <button
            onClick={() => setActiveTab('MY_SQUAD')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'MY_SQUAD' ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-800 text-neutral-300 hover:text-white'
            }`}
          >
            Elenco Próprio & Vendas
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-400">Orçamento Livre:</span>
          <strong className="text-emerald-400 font-mono text-sm">{formatBRL(career.finances.transferBudget)}</strong>
        </div>
      </div>

      {activeTab === 'MARKET' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
            {/* Search input */}
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome de jogador ou time..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Position filter */}
            <div>
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="TODOS">Todas as Posições</option>
                <option value="ATA">Atacantes (ATA / PE / PD)</option>
                <option value="MEI">Meio-Campistas (MEI / MC / VOL)</option>
                <option value="DEF">Defensores (ZAG / LE / LD)</option>
                <option value="GOL">Goleiros (GOL)</option>
              </select>
            </div>

            {/* Division filter */}
            <div>
              <select
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">Todas as Divisões (A & B)</option>
                <option value="A">Apenas Série A</option>
                <option value="B">Apenas Série B</option>
              </select>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMarket.slice(0, 30).map(({ player, team }) => (
              <div
                key={player.id}
                className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 flex flex-col justify-between gap-3 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ClubBadge team={team} size="sm" />
                      <span className="text-xs font-semibold text-neutral-300">{team.shortName}</span>
                    </div>
                    <span className="text-[10px] text-neutral-400">Série {team.division}</span>
                  </div>

                  <PlayerCard player={player} size="md" showDetails={true} />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                  <div className="text-xs">
                    <span className="text-neutral-400 block text-[10px]">Salário estimado</span>
                    <span className="font-mono text-neutral-200">{formatBRL(player.wage)}/mês</span>
                  </div>

                  <button
                    onClick={() => startNegotiation(player, team)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Fazer Proposta</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'MY_SQUAD' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
            <h3 className="font-bold text-sm text-white mb-2">Jogadores do {currentTeam.name}</h3>
            <p className="text-xs text-neutral-400 mb-4">
              Gerencie os atletas do seu clube. Venda jogadores para arrecadar fundos e abrir espaço na folha salarial.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentTeam.players.map((player) => (
                <div
                  key={player.id}
                  className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between gap-3"
                >
                  <PlayerCard player={player} size="md" />
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-xs">
                    <span className="font-mono text-emerald-400 font-bold">Valor: {formatBRL(player.value)}</span>
                    <span className="text-neutral-400 font-mono">Salário: {formatBRL(player.wage)}/mês</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Negotiation Modal */}
      {negotiatingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-700 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-3">
                <ClubBadge team={negotiatingPlayer.sellerTeam} size="md" />
                <div>
                  <h3 className="text-base font-bold text-white">Negociação de Transferência</h3>
                  <span className="text-xs text-neutral-400">
                    Clube vendedor: {negotiatingPlayer.sellerTeam.name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setNegotiatingPlayer(null)}
                className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Player preview */}
            <div className="flex items-center gap-4 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <div className="w-12 h-12 rounded-lg bg-emerald-500 text-neutral-950 flex flex-col items-center justify-center font-display font-black">
                <span className="text-base leading-none">{negotiatingPlayer.player.overall}</span>
                <span className="text-[9px] uppercase">{negotiatingPlayer.player.position}</span>
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{negotiatingPlayer.player.name}</h4>
                <div className="text-xs text-neutral-400">
                  Idade: {negotiatingPlayer.player.age} anos • Avaliação de Mercado: {formatBRL(negotiatingPlayer.player.value)}
                </div>
              </div>
            </div>

            {/* Offer inputs */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label className="font-semibold text-neutral-300">Valor da Proposta ao Clube</label>
                  <span className="font-mono font-bold text-emerald-400">{formatBRL(offerValue)}</span>
                </div>
                <input
                  type="range"
                  min={Math.round(negotiatingPlayer.player.value * 0.5)}
                  max={Math.round(negotiatingPlayer.player.value * 2.5)}
                  step={500000}
                  value={offerValue}
                  onChange={(e) => setOfferValue(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label className="font-semibold text-neutral-300">Salário Oferecido ao Atleta</label>
                  <span className="font-mono font-bold text-emerald-400">{formatBRL(offerWage)} / mês</span>
                </div>
                <input
                  type="range"
                  min={Math.round(negotiatingPlayer.player.wage * 0.8)}
                  max={Math.round(negotiatingPlayer.player.wage * 2.2)}
                  step={10000}
                  value={offerWage}
                  onChange={(e) => setOfferWage(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Feedback message */}
            {negotiationMessage && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold ${
                  negotiationStatus === 'ACCEPTED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : negotiationStatus === 'REJECTED'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {negotiationMessage}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                onClick={() => setNegotiatingPlayer(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              {negotiationStatus !== 'ACCEPTED' && (
                <button
                  onClick={submitOffer}
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Enviar Proposta</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
