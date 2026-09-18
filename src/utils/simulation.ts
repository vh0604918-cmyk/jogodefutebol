import { Team, Match, MatchEvent, MatchStats, Standing, Player } from '../types/game';

interface TeamRating {
  attack: number;
  midfield: number;
  defense: number;
  overall: number;
}

export function calculateTeamRating(team: Team): TeamRating {
  const starters = team.players.filter((p) => team.lineupIds.includes(p.id));
  if (starters.length === 0) {
    return { attack: 72, midfield: 72, defense: 72, overall: 72 };
  }

  const attackers = starters.filter((p) => ['ATA', 'PE', 'PD'].includes(p.position));
  const midfielders = starters.filter((p) => ['MEI', 'MC', 'VOL'].includes(p.position));
  const defenders = starters.filter((p) => ['ZAG', 'LE', 'LD', 'GOL'].includes(p.position));

  const avg = (arr: Player[], fallback: number) =>
    arr.length ? Math.round(arr.reduce((acc, p) => acc + p.overall, 0) / arr.length) : fallback;

  const overall = Math.round(starters.reduce((acc, p) => acc + p.overall, 0) / starters.length);
  const attack = avg(attackers, overall);
  const midfield = avg(midfielders, overall);
  const defense = avg(defenders, overall);

  return { attack, midfield, defense, overall };
}

export function simulateMatchResult(
  homeTeam: Team,
  awayTeam: Team,
  match: Match,
  options?: { isInteractive?: boolean }
): { match: Match; updatedHomeTeam: Team; updatedAwayTeam: Team } {
  const homeRating = calculateTeamRating(homeTeam);
  const awayRating = calculateTeamRating(awayTeam);

  // Home advantage boost (+2 overall rating effect)
  const homeStrength = homeRating.overall + 2;
  const awayStrength = awayRating.overall;

  // Mentality factors
  const mentalityGoalMultipliers = {
    ULTRA_DEF: 0.6,
    DEF: 0.8,
    BALANCED: 1.0,
    ATTACK: 1.25,
    ULTRA_ATTACK: 1.45,
  };

  const homeMult = mentalityGoalMultipliers[homeTeam.mentality || 'BALANCED'];
  const awayMult = mentalityGoalMultipliers[awayTeam.mentality || 'BALANCED'];

  // Calculate expected goals (xG) based on attack vs opponent defense
  const homeXG = Math.max(0.4, (homeRating.attack - awayRating.defense + 15) * 0.08 * homeMult);
  const awayXG = Math.max(0.3, (awayRating.attack - homeRating.defense + 12) * 0.07 * awayMult);

  // Poisson-like distribution for goals
  const generateGoals = (lambda: number) => {
    let goals = 0;
    let p = 1.0;
    const L = Math.exp(-lambda);
    do {
      goals++;
      p *= Math.random();
    } while (p > L && goals < 9);
    return goals - 1;
  };

  const homeScore = generateGoals(homeXG);
  const awayScore = generateGoals(awayXG);

  // Possession calculation
  const midfieldDiff = homeRating.midfield - awayRating.midfield;
  const homePossession = Math.max(35, Math.min(68, Math.round(50 + midfieldDiff * 1.5 + (homeTeam.tacticalStyle === 'POSSE' ? 4 : 0))));
  const awayPossession = 100 - homePossession;

  // Shots stats
  const homeShots = Math.max(homeScore + 2, Math.round(homeXG * 4.5 + Math.random() * 5));
  const awayShots = Math.max(awayScore + 1, Math.round(awayXG * 4.2 + Math.random() * 5));
  const homeShotsOnTarget = Math.max(homeScore, Math.round(homeShots * 0.45));
  const awayShotsOnTarget = Math.max(awayScore, Math.round(awayShots * 0.42));

  const stats: MatchStats = {
    possessionHome: homePossession,
    possessionAway: awayPossession,
    shotsHome: homeShots,
    shotsAway: awayShots,
    shotsOnTargetHome: homeShotsOnTarget,
    shotsOnTargetAway: awayShotsOnTarget,
    cornersHome: Math.floor(Math.random() * 8) + 2,
    cornersAway: Math.floor(Math.random() * 7) + 1,
    foulsHome: Math.floor(Math.random() * 12) + 6,
    foulsAway: Math.floor(Math.random() * 12) + 7,
    xGHome: Number(homeXG.toFixed(2)),
    xGAway: Number(awayXG.toFixed(2)),
  };

  // Generate goal and card events
  const events: MatchEvent[] = [];
  const homeStarters = homeTeam.players.filter((p) => homeTeam.lineupIds.includes(p.id));
  const awayStarters = awayTeam.players.filter((p) => awayTeam.lineupIds.includes(p.id));

  const getRandomScorer = (starters: Player[]) => {
    // Attackers have 60% chance, mids 30%, defs 10%
    const r = Math.random();
    let candidates = starters.filter((p) => ['ATA', 'PE', 'PD'].includes(p.position));
    if (r > 0.6 || candidates.length === 0) {
      candidates = starters.filter((p) => ['MEI', 'MC', 'VOL'].includes(p.position));
    }
    if (r > 0.9 || candidates.length === 0) {
      candidates = starters.filter((p) => ['ZAG', 'LE', 'LD'].includes(p.position));
    }
    return candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : starters[0];
  };

  // Home goals
  for (let i = 0; i < homeScore; i++) {
    const min = Math.floor(Math.random() * 88) + 2;
    const scorer = getRandomScorer(homeStarters);
    events.push({
      minute: min,
      type: 'GOAL',
      teamId: homeTeam.id,
      playerId: scorer.id,
      playerName: scorer.commonName,
      description: `GOL DO ${homeTeam.shortName.toUpperCase()}! ${scorer.commonName} finaliza com categoria para o fundo das redes!`,
    });
  }

  // Away goals
  for (let i = 0; i < awayScore; i++) {
    const min = Math.floor(Math.random() * 88) + 2;
    const scorer = getRandomScorer(awayStarters);
    events.push({
      minute: min,
      type: 'GOAL',
      teamId: awayTeam.id,
      playerId: scorer.id,
      playerName: scorer.commonName,
      description: `GOL DO ${awayTeam.shortName.toUpperCase()}! ${scorer.commonName} aproveita a jogada e marca um belo gol!`,
    });
  }

  // Cards
  if (Math.random() > 0.4) {
    const min = Math.floor(Math.random() * 85) + 5;
    const player = homeStarters[Math.floor(Math.random() * homeStarters.length)];
    if (player) {
      events.push({
        minute: min,
        type: 'YELLOW',
        teamId: homeTeam.id,
        playerId: player.id,
        playerName: player.commonName,
        description: `Cartão amarelo para ${player.commonName} por falta dura.`,
      });
    }
  }

  if (Math.random() > 0.4) {
    const min = Math.floor(Math.random() * 85) + 5;
    const player = awayStarters[Math.floor(Math.random() * awayStarters.length)];
    if (player) {
      events.push({
        minute: min,
        type: 'YELLOW',
        teamId: awayTeam.id,
        playerId: player.id,
        playerName: player.commonName,
        description: `Cartão amarelo para ${player.commonName} por reclamação com o árbitro.`,
      });
    }
  }

  events.sort((a, b) => a.minute - b.minute);

  // Update players stats
  const updatedHomePlayers = homeTeam.players.map((p) => {
    const isStarter = homeTeam.lineupIds.includes(p.id);
    const goalsCount = events.filter((e) => e.type === 'GOAL' && e.playerId === p.id).length;
    const yellows = events.filter((e) => e.type === 'YELLOW' && e.playerId === p.id).length;
    return {
      ...p,
      goals: p.goals + goalsCount,
      yellowCards: p.yellowCards + yellows,
      matchesPlayed: isStarter ? p.matchesPlayed + 1 : p.matchesPlayed,
      stamina: isStarter ? Math.max(50, p.stamina - (12 + Math.floor(Math.random() * 8))) : Math.min(100, p.stamina + 10),
    };
  });

  const updatedAwayPlayers = awayTeam.players.map((p) => {
    const isStarter = awayTeam.lineupIds.includes(p.id);
    const goalsCount = events.filter((e) => e.type === 'GOAL' && e.playerId === p.id).length;
    const yellows = events.filter((e) => e.type === 'YELLOW' && e.playerId === p.id).length;
    return {
      ...p,
      goals: p.goals + goalsCount,
      yellowCards: p.yellowCards + yellows,
      matchesPlayed: isStarter ? p.matchesPlayed + 1 : p.matchesPlayed,
      stamina: isStarter ? Math.max(50, p.stamina - (12 + Math.floor(Math.random() * 8))) : Math.min(100, p.stamina + 10),
    };
  });

  const updatedMatch: Match = {
    ...match,
    homeScore,
    awayScore,
    played: true,
    stats,
    events,
  };

  return {
    match: updatedMatch,
    updatedHomeTeam: { ...homeTeam, players: updatedHomePlayers },
    updatedAwayTeam: { ...awayTeam, players: updatedAwayPlayers },
  };
}

