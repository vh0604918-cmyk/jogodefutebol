export type PlayerPosition = 
  | 'GOL' // Goleiro
  | 'ZAG' // Zagueiro
  | 'LD'  // Lateral Direito
  | 'LE'  // Lateral Esquerdo
  | 'VOL' // Volante
  | 'MC'  // Meio-Campo Central
  | 'MEI' // Meia Ofensivo
  | 'PE'  // Ponta Esquerda
  | 'PD'  // Ponta Direita
  | 'ATA'; // Atacante / Centroavante

export interface PlayerStats {
  pace: number;        // Ritmo (PAC)
  shooting: number;    // Finalização (SHO)
  passing: number;     // Passe (PAS)
  dribbling: number;   // Drible (DRI)
  defense: number;     // Defesa (DEF)
  physical: number;    // Físico (PHY)
}

export interface Player {
  id: string;
  name: string;
  commonName: string;
  number: number;
  position: PlayerPosition;
  secondaryPosition?: PlayerPosition;
  age: number;
  nationality: string;
  overall: number;       // OVR
  potential: number;     // Potencial
  stats: PlayerStats;
  stamina: number;       // 0 - 100
  morale: number;        // 0 - 100
  form: number;          // 1 - 10
  value: number;         // R$
  wage: number;          // R$ / mês
  contractYears: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  matchesPlayed: number;
  isInjured?: boolean;
  injuryWeeks?: number;
  developmentPlan?: 'EQUILIBRADO' | 'FINALIZACAO' | 'VELOCIDADE' | 'CRIATIVIDADE' | 'DEFESA' | 'FISICO';
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  division: 'A' | 'B';
  city: string;
  state: string;
  stadium: string;
  stadiumCapacity: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  badgeInitials: string;
  badgeStyle: 'stripes' | 'cross' | 'diagonal' | 'stars' | 'shield';
  budget: number;       // Orçamento de transferências
  wageBudget: number;   // Folha salarial disponível
  formation: string;    // '4-3-3' | '4-2-3-1' | '4-4-2' | '3-5-2'
  tacticalStyle: 'POSSE' | 'CONTRA_ATAQUE' | 'PRESSAO_ALTA' | 'EQUILIBRADO' | 'RETRANCA';
  mentality: 'ULTRA_DEF' | 'DEF' | 'BALANCED' | 'ATTACK' | 'ULTRA_ATTACK';
  players: Player[];
  lineupIds: string[];  // 11 jogadores titulares (índices 0 a 10)
  benchIds: string[];   // 7-9 jogadores reservas
  expectedFinish: number; // Expectativa da diretoria na liga (1 = campeão, etc)
}

export interface Standing {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('V' | 'E' | 'D')[];
}

export interface MatchEvent {
  minute: number;
  type: 'GOAL' | 'YELLOW' | 'RED' | 'SUB' | 'CHANCE' | 'PENALTY_GOAL' | 'PENALTY_MISS';
  teamId: string;
  playerId: string;
  playerName: string;
  assistPlayerId?: string;
  assistPlayerName?: string;
  description: string;
}

export interface MatchStats {
  possessionHome: number; // 0-100%
  possessionAway: number;
  shotsHome: number;
  shotsAway: number;
  shotsOnTargetHome: number;
  shotsOnTargetAway: number;
  cornersHome: number;
  cornersAway: number;
  foulsHome: number;
  foulsAway: number;
  xGHome: number;
  xGAway: number;
}

export interface Match {
  id: string;
  round: number;
  competition: 'SERIE_A' | 'SERIE_B' | 'COPA_DO_BRASIL' | 'LIBERTADORES';
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  played: boolean;
  events: MatchEvent[];
  stats?: MatchStats;
  cupStage?: 'OITAVAS' | 'QUARTAS' | 'SEMI' | 'FINAL';
  leg?: 1 | 2;
  aggregateHome?: number;
  aggregateAway?: number;
  penaltiesHome?: number;
  penaltiesAway?: number;
}

export interface TransferOffer {
  id: string;
  playerId: string;
  fromTeamId: string;
  toTeamId: string;
  offeredValue: number;
  offeredWage: number;
  date: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED';
  counterValue?: number;
}

export interface NewsItem {
  id: string;
  date: string;
  title: string;
  summary: string;
  category: 'TRANSFERENCIA' | 'PARTIDA' | 'DIRETORIA' | 'LESAO' | 'CAMPEONATO';
  teamId?: string;
  important?: boolean;
}

export interface BoardObjective {
  id: string;
  title: string;
  description: string;
  target: string;
  progress: number; // 0-100
  completed: boolean;
  priority: 'ALTA' | 'MEDIA' | 'BAIXA';
  category: 'SUCESSO_NACIONAL' | 'FINANCEIRO' | 'BASE' | 'CONTINENTAL';
}

export interface ClubFinances {
  balance: number;
  transferBudget: number;
  wageBudget: number;
  weeklyWageBill: number;
  matchdayRevenue: number;
  sponsorWeekly: number;
  merchandisingWeekly: number;
  stadiumMaintenance: number;
}

export interface CareerSave {
  id: string;
  ownerName: string; // Dono do Jogo
  managerName: string;
  managerNationality: string;
  clubId: string;
  seasonYear: number;
  currentRound: number;
  maxRounds: number;
  boardConfidence: number; // 0-100
  managerReputation: number; // 1-100
  finances: ClubFinances;
  objectives: BoardObjective[];
  news: NewsItem[];
  transferOffers: TransferOffer[];
  teams: Team[];
  seriesAStandings: Standing[];
  seriesBStandings: Standing[];
  fixtures: Match[];
  trophies: { competition: string; year: number }[];
  historyStats: {
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    trophiesCount: number;
  };
}
