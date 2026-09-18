import { SERIE_A_TEAMS } from './serieA';
import { SERIE_B_TEAMS } from './serieB';
import { Team, Standing, Match, BoardObjective, NewsItem, CareerSave } from '../types/game';

export const ALL_TEAMS: Team[] = [...SERIE_A_TEAMS, ...SERIE_B_TEAMS];

export function getInitialStandings(teams: Team[], division: 'A' | 'B'): Standing[] {
  return teams
    .filter((t) => t.division === division)
    .map((team) => ({
      teamId: team.id,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      form: [],
    }));
}

// Generate realistic 38 rounds for Serie A and Serie B
export function generateLeagueFixtures(teams: Team[], competition: 'SERIE_A' | 'SERIE_B'): Match[] {
  const compTeams = teams.filter((t) => (competition === 'SERIE_A' ? t.division === 'A' : t.division === 'B'));
  const n = compTeams.length;
  if (n < 2) return [];

  const matches: Match[] = [];
  const teamIds = compTeams.map((t) => t.id);

  // Round-robin first half (rounds 1 to n-1)
  const rounds = n - 1;
  const half = n / 2;
  const rot = [...teamIds];

  for (let r = 1; r <= rounds; r++) {
    for (let i = 0; i < half; i++) {
      const home = rot[i];
      const away = rot[n - 1 - i];
      matches.push({
        id: `${competition}_R${r}_${home}_${away}`,
        round: r,
        competition,
        homeTeamId: r % 2 === 0 ? away : home,
        awayTeamId: r % 2 === 0 ? home : away,
        homeScore: null,
        awayScore: null,
        played: false,
        events: [],
      });
    }
    // Rotate array keeping first element fixed
    const last = rot.pop()!;
    rot.splice(1, 0, last);
  }

  // Second half (Return matches, reverse home/away, rounds n to (2n - 2))
  const firstHalfMatches = [...matches];
  firstHalfMatches.forEach((m) => {
    const returnRound = m.round + rounds;
    matches.push({
      id: `${competition}_R${returnRound}_${m.awayTeamId}_${m.homeTeamId}`,
      round: returnRound,
      competition,
      homeTeamId: m.awayTeamId,
      awayTeamId: m.homeTeamId,
      homeScore: null,
      awayScore: null,
      played: false,
      events: [],
    });
  });

  return matches;
}

export function generateCopaDoBrasilFixtures(serieATeams: Team[]): Match[] {
  // Top 16 clubs in Copa do Brasil Oitavas de Final
  const top16 = serieATeams.slice(0, 16);
  const matches: Match[] = [];

  for (let i = 0; i < 8; i++) {
    const home = top16[i].id;
    const away = top16[15 - i].id;

    // Ida (Round 10)
    matches.push({
      id: `CDB_OITAVAS_IDA_${i}`,
      round: 10,
      competition: 'COPA_DO_BRASIL',
      cupStage: 'OITAVAS',
      leg: 1,
      homeTeamId: home,
      awayTeamId: away,
      homeScore: null,
      awayScore: null,
      played: false,
      events: [],
    });

    // Volta (Round 15)
    matches.push({
      id: `CDB_OITAVAS_VOLTA_${i}`,
      round: 15,
      competition: 'COPA_DO_BRASIL',
      cupStage: 'OITAVAS',
      leg: 2,
      homeTeamId: away,
      awayTeamId: home,
      homeScore: null,
      awayScore: null,
      played: false,
      events: [],
    });
  }

  return matches;
}

