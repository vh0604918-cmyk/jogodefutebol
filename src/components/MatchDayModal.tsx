import React, { useState, useEffect, useRef } from 'react';
import { Match, Team, MatchEvent, Player } from '../types/game';
import { ClubBadge } from './ClubBadge';
import { sound } from '../utils/audio';
import { Play, Pause, FastForward, SkipForward, Shield, Zap, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MatchDayModalProps {
  match: Match;
  careerTeams: Team[];
  userClubId: string;
  onFinishMatch: (updatedMatch: Match, updatedHome: Team, updatedAway: Team) => void;
  onClose: () => void;
}

interface DecisionPrompt {
  title: string;
  description: string;
  attacker: Player;
  options: {
    label: string;
    description: string;
    successRate: number;
    statName: string;
  }[];
}

export const MatchDayModal: React.FC<MatchDayModalProps> = ({
  match,
  careerTeams,
  userClubId,
  onFinishMatch,
  onClose,
}) => {
  const homeTeam = careerTeams.find((t) => t.id === match.homeTeamId)!;
  const awayTeam = careerTeams.find((t) => t.id === match.awayTeamId)!;

  const isUserHome = homeTeam.id === userClubId;
  const userTeam = isUserHome ? homeTeam : awayTeam;

  const [minute, setMinute] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<1 | 2 | 4>(2);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [commentary, setCommentary] = useState<string[]>([
    'Tudo pronto no estádio! As equipes entram em campo sob festa da torcida.',
    'Apita o árbitro, bola rolando!',
  ]);

  // Live in-match tactics
  const [currentMentality, setCurrentMentality] = useState<Team['mentality']>(userTeam.mentality || 'BALANCED');

  // Interactive decision moment
  const [decision, setDecision] = useState<DecisionPrompt | null>(null);

  // Match stats
  const [stats, setStats] = useState({
    possessionHome: 50,
    possessionAway: 50,
    shotsHome: 0,
    shotsAway: 0,
    shotsOnTargetHome: 0,
    shotsOnTargetAway: 0,
    cornersHome: 0,
    cornersAway: 0,
    foulsHome: 0,
    foulsAway: 0,
  });

  const [isFinished, setIsFinished] = useState(false);

  // 2D pitch animation coordinates for ball
  const [ballPos, setBallPos] = useState({ x: 50, y: 50 });

  // Initial whistle
  useEffect(() => {
    sound.playWhistle('short');
  }, []);

  // Main game loop
  useEffect(() => {
    if (!isPlaying || isFinished || decision !== null) return;

    const intervalTime = 400 / speed;

    const timer = setInterval(() => {
      setMinute((prev) => {
        const nextMin = prev + 1;

        // Animate ball position randomly across the pitch based on team possession
        const attackBias = currentMentality === 'ULTRA_ATTACK' ? (isUserHome ? 25 : 75) : 50;
        setBallPos({
          x: Math.max(10, Math.min(90, attackBias + (Math.random() * 40 - 20))),
          y: Math.max(10, Math.min(90, 50 + (Math.random() * 50 - 25))),
        });

        // Trigger ball kick sound occasionally
        if (nextMin % 6 === 0) {
          sound.playKick();
        }

        // Potential chance generation (minute-by-minute)
        const homeAttack = homeTeam.players.find((p) => homeTeam.lineupIds.includes(p.id) && ['ATA', 'PE', 'PD'].includes(p.position)) || homeTeam.players[0];
        const awayAttack = awayTeam.players.find((p) => awayTeam.lineupIds.includes(p.id) && ['ATA', 'PE', 'PD'].includes(p.position)) || awayTeam.players[0];

        // Trigger interactive user moment around minute 28, 62 or 84 if not already fired
        if ((nextMin === 28 || nextMin === 68) && !decision) {
          const userAttackers = userTeam.players.filter((p) => userTeam.lineupIds.includes(p.id) && ['ATA', 'PE', 'PD', 'MEI'].includes(p.position));
          const heroPlayer = userAttackers.length ? userAttackers[Math.floor(Math.random() * userAttackers.length)] : userTeam.players[0];

          setIsPlaying(false);
          sound.playWhistle('short');
          setDecision({
            title: `MOMENTO DECISIVO! (${nextMin}')`,
            description: `${heroPlayer.commonName} recebe passe magistral nas costas da zaga adversária e invade a grande área! Como você decide finalizar a jogada?`,
            attacker: heroPlayer,
            options: [
              {
                label: 'Chute colocado no canto',
                description: 'Bate com a chapa do pé buscando o ângulo da meta.',
                successRate: heroPlayer.stats.shooting * 0.95,
                statName: `FIN: ${heroPlayer.stats.shooting}`,
              },
              {
                label: 'Bicuda rasteira com força',
                description: 'Enche o pé com violência mirando o canto rasteiro.',
                successRate: (heroPlayer.stats.shooting + heroPlayer.stats.physical) * 0.5,
                statName: `FORÇA/FIN: ${heroPlayer.stats.physical}`,
              },
              {
                label: 'Driblar o goleiro',
                description: 'Tenta o corte seco para empurrar pro gol vazio!',
                successRate: heroPlayer.stats.dribbling * 0.9,
                statName: `DRI: ${heroPlayer.stats.dribbling}`,
              },
            ],
          });
          return nextMin;
        }

        // Random background chances
        const chanceRoll = Math.random();

        // Home chance
        if (chanceRoll < 0.08) {
          const isGoal = Math.random() < 0.32;
          const onTarget = isGoal || Math.random() < 0.55;

          setStats((s) => ({
            ...s,
            shotsHome: s.shotsHome + 1,
            shotsOnTargetHome: s.shotsOnTargetHome + (onTarget ? 1 : 0),
          }));

          if (isGoal) {
            sound.playGoalHorn();
            confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
            setHomeScore((s) => s + 1);
            const goalEvent: MatchEvent = {
              minute: nextMin,
              type: 'GOAL',
              teamId: homeTeam.id,
              playerId: homeAttack.id,
              playerName: homeAttack.commonName,
              description: `GOLAÇO DO ${homeTeam.shortName.toUpperCase()}! ${homeAttack.commonName} estufa as redes adversárias com um chute espetacular! (${nextMin}')`,
            };
            setEvents((e) => [...e, goalEvent]);
            setCommentary((c) => [goalEvent.description, ...c]);
          } else if (onTarget) {
            setCommentary((c) => [
              `(${nextMin}') GRANDE DEFESA! O goleiro do ${awayTeam.shortName} espalma para escanteio!`,
              ...c,
            ]);
            setStats((s) => ({ ...s, cornersHome: s.cornersHome + 1 }));
          } else {
            setCommentary((c) => [
              `(${nextMin}') ${homeAttack.commonName} arrisca de longe, mas a bola sobe demais e vai na arquibancada.`,
              ...c,
            ]);
          }
        }

        // Away chance
        if (chanceRoll > 0.92) {
          const isGoal = Math.random() < 0.28;
          const onTarget = isGoal || Math.random() < 0.52;

          setStats((s) => ({
            ...s,
            shotsAway: s.shotsAway + 1,
            shotsOnTargetAway: s.shotsOnTargetAway + (onTarget ? 1 : 0),
          }));

          if (isGoal) {
            sound.playGoalHorn();
            setAwayScore((s) => s + 1);
            const goalEvent: MatchEvent = {
              minute: nextMin,
              type: 'GOAL',
              teamId: awayTeam.id,
              playerId: awayAttack.id,
              playerName: awayAttack.commonName,
              description: `GOL DO ${awayTeam.shortName.toUpperCase()}! ${awayAttack.commonName} aproveita rebote e coloca no fundo do gol! (${nextMin}')`,
            };
            setEvents((e) => [...e, goalEvent]);
            setCommentary((c) => [goalEvent.description, ...c]);
          } else if (onTarget) {
            setCommentary((c) => [
              `(${nextMin}') Defesa providencial do goleiro do ${homeTeam.shortName}!`,
              ...c,
            ]);
            setStats((s) => ({ ...s, cornersAway: s.cornersAway + 1 }));
          }
        }

        // End of match
        if (nextMin >= 90) {
          sound.playWhistle('final');
          setIsFinished(true);
          setIsPlaying(false);
          setCommentary((c) => ['Fim de papo! O árbitro apita o encerramento do jogo.', ...c]);
          return 90;
        }

        return nextMin;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, isFinished, speed, decision, currentMentality]);

  const handleExecuteDecision = (successRate: number, optionLabel: string) => {
    if (!decision) return;
    const isGoal = Math.random() * 100 < successRate;
    const scorer = decision.attacker;

    if (isGoal) {
      sound.playGoalHorn();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      if (isUserHome) {
        setHomeScore((s) => s + 1);
      } else {
        setAwayScore((s) => s + 1);
      }

      const goalEvent: MatchEvent = {
        minute,
        type: 'GOAL',
        teamId: userTeam.id,
        playerId: scorer.id,
        playerName: scorer.commonName,
        description: `GOOOOL! Escolha perfeita com "${optionLabel}"! ${scorer.commonName} não perdoa e anota um lindo gol!`,
      };
      setEvents((e) => [...e, goalEvent]);
      setCommentary((c) => [goalEvent.description, ...c]);
    } else {
      sound.playPostHit();
      setCommentary((c) => [
        `(${minute}') NA TRAVE! ${scorer.commonName} tentou "${optionLabel}", mas a bola explodiu no travessão!`,
        ...c,
      ]);
    }

    setDecision(null);
    setIsPlaying(true);
  };

  const handleSkipToEnd = () => {
    sound.playWhistle('final');
    // Compute quick score if needed
    setMinute(90);
    setIsFinished(true);
    setIsPlaying(false);
  };

  const handleConfirmResult = () => {
    sound.playClick();
    const updatedMatch: Match = {
      ...match,
      homeScore,
      awayScore,
      played: true,
      events,
      stats: {
        ...stats,
        xGHome: Number((homeScore * 0.8 + 0.4).toFixed(2)),
        xGAway: Number((awayScore * 0.8 + 0.3).toFixed(2)),
      },
    };

    onFinishMatch(updatedMatch, homeTeam, awayTeam);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-3xl bg-neutral-950 border border-neutral-800 shadow-2xl flex flex-col p-4 sm:p-6 space-y-5">
        {/* Scoreboard Header */}
        <div className="relative rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 p-4 sm:p-6">
          <div className="text-center text-xs text-neutral-400 uppercase font-mono mb-2">
            {match.competition === 'COPA_DO_BRASIL' ? 'Copa do Brasil' : `Brasileirão Série ${homeTeam.division}`} • {homeTeam.stadium}
          </div>

          <div className="grid grid-cols-7 items-center">
            {/* Home Team */}
            <div className="col-span-3 flex items-center gap-3 justify-end">
              <span className="text-base sm:text-xl font-black text-white text-right truncate">
                {homeTeam.shortName}
              </span>
              <ClubBadge team={homeTeam} size="lg" />
            </div>

            {/* Score & Clock */}
            <div className="col-span-1 flex flex-col items-center justify-center">
              <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs mb-1">
                {minute}'
              </div>
              <div className="font-display font-black text-3xl sm:text-4xl text-white tracking-wider">
                {homeScore} - {awayScore}
              </div>
            </div>

            {/* Away Team */}
            <div className="col-span-3 flex items-center gap-3">
              <ClubBadge team={awayTeam} size="lg" />
              <span className="text-base sm:text-xl font-black text-white truncate">
                {awayTeam.shortName}
              </span>
            </div>
          </div>
        </div>

        {/* 2D Animated Pitch View */}
        <div className="relative w-full aspect-[16/8] rounded-2xl bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 border-2 border-emerald-800/60 overflow-hidden shadow-inner p-4">
          {/* Pitch Lines */}
          <div className="absolute inset-4 border border-white/30 rounded-md pointer-events-none">
            {/* Midfield line */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/30" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-white/30 rounded-full" />
            {/* Left Box */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-24 h-36 border-r border-y border-white/30 rounded-r-md" />
            {/* Right Box */}
            <div className="absolute top-1/2 -translate-y-1/2 right-0 w-24 h-36 border-l border-y border-white/30 rounded-l-md" />
          </div>

          {/* Animated Soccer Ball */}
          <div
            className="absolute z-20 w-4 h-4 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 border border-black"
            style={{
              left: `${ballPos.x}%`,
              top: `${ballPos.y}%`,
            }}
          />

          {/* Home and Away active player indicators */}
          <div
            className="absolute z-10 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-md transition-all duration-500"
            style={{
              backgroundColor: homeTeam.primaryColor,
              left: `${Math.max(15, ballPos.x - 6)}%`,
              top: `${ballPos.y}%`,
            }}
          >
            {homeTeam.badgeInitials[0]}
          </div>

          <div
            className="absolute z-10 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-md transition-all duration-500"
            style={{
              backgroundColor: awayTeam.primaryColor,
              left: `${Math.min(85, ballPos.x + 6)}%`,
              top: `${ballPos.y}%`,
            }}
          >
            {awayTeam.badgeInitials[0]}
          </div>

          {/* Status overlay */}
          <div className="absolute bottom-3 left-4 text-[11px] text-neutral-300 font-mono bg-black/60 px-2.5 py-1 rounded backdrop-blur-sm">
            {minute < 45 ? '1º Tempo' : minute < 90 ? '2º Tempo' : 'Tempo Esgotado'}
          </div>
        </div>

        {/* Tactical Controls & Speed */}
        {!isFinished && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800">
            {/* Play/Pause & Speed */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setIsPlaying(!isPlaying);
                }}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <div className="flex items-center gap-1 text-xs">
                {[1, 2, 4].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      sound.playClick();
                      setSpeed(s as any);
                    }}
                    className={`px-2 py-1 rounded font-mono font-bold cursor-pointer ${
                      speed === s ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              <button
                onClick={handleSkipToEnd}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold cursor-pointer ml-2"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Pular para o Fim</span>
              </button>
            </div>

            {/* In-game Mentality adjustment */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-bold">Mentalidade:</span>
              <div className="flex items-center gap-1">
                {(['ULTRA_DEF', 'DEF', 'BALANCED', 'ATTACK', 'ULTRA_ATTACK'] as Team['mentality'][]).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      sound.playClick();
                      setCurrentMentality(m);
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                      currentMentality === m ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {m === 'ULTRA_DEF' ? 'Retranca' : m === 'DEF' ? 'Def.' : m === 'BALANCED' ? 'Eq.' : m === 'ATTACK' ? 'Ofen.' : 'Pressão'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Live Commentary Log */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
            Transmissão & Narração Ao Vivo
          </span>
          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1 text-xs">
            {commentary.map((text, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg leading-relaxed ${
                  text.includes('GOL')
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                    : text.includes('DEFESA') || text.includes('TRAVE')
                    ? 'bg-amber-500/15 text-amber-300 font-semibold'
                    : 'bg-neutral-950/60 text-neutral-300'
                }`}
              >
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Finished Screen Action */}
        {isFinished && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleConfirmResult}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer active:scale-95"
            >
              Avançar na Temporada
            </button>
          </div>
        )}

        {/* Interactive Decision Popup */}
        {decision && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-emerald-500/60 p-6 shadow-2xl space-y-5">
              <div className="flex items-center gap-2 text-amber-400 font-display font-black text-lg">
                <AlertCircle className="w-6 h-6" />
                <span>{decision.title}</span>
              </div>

              <p className="text-xs text-neutral-200 leading-relaxed font-semibold">
                {decision.description}
              </p>

              <div className="space-y-3">
                {decision.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExecuteDecision(opt.successRate, opt.label)}
                    className="w-full text-left p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm group-hover:text-emerald-400">
                        {opt.label}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 font-bold">
                        {opt.statName}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">{opt.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
