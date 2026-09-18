import React, { useState } from 'react';
import { CareerSave } from '../types/game';
import { Landmark, TrendingUp, Building2, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface FinancesViewProps {
  career: CareerSave;
  onUpdateCareer: (updated: CareerSave) => void;
}

export const FinancesView: React.FC<FinancesViewProps> = ({ career, onUpdateCareer }) => {
  const currentTeam = career.teams.find((t) => t.id === career.clubId) || career.teams[0];
  const { finances } = career;

  const [upgradeMessage, setUpgradeMessage] = useState<string | null>(null);

  const formatBRL = (val: number) => {
    if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
    return `R$ ${(val / 1000).toFixed(0)}K`;
  };

  const totalWeeklyIncome = finances.sponsorWeekly + finances.merchandisingWeekly + Math.round(finances.matchdayRevenue / 2);
  const totalWeeklyExpense = finances.weeklyWageBill + finances.stadiumMaintenance;
  const netWeeklyBalance = totalWeeklyIncome - totalWeeklyExpense;

  const handleFacilityUpgrade = (
    type: 'ESTADIO' | 'CT' | 'BASE',
    cost: number,
    title: string
  ) => {
    if (finances.transferBudget < cost) {
      sound.playClick();
      setUpgradeMessage('Fundos insuficientes para esta obra de infraestrutura!');
      return;
    }

    sound.playFanfare();
    const updatedFinances = {
      ...finances,
      transferBudget: finances.transferBudget - cost,
      matchdayRevenue: type === 'ESTADIO' ? Math.round(finances.matchdayRevenue * 1.25) : finances.matchdayRevenue,
      merchandisingWeekly: type === 'BASE' ? Math.round(finances.merchandisingWeekly * 1.2) : finances.merchandisingWeekly,
    };

    setUpgradeMessage(`Modernização concluída com sucesso: ${title}!`);

    onUpdateCareer({
      ...career,
      finances: updatedFinances,
      boardConfidence: Math.min(100, career.boardConfidence + 4),
    });

    setTimeout(() => {
      setUpgradeMessage(null);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Financial Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-semibold block mb-1">Tesouraria & Transferências</span>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {formatBRL(finances.transferBudget)}
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">Saldo disponível para contratações</span>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-semibold block mb-1">Folha Salarial Semanal</span>
          <div className="text-2xl font-black font-mono text-neutral-100">
            {formatBRL(finances.weeklyWageBill)}
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">Teto semanal: {formatBRL(finances.wageBudget / 4)}</span>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-semibold block mb-1">Balanço Semanal Líquido</span>
          <div
            className={`text-2xl font-black font-mono ${
              netWeeklyBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {netWeeklyBalance >= 0 ? `+${formatBRL(netWeeklyBalance)}` : formatBRL(netWeeklyBalance)}
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            {netWeeklyBalance >= 0 ? 'Superávit operacional positivo' : 'Déficit semanal'}
          </span>
        </div>
      </div>

      {/* Income & Expense Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Receitas */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Fontes de Receita Semanal
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-neutral-800">
              <span className="text-neutral-400">Patrocínio Master & Uniforme</span>
              <strong className="text-emerald-400 font-mono">{formatBRL(finances.sponsorWeekly)}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-neutral-800">
              <span className="text-neutral-400">Venda de Camisas & Merchandising</span>
              <strong className="text-emerald-400 font-mono">{formatBRL(finances.merchandisingWeekly)}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-neutral-800">
              <span className="text-neutral-400">Média de Bilheteria por Jogo</span>
              <strong className="text-emerald-400 font-mono">{formatBRL(finances.matchdayRevenue)}</strong>
            </div>
          </div>
        </div>

        {/* Despesas */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Landmark className="w-4 h-4 text-rose-400" />
            Custos Operacionais & Despesas
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-neutral-800">
              <span className="text-neutral-400">Salários de Jogadores e Comissão</span>
              <strong className="text-rose-400 font-mono">{formatBRL(finances.weeklyWageBill)}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-neutral-800">
              <span className="text-neutral-400">Manutenção do Estádio e Logística</span>
              <strong className="text-rose-400 font-mono">{formatBRL(finances.stadiumMaintenance)}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-neutral-800">
              <span className="text-neutral-400">Capacidade do Estádio ({currentTeam.stadium})</span>
              <strong className="text-white font-mono">{currentTeam.stadiumCapacity.toLocaleString('pt-BR')} lugares</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrades de Infraestrutura */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-400" />
              Obras de Infraestrutura & Patrimônio do Clube
            </h3>
            <p className="text-xs text-neutral-400">
              Invista no futuro do clube para aumentar a arrecadação e melhorar o rendimento dos atletas.
            </p>
          </div>
        </div>

        {upgradeMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{upgradeMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-sm text-white mb-1">Expansão de Arquibancadas</h4>
              <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
                Adiciona 5.000 novos assentos e aumenta a bilheteria de todos os jogos como mandante em +25%.
              </p>
            </div>
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400">R$ 15.0M</span>
              <button
                onClick={() => handleFacilityUpgrade('ESTADIO', 15000000, 'Expansão de Arquibancadas')}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs cursor-pointer active:scale-95"
              >
                Construir
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-sm text-white mb-1">Novo Centro de Treinamento</h4>
              <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
                Aparelhos modernos de musculação e piscinas térmicas para reduzir o cansaço do elenco.
              </p>
            </div>
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400">R$ 10.0M</span>
              <button
                onClick={() => handleFacilityUpgrade('CT', 10000000, 'Novo Centro de Treinamento')}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs cursor-pointer active:scale-95"
              >
                Modernizar
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-sm text-white mb-1">Rede de Olheiros & Base</h4>
              <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
                Captação de garotos talentosos em todo o Brasil e valorização de camisas oficiais (+20% merchandising).
              </p>
            </div>
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400">R$ 8.0M</span>
              <button
                onClick={() => handleFacilityUpgrade('BASE', 8000000, 'Rede de Olheiros da Base')}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs cursor-pointer active:scale-95"
              >
                Investir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