export function generateInitialObjectives(team: Team): BoardObjective[] {
  const isGiant = team.expectedFinish <= 3;
  return [
    {
      id: 'obj_league',
      title: 'Meta no Brasileirão',
      description: isGiant
        ? 'Lutar pelo título brasileiro e garantir vaga direta na fase de grupos da Libertadores.'
        : `Terminar a temporada ao menos na ${team.expectedFinish}ª colocação ou superior.`,
      target: isGiant ? 'Terminar no G4' : `Top ${team.expectedFinish}`,
      progress: 0,
      completed: false,
      priority: 'ALTA',
      category: 'SUCESSO_NACIONAL',
    },
    {
      id: 'obj_cup',
      title: 'Campanha na Copa do Brasil',
      description: isGiant ? 'Atingir no mínimo as Semifinais da Copa do Brasil.' : 'Alcançar as Quartas de Final.',
      target: isGiant ? 'Semifinal' : 'Quartas de Final',
      progress: 0,
      completed: false,
      priority: 'MEDIA',
      category: 'SUCESSO_NACIONAL',
    },
    {
      id: 'obj_finance',
      title: 'Saúde Financeira',
      description: 'Manter a folha salarial dentro do teto estipulado e gerar superávit operacional.',
      target: 'Não estourar orçamento',
      progress: 85,
      completed: false,
      priority: 'ALTA',
      category: 'FINANCEIRO',
    },
    {
      id: 'obj_youth',
      title: 'Desenvolvimento de Jovens',
      description: 'Dar tempo de jogo a pelo menos 2 atletas sub-21 do elenco principal.',
      target: '2 promessas utilizadas',
      progress: 20,
      completed: false,
      priority: 'BAIXA',
      category: 'BASE',
    },
  ];
}

export function generateInitialNews(team: Team): NewsItem[] {
  return [
    {
      id: 'news_1',
      date: '18/09/2026',
      title: `Novo comandante: ${team.name} apresenta novo treinador para a temporada`,
      summary: `A diretoria e a torcida depositam grandes expectativas no projeto do novo técnico. O objetivo traçado é brigar no topo da tabela.`,
      category: 'DIRETORIA',
      teamId: team.id,
      important: true,
    },
    {
      id: 'news_2',
      date: '18/09/2026',
      title: 'Mercado da Bola em ebulição no futebol brasileiro',
      summary: 'Clubes das Séries A e B movimentam milhões na abertura da janela de transferências com grandes contratações internacionais.',
      category: 'TRANSFERENCIA',
      important: false,
    },
    {
      id: 'news_3',
      date: '17/09/2026',
      title: 'Brasileirão 2026 promete ser o mais disputado da história',
      summary: 'Com reforços estrelados e elencos recheados de estrelas mundiais, a nova temporada bate recordes de público e receitas.',
      category: 'CAMPEONATO',
      important: false,
    },
  ];
}

export function createInitialCareer(
  managerName = 'Professor',
  managerNationality = 'Brasil',
  selectedClubId = 'flamengo',
  ownerName = 'VH (vh0604918)'
): CareerSave {
  const team = ALL_TEAMS.find((t) => t.id === selectedClubId) || ALL_TEAMS[0];
  const serieAFixtures = generateLeagueFixtures(ALL_TEAMS, 'SERIE_A');
  const serieBFixtures = generateLeagueFixtures(ALL_TEAMS, 'SERIE_B');
  const cdbFixtures = generateCopaDoBrasilFixtures(ALL_TEAMS.filter((t) => t.division === 'A'));

  const allFixtures = [...serieAFixtures, ...serieBFixtures, ...cdbFixtures];

  return {
    id: `save_${Date.now()}`,
    ownerName,
    managerName,
    managerNationality,
    clubId: team.id,
    seasonYear: 2026,
    currentRound: 1,
    maxRounds: 38,
    boardConfidence: 82,
    managerReputation: 75,
    finances: {
      balance: team.budget * 0.4,
      transferBudget: team.budget,
      wageBudget: team.wageBudget,
      weeklyWageBill: Math.round(team.wageBudget * 0.8),
      matchdayRevenue: Math.round(team.stadiumCapacity * 65),
      sponsorWeekly: Math.round(team.budget * 0.012),
      merchandisingWeekly: Math.round(team.budget * 0.008),
      stadiumMaintenance: Math.round(team.stadiumCapacity * 12),
    },
    objectives: generateInitialObjectives(team),
    news: generateInitialNews(team),
    transferOffers: [],
    teams: JSON.parse(JSON.stringify(ALL_TEAMS)),
    seriesAStandings: getInitialStandings(ALL_TEAMS, 'A'),
    seriesBStandings: getInitialStandings(ALL_TEAMS, 'B'),
    fixtures: allFixtures,
    trophies: [],
    historyStats: {
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      trophiesCount: 0,
    },
  };
}