export function updateStandingsWithMatch(standings: Standing[], match: Match): Standing[] {
  if (match.homeScore === null || match.awayScore === null) return standings;

  const isHomeWin = match.homeScore > match.awayScore;
  const isAwayWin = match.awayScore > match.homeScore;
  const isDraw = match.homeScore === match.awayScore;

  return standings
    .map((item) => {
      if (item.teamId === match.homeTeamId) {
        return {
          ...item,
          played: item.played + 1,
          won: item.won + (isHomeWin ? 1 : 0),
          drawn: item.drawn + (isDraw ? 1 : 0),
          lost: item.lost + (isAwayWin ? 1 : 0),
          goalsFor: item.goalsFor + match.homeScore!,
          goalsAgainst: item.goalsAgainst + match.awayScore!,
          goalDifference: item.goalDifference + (match.homeScore! - match.awayScore!),
          points: item.points + (isHomeWin ? 3 : isDraw ? 1 : 0),
          form: [(isHomeWin ? 'V' : isDraw ? 'E' : 'D') as 'V' | 'E' | 'D', ...item.form].slice(0, 5),
        };
      }
      if (item.teamId === match.awayTeamId) {
        return {
          ...item,
          played: item.played + 1,
          won: item.won + (isAwayWin ? 1 : 0),
          drawn: item.drawn + (isDraw ? 1 : 0),
          lost: item.lost + (isHomeWin ? 1 : 0),
          goalsFor: item.goalsFor + match.awayScore!,
          goalsAgainst: item.goalsAgainst + match.homeScore!,
          goalDifference: item.goalDifference + (match.awayScore! - match.homeScore!),
          points: item.points + (isAwayWin ? 3 : isDraw ? 1 : 0),
          form: [(isAwayWin ? 'V' : isDraw ? 'E' : 'D') as 'V' | 'E' | 'D', ...item.form].slice(0, 5),
        };
      }
      return item;
    })
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.won !== a.won) return b.won - a.won;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
}
