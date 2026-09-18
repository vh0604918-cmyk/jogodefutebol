import React from 'react';
import { CareerSave, Match } from '../types/game';
import { ClubBadge } from './ClubBadge';
import { calculateTeamRating } from '../utils/simulation';
import { Play, Zap, Calendar, Target, Newspaper, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';
import { sound } from '../utils/audio';

interface DashboardViewProps {
  career: CareerSave;
  onPlayInteractive: (match: Match) => void;
  onSimulateQuick: (match: Match) => void;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  career,
  onPlayInteractive,
  onSimulateQuick,
  onNavigateToTab,
}) => {
  const currentTeam = career.teams.find((t) => t.id === career.clubId) || career.teams[0];

  // Find next unplayed match for current club
  const nextMatch = career.fixtures.find(
    (m) => !m.played && (m.homeTeamId === currentTeam.id || m.awayTeamId === currentTeam.id)
  );

  const homeTeam = nextMatch ? career.teams.find((t) => t.id === nextMatch.homeTeamId) || currentTeam : currentTeam;
  const awayTeam = nextMatch ? career.teams.find((t) => t.id === nextMatch.awayTeamId) || currentTeam : currentTeam;

  const isHome = nextMatch?.homeTeamId === currentTeam.id;
  const opponent = isHome ? awayTeam : homeTeam;

  const currentRating = calculateTeamRating(currentTeam);
  const opponentRating = calculateTeamRating(opponent);

  // Standings slice
  const standings = currentTeam.division === 'A' ? career.seriesAStandings : career.seriesBStandings;
  const teamStandingIndex = standings.findIndex((s) => s.teamId === currentTeam.id);
  const teamStanding = standings[teamStandingIndex];

  const topScorers = [...currentTeam.players]
    .sort((a, b) => b.goals - a.goals || b.overall - a.overall)
    .slice(0, 3);

  const tiredPlayers = currentTeam.players.filter(
    (p) => currentTeam.lineupIds.includes(p.id) && p.stamina < 65
  );

  return (
    <div className="space-y-6">
      {/* Top Banner: Next Match Day Hero (FC 26 Modern Dark Card) */}
      <div className="relative rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 p-5 sm:p-7 overflow-hidden shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold font-display uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Próximo Desafio
              </span>
              <span className="text-xs text-neutral-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                {nextMatch?.competition === 'COPA_DO_BRASIL' ? 'Copa do Brasil' : `Brasileirão Série ${currentTeam.division}`} • Rodada {career.currentRound}
              </span>
            </div>

            <div className="text-xs text-neutral-400">
              Estádio: <strong className="text-neutral-200">{homeTeam.stadium}</strong> ({homeTeam.city})
            </div>
          </div>

          {/* Match Teams Face-Off */}
          {nextMatch ? (
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 py-2">
              {/* Home Team */}
              <div className="flex items-center gap-4 md:justify-end">
                <div className="text-left md:text-right order-2 md:order-1">
                  <h3 className="text-lg sm:text-xl font-black text-white">{homeTeam.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-neutral-400 md:justify-end mt-1">
                    <span>ATA: <strong className="text-white">{calculateTeamRating(homeTeam).attack}</strong></span>
                    <span>MEI: <strong className="text-white">{calculateTeamRating(homeTeam).midfield}</strong></span>
                    <span>DEF: <strong className="text-white">{calculateTeamRating(homeTeam).defense}</strong></span>
                  </div>
                </div>
                <ClubBadge team={homeTeam} size="lg" className="order-1 md:order-2 shrink-0" />
              </div>

              {/* Center VS & Actions */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-display font-black text-xs text-neutral-300 mb-4 shadow-inner">
                  VS
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      sound.playClick();
                      onPlayInteractive(nextMatch);
                    }}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-extrabold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Jogar 2D Ao Vivo</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      onSimulateQuick(nextMatch);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-100 font-bold text-sm transition-all active:scale-95 cursor-pointer"
                    title="Simulação Instantânea da Rodada"
                  >
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Simular Rápido</span>
                  </button>
                </div>
              </div>

              {/* Away Team */}
              <div className="flex items-center gap-4">
                <ClubBadge team={awayTeam} size="lg" className="shrink-0" />
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white">{awayTeam.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                    <span>ATA: <strong className="text-white">{calculateTeamRating(awayTeam).attack}</strong></span>
                    <span>MEI: <strong className="text-white">{calculateTeamRating(awayTeam).midfield}</strong></span>
                    <span>DEF: <strong className="text-white">{calculateTeamRating(awayTeam).defense}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-neutral-400">
              Temporada concluída ou nenhum jogo programado! Verifique a aba de Campeonatos.
            </div>
          )}
        </div>
      </div>

      {/* Grid: Standings, News, Squad Alerts, Objectives */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1: Classificação Atual Resumida */}
        <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Tabela Série {currentTeam.division}
            </h3>
            <button
              onClick={() => onNavigateToTab('COMPETITIONS')}
              className="text-xs text-emerald-400 hover:underline cursor-pointer"
            >
              Ver Tabela Completa
            </button>
          </div>

          <div className="space-y-1.5 flex-1">
            {standings.slice(0, 6).map((st, idx) => {
              const team = career.teams.find((t) => t.id === st.teamId);
              if (!team) return null;
              const isUser = team.id === currentTeam.id;

              return (
                <div
                  key={st.teamId}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                    isUser
                      ? 'bg-emerald-500/15 border border-emerald-500/40 font-bold text-white'
                      : 'hover:bg-neutral-800/60 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-4 text-center font-mono font-bold ${
                        idx < 4 ? 'text-emerald-400' : 'text-neutral-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <ClubBadge team={team} size="sm" />
                    <span className="truncate">{team.shortName}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-neutral-400">{st.played}j</span>
                    <span className="text-neutral-400">{st.goalDifference > 0 ? `+${st.goalDifference}` : st.goalDifference}</span>
                    <strong className="text-white w-6 text-right font-display">{st.points}pts</strong>
                  </div>
                </div>
              );
            })}
          </div>

          {teamStandingIndex >= 6 && teamStanding && (
            <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-xs font-bold text-white">
              <div className="flex items-center gap-2.5">
                <span className="w-4 text-center font-mono text-emerald-400">{teamStandingIndex + 1}</span>
                <ClubBadge team={currentTeam} size="sm" />
                <span>{currentTeam.shortName} (Você)</span>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <span className="text-neutral-300">{teamStanding.played}j</span>
                <strong className="text-white w-6 text-right font-display">{teamStanding.points}pts</strong>
              </div>
            </div>
          )}
        </div>

        {/* Col 2: Notícias da Imprensa & Mercado */}
        <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-cyan-400" />
              Notícias & Bastidores
            </h3>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">Imprensa FC</span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-72 pr-1 flex-1">
            {career.news.map((news) => (
              <div
                key={news.id}
                className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
                  <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-bold uppercase">
                    {news.category}
                  </span>
                  <span>{news.date}</span>
                </div>
                <h4 className="text-xs font-bold text-neutral-100 mb-1 leading-snug">{news.title}</h4>
                <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">{news.summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Col 3: Objetivos da Diretoria & Alertas do Elenco */}
        <div className="space-y-6 flex flex-col">
          {/* Objetivos */}
          <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                Metas da Diretoria
              </h3>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {career.objectives.filter((o) => o.completed).length}/{career.objectives.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {career.objectives.slice(0, 3).map((obj) => (
                <div key={obj.id} className="p-2.5 rounded-lg bg-neutral-950/50 border border-neutral-800/60 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-neutral-200">{obj.title}</span>
                    <span className="text-[10px] text-neutral-400">{obj.target}</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(15, obj.progress))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alertas de Condição Física ou Artilheiros */}
          <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-5 flex-1">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-rose-400" />
              Destaques do Elenco
            </h3>

            {tiredPlayers.length > 0 && (
              <div className="mb-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-xs text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="block">Alerta de Desgaste Físico</strong>
                  <span>
                    {tiredPlayers.map((p) => p.commonName).join(', ')} precisam de descanso ou treinamento regenerativo.
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="text-[11px] text-neutral-400 uppercase font-bold tracking-wider mb-1">Artilheiros do Time</div>
              {topScorers.map((p, idx) => (
                <div key={p.id} className="flex items-center justify-between text-xs py-1 border-b border-neutral-800/60">
                  <span className="text-neutral-300">
                    <strong className="text-white">#{idx + 1}</strong> {p.commonName} ({p.position})
                  </span>
                  <span className="font-mono font-bold text-emerald-400">{p.goals} gols</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
