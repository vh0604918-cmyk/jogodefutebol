import React, { useState } from 'react';
import { Team, Player, PlayerPosition } from '../types/game';
import { PlayerCard } from './PlayerCard';
import { calculateTeamRating } from '../utils/simulation';
import { Shield, Zap, RefreshCw, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface TacticsViewProps {
  team: Team;
  onUpdateTeam: (updatedTeam: Team) => void;
}

// Coordinate mapping (percentages x, y on pitch) for standard formations
const FORMATION_COORDS: Record<string, { role: PlayerPosition; x: number; y: number }[]> = {
  '4-3-3': [
    { role: 'GOL', x: 50, y: 90 },
    { role: 'LE', x: 15, y: 72 },
    { role: 'ZAG', x: 38, y: 76 },
    { role: 'ZAG', x: 62, y: 76 },
    { role: 'LD', x: 85, y: 72 },
    { role: 'VOL', x: 50, y: 56 },
    { role: 'MC', x: 30, y: 46 },
    { role: 'MC', x: 70, y: 46 },
    { role: 'PE', x: 18, y: 22 },
    { role: 'ATA', x: 50, y: 16 },
    { role: 'PD', x: 82, y: 22 },
  ],
  '4-2-3-1': [
    { role: 'GOL', x: 50, y: 90 },
    { role: 'LE', x: 15, y: 73 },
    { role: 'ZAG', x: 38, y: 77 },
    { role: 'ZAG', x: 62, y: 77 },
    { role: 'LD', x: 85, y: 73 },
    { role: 'VOL', x: 36, y: 58 },
    { role: 'VOL', x: 64, y: 58 },
    { role: 'PE', x: 20, y: 35 },
    { role: 'MEI', x: 50, y: 36 },
    { role: 'PD', x: 80, y: 35 },
    { role: 'ATA', x: 50, y: 16 },
  ],
  '4-4-2': [
    { role: 'GOL', x: 50, y: 90 },
    { role: 'LE', x: 15, y: 73 },
    { role: 'ZAG', x: 38, y: 77 },
    { role: 'ZAG', x: 62, y: 77 },
    { role: 'LD', x: 85, y: 73 },
    { role: 'PE', x: 16, y: 48 },
    { role: 'MC', x: 38, y: 52 },
    { role: 'MC', x: 62, y: 52 },
    { role: 'PD', x: 84, y: 48 },
    { role: 'ATA', x: 38, y: 18 },
    { role: 'ATA', x: 62, y: 18 },
  ],
  '3-5-2': [
    { role: 'GOL', x: 50, y: 90 },
    { role: 'ZAG', x: 26, y: 76 },
    { role: 'ZAG', x: 50, y: 78 },
    { role: 'ZAG', x: 74, y: 76 },
    { role: 'LE', x: 12, y: 50 },
    { role: 'VOL', x: 38, y: 58 },
    { role: 'VOL', x: 62, y: 58 },
    { role: 'MEI', x: 50, y: 40 },
    { role: 'LD', x: 88, y: 50 },
    { role: 'ATA', x: 38, y: 18 },
    { role: 'ATA', x: 62, y: 18 },
  ],
};

export const TacticsView: React.FC<TacticsViewProps> = ({ team, onUpdateTeam }) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [positionFilter, setPositionFilter] = useState<string>('TODOS');

  const rating = calculateTeamRating(team);
  const activeFormation = team.formation in FORMATION_COORDS ? team.formation : '4-3-3';
  const coords = FORMATION_COORDS[activeFormation] || FORMATION_COORDS['4-3-3'];

  // Starters
  const starters = team.lineupIds
    .map((id) => team.players.find((p) => p.id === id))
    .filter((p): p is Player => p !== undefined);

  // Bench & Reserves
  const bench = team.players.filter((p) => !team.lineupIds.includes(p.id));

  // Swap logic
  const handlePlayerClick = (playerId: string) => {
    sound.playClick();
    if (!selectedPlayerId) {
      setSelectedPlayerId(playerId);
      return;
    }

    if (selectedPlayerId === playerId) {
      setSelectedPlayerId(null);
      return;
    }

    // Perform swap
    const isFirstStarter = team.lineupIds.includes(selectedPlayerId);
    const isSecondStarter = team.lineupIds.includes(playerId);

    let newLineupIds = [...team.lineupIds];

    if (isFirstStarter && isSecondStarter) {
      // Swap positions in lineup
      const idx1 = newLineupIds.indexOf(selectedPlayerId);
      const idx2 = newLineupIds.indexOf(playerId);
      newLineupIds[idx1] = playerId;
      newLineupIds[idx2] = selectedPlayerId;
    } else if (isFirstStarter && !isSecondStarter) {
      // Starter swapped with Bench
      const idx = newLineupIds.indexOf(selectedPlayerId);
      newLineupIds[idx] = playerId;
    } else if (!isFirstStarter && isSecondStarter) {
      // Bench swapped with Starter
      const idx = newLineupIds.indexOf(playerId);
      newLineupIds[idx] = selectedPlayerId;
    }

    onUpdateTeam({
      ...team,
      lineupIds: newLineupIds,
    });
    setSelectedPlayerId(null);
  };

  const handleFormationChange = (form: string) => {
    sound.playClick();
    onUpdateTeam({
      ...team,
      formation: form,
    });
  };

  const handleStyleChange = (style: Team['tacticalStyle']) => {
    sound.playClick();
    onUpdateTeam({
      ...team,
      tacticalStyle: style,
    });
  };

  const handleMentalityChange = (mentality: Team['mentality']) => {
    sound.playClick();
    onUpdateTeam({
      ...team,
      mentality,
    });
  };

  const filteredBench = bench.filter((p) => {
    if (positionFilter === 'TODOS') return true;
    if (positionFilter === 'ATA') return ['ATA', 'PE', 'PD'].includes(p.position);
    if (positionFilter === 'MEI') return ['MEI', 'MC', 'VOL'].includes(p.position);
    if (positionFilter === 'DEF') return ['ZAG', 'LE', 'LD'].includes(p.position);
    if (positionFilter === 'GOL') return p.position === 'GOL';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar: Tactical Overview & Team Ratings */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-neutral-900 border border-neutral-800">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Força do Time</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-display text-emerald-400">{rating.overall}</span>
              <span className="text-xs text-neutral-400 font-mono">OVR Geral</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold border-l border-neutral-800 pl-6">
            <div>
              <span className="text-neutral-500 block text-[10px]">ATAQUE</span>
              <span className="text-white text-base font-display">{rating.attack}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">MEIO</span>
              <span className="text-white text-base font-display">{rating.midfield}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">DEFESA</span>
              <span className="text-white text-base font-display">{rating.defense}</span>
            </div>
          </div>
        </div>

        {/* Formation Picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-bold">Formação:</span>
          {['4-3-3', '4-2-3-1', '4-4-2', '3-5-2'].map((f) => (
            <button
              key={f}
              onClick={() => handleFormationChange(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-display cursor-pointer transition-all ${
                activeFormation === f
                  ? 'bg-emerald-500 text-neutral-950 shadow-md scale-105'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Football Pitch & Bench/Reserves */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Pitch: 7 Cols */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {/* Pitch Container with realistic field markings */}
          <div className="relative w-full max-w-[540px] aspect-[4/5] rounded-2xl bg-gradient-to-b from-emerald-900 via-emerald-950 to-emerald-900 border-4 border-neutral-800 shadow-2xl p-4 overflow-hidden select-none">
            {/* Turf stripes */}
            <div className="absolute inset-0 flex flex-col opacity-15 pointer-events-none">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 ${i % 2 === 0 ? 'bg-black' : 'bg-transparent'}`}
                />
              ))}
            </div>

            {/* Pitch Lines */}
            <div className="absolute inset-4 border-2 border-white/25 rounded-lg pointer-events-none">
              {/* Half-way line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/25" />
              {/* Center Circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/25 rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/40 rounded-full" />

              {/* Top Penalty Box (Opponent) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 border-b-2 border-x-2 border-white/25 rounded-b-md" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-8 border-b-2 border-x-2 border-white/25 rounded-b-sm" />

              {/* Bottom Penalty Box (Our Goal) */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-20 border-t-2 border-x-2 border-white/25 rounded-t-md" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-8 border-t-2 border-x-2 border-white/25 rounded-t-sm" />
            </div>

            {/* Selected swap helper badge */}
            {selectedPlayerId && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full bg-emerald-500 text-neutral-950 font-extrabold text-xs shadow-lg animate-pulse flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Clique em outro jogador para trocar de posição</span>
              </div>
            )}

            {/* 11 Starter Nodes on Field */}
            {starters.slice(0, 11).map((player, idx) => {
              const posCoord = coords[idx] || { role: player.position, x: 50, y: 50 };
              const isSelected = selectedPlayerId === player.id;

              return (
                <div
                  key={player.id}
                  onClick={() => handlePlayerClick(player.id)}
                  style={{
                    left: `${posCoord.x}%`,
                    top: `${posCoord.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute z-20 flex flex-col items-center cursor-pointer transition-all duration-200 group ${
                    isSelected ? 'scale-115 z-30' : 'hover:scale-110'
                  }`}
                >
                  {/* Player Dot / Badge */}
                  <div
                    className={`relative w-12 h-12 rounded-full flex flex-col items-center justify-center font-display font-black text-xs shadow-xl border-2 transition-all ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-500 text-neutral-950 ring-4 ring-emerald-500/50'
                        : 'border-white/80 bg-neutral-900/90 text-white group-hover:border-emerald-400'
                    }`}
                  >
                    <span className="text-xs leading-none">{player.overall}</span>
                    <span className="text-[8px] uppercase tracking-tighter opacity-80 mt-0.5">
                      {player.position}
                    </span>

                    {/* Stamina ring or pill */}
                    <div className="absolute -bottom-1 w-6 h-1 bg-neutral-950 rounded-full overflow-hidden border border-neutral-700">
                      <div
                        className={`h-full ${
                          player.stamina > 70 ? 'bg-emerald-400' : player.stamina > 45 ? 'bg-amber-400' : 'bg-rose-500'
                        }`}
                        style={{ width: `${player.stamina}%` }}
                      />
                    </div>
                  </div>

                  {/* Name Tag */}
                  <div className="mt-1 px-2 py-0.5 rounded bg-neutral-950/80 backdrop-blur-sm border border-neutral-800 text-[10px] font-bold text-white whitespace-nowrap shadow-md">
                    {player.commonName}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Instructions & Swap tip */}
          <div className="mt-3 text-xs text-neutral-400 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Dica: Clique em qualquer atleta do campo ou do banco para inverter a posição.</span>
          </div>
        </div>

        {/* Right Sidebar: Tactical Sliders & Bench/Reserves: 5 Cols */}
        <div className="lg:col-span-5 space-y-6">
          {/* Tactical Sliders */}
          <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-5 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Estilo Tático & Mentalidade
            </h3>

            {/* Tactical Style */}
            <div>
              <label className="text-xs text-neutral-400 font-semibold mb-2 block">Estilo de Jogo</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'POSSE', label: 'Tique-Taque (Posse)' },
                  { id: 'CONTRA_ATAQUE', label: 'Contra-Ataque' },
                  { id: 'PRESSAO_ALTA', label: 'Pressão Alta' },
                  { id: 'EQUILIBRADO', label: 'Equilibrado' },
                  { id: 'RETRANCA', label: 'Retranca' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleStyleChange(s.id as Team['tacticalStyle'])}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                      team.tacticalStyle === s.id
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mentality */}
            <div>
              <label className="text-xs text-neutral-400 font-semibold mb-2 block">Mentalidade da Equipe</label>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'ULTRA_DEF', label: 'Ultra Def.' },
                  { id: 'DEF', label: 'Defensiva' },
                  { id: 'BALANCED', label: 'Equilibrada' },
                  { id: 'ATTACK', label: 'Ofensiva' },
                  { id: 'ULTRA_ATTACK', label: 'Ultra Ofensiva' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleMentalityChange(m.id as Team['mentality'])}
                    className={`flex-1 py-1.5 rounded-md text-[11px] font-bold text-center transition-all cursor-pointer ${
                      team.mentality === m.id
                        ? 'bg-emerald-500 text-neutral-950 shadow'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bench & Reserves List */}
          <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                Banco de Reservas ({bench.length})
              </h3>

              {/* Filters */}
              <div className="flex items-center gap-1 text-[11px]">
                {['TODOS', 'DEF', 'MEI', 'ATA'].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setPositionFilter(pos)}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      positionFilter === pos
                        ? 'bg-emerald-500 text-neutral-950 font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredBench.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  size="sm"
                  selected={selectedPlayerId === player.id}
                  onClick={() => handlePlayerClick(player.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
