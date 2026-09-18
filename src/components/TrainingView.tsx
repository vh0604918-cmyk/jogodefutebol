import React, { useState } from 'react';
import { Team, Player } from '../types/game';
import { PlayerCard } from './PlayerCard';
import { Dumbbell, HeartPulse, Sparkles, TrendingUp, CheckCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface TrainingViewProps {
  team: Team;
  onUpdateTeam: (updated: Team) => void;
}

export const TrainingView: React.FC<TrainingViewProps> = ({ team, onUpdateTeam }) => {
  const [selectedDrill, setSelectedDrill] = useState<'FINALIZACAO' | 'DEFESA' | 'PASSE' | 'RECUPERACAO'>('FINALIZACAO');
  const [trainingApplied, setTrainingApplied] = useState(false);

  const youngPlayers = [...team.players]
    .filter((p) => p.age <= 23 && p.potential > p.overall)
    .sort((a, b) => b.potential - a.potential);

  const applyTraining = () => {
    sound.playFanfare();
    setTrainingApplied(true);

    const updatedPlayers = team.players.map((p) => {
      let updatedStats = { ...p.stats };
      let stamina = p.stamina;
      let overall = p.overall;

      if (selectedDrill === 'RECUPERACAO') {
        stamina = Math.min(100, stamina + 25);
      } else {
        stamina = Math.max(40, stamina - 5);

        // Young players have chance to develop
        if (p.age <= 23 && p.potential > p.overall) {
          if (Math.random() > 0.4) {
            overall = Math.min(p.potential, overall + 1);
          }
        }

        if (selectedDrill === 'FINALIZACAO' && ['ATA', 'PE', 'PD', 'MEI'].includes(p.position)) {
          updatedStats.shooting = Math.min(99, updatedStats.shooting + 1);
        } else if (selectedDrill === 'DEFESA' && ['ZAG', 'LE', 'LD', 'VOL'].includes(p.position)) {
          updatedStats.defense = Math.min(99, updatedStats.defense + 1);
        } else if (selectedDrill === 'PASSE') {
          updatedStats.passing = Math.min(99, updatedStats.passing + 1);
        }
      }

      return {
        ...p,
        stats: updatedStats,
        stamina,
        overall,
      };
    });

    onUpdateTeam({
      ...team,
      players: updatedPlayers,
    });

    setTimeout(() => {
      setTrainingApplied(false);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Training Plan Hero */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-emerald-400" />
              Centro de Treinamento & Desenvolvimento
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Escolha a rotina da semana para lapidar os fundamentos da equipe ou acelerar a evolução das jovens promessas.
            </p>
          </div>

          <button
            onClick={applyTraining}
            disabled={trainingApplied}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
              trainingApplied
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950'
            }`}
          >
            {trainingApplied ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Treino Concluído!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Executar Treino da Semana</span>
              </>
            )}
          </button>
        </div>

        {/* Drill Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: 'FINALIZACAO',
              title: 'Ataque & Finalização',
              desc: 'Foco em pontaria de chutes, cabeceios e movimentação no terço final.',
              boost: '+1 Finalização (ATA/MEI)',
            },
            {
              id: 'DEFESA',
              title: 'Solidez Defensiva',
              desc: 'Desarmes precisos, posicionamento em linha e interceptações.',
              boost: '+1 Defesa (ZAG/VOL/LAT)',
            },
            {
              id: 'PASSE',
              title: 'Posse & Criação',
              desc: 'Transições rápidas, passe curto e visão de jogo coletiva.',
              boost: '+1 Passe & Drible',
            },
            {
              id: 'RECUPERACAO',
              title: 'Fisioterapia & Regenerativo',
              desc: 'Massagem, crioterapia e descanso ativo para recompor a condição física.',
              boost: '+25% Energia em todo o elenco',
            },
          ].map((drill) => {
            const isSelected = selectedDrill === drill.id;
            return (
              <div
                key={drill.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedDrill(drill.id as any);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg'
                    : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div>
                  <h4 className="font-bold text-sm text-white mb-1">{drill.title}</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed mb-3">{drill.desc}</p>
                </div>
                <div className="pt-2 border-t border-neutral-800/80">
                  <span className="text-[11px] font-mono font-semibold text-emerald-400">{drill.boost}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Young Prospects Development */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              Jovens Promessas da Categoria de Base & Elenco (Sub-23)
            </h3>
            <p className="text-xs text-neutral-400">
              Atletas com alto teto de potencial para se tornarem lendas do clube ou gerarem vendas históricas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {youngPlayers.map((player) => (
            <div key={player.id} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <PlayerCard player={player} size="md" />
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Evolução rumo ao Potencial:</span>
                  <strong className="text-amber-400 font-mono">
                    {player.overall} → {player.potential} POT
                  </strong>
                </div>
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full"
                    style={{
                      width: `${Math.min(100, (player.overall / player.potential) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
