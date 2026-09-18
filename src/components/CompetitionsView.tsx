import React, { useState } from 'react';
import { CareerSave, Standing, Team, Player } from '../types/game';
import { ClubBadge } from './ClubBadge';
import { Trophy, Flame, Shield, Award } from 'lucide-react';
import { sound } from '../utils/audio';

interface CompetitionsViewProps {
  career: CareerSave;
}

export const CompetitionsView: React.FC<CompetitionsViewProps> = ({ career }) => {
  const [activeComp, setActiveComp] = useState<'SERIE_A' | 'SERIE_B' | 'COPA_DO_BRASIL' | 'TOP_SCORERS'>('SERIE_A');

  const currentTeam = career.teams.find((t) => t.id === career.clubId) || career.teams[0];

  // Aggregate all players across all teams for the top scorers leaderboard
  const allPlayersWithTeam: { player: Player; team: Team }[] = [];
  career.teams.forEach((team) => {
    team.players.forEach((p) => {
      if (p.goals > 0 || p.matchesPlayed > 0) {
        allPlayersWithTeam.push({ player: p, team });
      }
    });
  });

  const topScorers = [...allPlayersWithTeam].sort((a, b) => b.player.goals - a.player.goals || b.player.overall - a.player.overall);

  const renderStandingsTable = (standings: Standing[], division: 'A' | 'B') => {
    return (
      <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900/90 shadow-xl">
        <table className="w-full text-left text-xs text-neutral-300">
          <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
            <tr>
              <th className="py-3 px-3 w-12 text-center">#</th>
              <th className="py-3 px-4">Clube</th>
              <th className="py-3 px-3 text-center">PJ</th>
              <th className="py-3 px-3 text-center">V</th>
              <th className="py-3 px-3 text-center">E</th>
              <th className="py-3 px-3 text-center">D</th>
              <th className="py-3 px-3 text-center hidden sm:table-cell">GP</th>
              <th className="py-3 px-3 text-center hidden sm:table-cell">GC</th>
              <th className="py-3 px-3 text-center">SG</th>
              <th className="py-3 px-4 text-center font-bold text-white">PTS</th>
              <th className="py-3 px-4 hidden md:table-cell text-center">Últimos Jogos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {standings.map((row, idx) => {
              const team = career.teams.find((t) => t.id === row.teamId);
              if (!team) return null;
              const isCurrent = team.id === currentTeam.id;

              // Zone decoration
              let zoneStyle = 'border-l-4 border-transparent';
              if (division === 'A') {
                if (idx < 4) zoneStyle = 'border-l-4 border-emerald-500 bg-emerald-950/10'; // Libertadores
                else if (idx < 6) zoneStyle = 'border-l-4 border-cyan-500 bg-cyan-950/10'; // Pré-Libertadores
                else if (idx < 12) zoneStyle = 'border-l-4 border-blue-500 bg-blue-950/10'; // Sul-Americana
                else if (idx >= 16) zoneStyle = 'border-l-4 border-rose-500 bg-rose-950/10'; // Z4 Rebaixamento
              } else {
                if (idx < 4) zoneStyle = 'border-l-4 border-emerald-500 bg-emerald-950/10'; // G4 Acesso Série A
                else if (idx >= 16) zoneStyle = 'border-l-4 border-rose-500 bg-rose-950/10'; // Z4 Série C
              }

              return (
                <tr
                  key={row.teamId}
                  className={`transition-colors ${zoneStyle} ${
                    isCurrent ? 'bg-emerald-500/20 font-bold text-white ring-1 ring-emerald-500/40' : 'hover:bg-neutral-800/40'
                  }`}
                >
                  <td className="py-3 px-3 text-center font-mono font-bold">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <ClubBadge team={team} size="sm" />
                      <span className="font-semibold text-white">
                        {team.name} {isCurrent && <span className="text-emerald-400 text-[10px]">(Você)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-neutral-400">{row.played}</td>
                  <td className="py-3 px-3 text-center font-mono">{row.won}</td>
                  <td className="py-3 px-3 text-center font-mono">{row.drawn}</td>
                  <td className="py-3 px-3 text-center font-mono">{row.lost}</td>
                  <td className="py-3 px-3 text-center font-mono hidden sm:table-cell text-neutral-400">{row.goalsFor}</td>
                  <td className="py-3 px-3 text-center font-mono hidden sm:table-cell text-neutral-400">{row.goalsAgainst}</td>
                  <td className="py-3 px-3 text-center font-mono">
                    <span className={row.goalDifference > 0 ? 'text-emerald-400' : row.goalDifference < 0 ? 'text-rose-400' : ''}>
                      {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-display font-black text-sm text-emerald-400">
                    {row.points}
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <div className="flex items-center justify-center gap-1">
                      {row.form.length === 0 ? (
                        <span className="text-neutral-600 text-[10px]">-</span>
                      ) : (
                        row.form.map((res, i) => (
                          <span
                            key={i}
                            className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[9px] ${
                              res === 'V' ? 'bg-emerald-600 text-white' : res === 'E' ? 'bg-neutral-600 text-neutral-200' : 'bg-rose-600 text-white'
                            }`}
                          >
                            {res}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Legend */}
        <div className="p-3 bg-neutral-950/80 border-t border-neutral-800 flex flex-wrap items-center gap-4 text-[11px] text-neutral-400">
          {division === 'A' ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Libertadores (G4)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                <span>Pré-Libertadores (G6)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Sul-Americana (G12)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Z4 (Rebaixamento)</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Acesso à Série A (G4)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Z4 (Rebaixamento Série C)</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Copa do Brasil Bracket
  const cdbMatches = career.fixtures.filter((f) => f.competition === 'COPA_DO_BRASIL');

  return (
    <div className="space-y-6">
      {/* Competition Tabs */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-900 border border-neutral-800 overflow-x-auto no-scrollbar">
        <button
          onClick={() => {
            sound.playClick();
            setActiveComp('SERIE_A');
          }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeComp === 'SERIE_A' ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-800 text-neutral-300 hover:text-white'
          }`}
        >
          Brasileirão Série A
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveComp('SERIE_B');
          }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeComp === 'SERIE_B' ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-800 text-neutral-300 hover:text-white'
          }`}
        >
          Brasileirão Série B
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveComp('COPA_DO_BRASIL');
          }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeComp === 'COPA_DO_BRASIL' ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-800 text-neutral-300 hover:text-white'
          }`}
        >
          Copa do Brasil
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveComp('TOP_SCORERS');
          }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeComp === 'TOP_SCORERS' ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-800 text-neutral-300 hover:text-white'
          }`}
        >
          Artilharia & Estatísticas
        </button>
      </div>

      {activeComp === 'SERIE_A' && renderStandingsTable(career.seriesAStandings, 'A')}
      {activeComp === 'SERIE_B' && renderStandingsTable(career.seriesBStandings, 'B')}

      {activeComp === 'COPA_DO_BRASIL' && (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">Copa do Brasil 2026</h3>
              <p className="text-xs text-neutral-400">
                O torneio mais democrático do país. Confrontos eliminatórios de ida e volta com premiações milionárias.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {cdbMatches.slice(0, 8).map((m) => {
              const home = career.teams.find((t) => t.id === m.homeTeamId);
              const away = career.teams.find((t) => t.id === m.awayTeamId);
              if (!home || !away) return null;

              return (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <ClubBadge team={home} size="sm" />
                    <span className="text-xs font-bold text-white">{home.shortName}</span>
                  </div>

                  <div className="px-3 py-1 rounded bg-neutral-900 border border-neutral-800 font-mono font-bold text-xs text-emerald-400">
                    {m.played ? `${m.homeScore} x ${m.awayScore}` : `Rodada ${m.round}`}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{away.shortName}</span>
                    <ClubBadge team={away} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeComp === 'TOP_SCORERS' && (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6 text-rose-400" />
            <div>
              <h3 className="text-base font-bold text-white">Chuteira de Ouro • Artilharia do Futebol Brasileiro</h3>
              <p className="text-xs text-neutral-400">
                Os maiores goleadores e garçons da temporada nos gramados nacionais.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-900 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Jogador</th>
                  <th className="py-3 px-4">Clube</th>
                  <th className="py-3 px-3 text-center">Posição</th>
                  <th className="py-3 px-3 text-center">Jogos</th>
                  <th className="py-3 px-4 text-center font-bold text-emerald-400">Gols</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {topScorers.slice(0, 20).map(({ player, team }, idx) => (
                  <tr key={player.id} className="hover:bg-neutral-900/50">
                    <td className="py-3 px-4 text-center font-mono font-bold text-neutral-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-white">{player.commonName}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <ClubBadge team={team} size="sm" />
                        <span>{team.shortName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-neutral-400">{player.position}</td>
                    <td className="py-3 px-3 text-center font-mono text-neutral-400">{player.matchesPlayed}</td>
                    <td className="py-3 px-4 text-center font-display font-black text-sm text-emerald-400">
                      {player.goals}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
