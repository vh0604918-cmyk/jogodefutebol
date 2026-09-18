import React, { useState, useEffect } from 'react';
import { CareerSave, Match, Team } from './types/game';
import { ALL_TEAMS, createInitialCareer } from './data/initialData';
import { simulateMatchResult, updateStandingsWithMatch } from './utils/simulation';
import { sound } from './utils/audio';
import { Crown } from 'lucide-react';

// Components
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { TacticsView } from './components/TacticsView';
import { TransfersView } from './components/TransfersView';
import { TrainingView } from './components/TrainingView';
import { CompetitionsView } from './components/CompetitionsView';
import { FinancesView } from './components/FinancesView';
import { MatchDayModal } from './components/MatchDayModal';
import { ClubSelectModal } from './components/ClubSelectModal';
import { OwnerEditModal } from './components/OwnerEditModal';

const STORAGE_KEY = 'fcbrasil26_save_v1';

export default function App() {
  const [career, setCareer] = useState<CareerSave>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.ownerName) {
          parsed.ownerName = 'VH (vh0604918)';
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading save', e);
    }
    return createInitialCareer('Prof. Abel Ferreira', 'Brasil', 'palmeiras', 'VH (vh0604918)');
  });

  const [activeTab, setActiveTab] = useState<TabType>('DASHBOARD');
  const [interactiveMatch, setInteractiveMatch] = useState<Match | null>(null);
  const [isClubSelectOpen, setIsClubSelectOpen] = useState(false);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Auto-persist on career changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(career));
    } catch (e) {
      console.error('Error saving career', e);
    }
  }, [career]);

  const userTeam = career.teams.find((t) => t.id === career.clubId) || career.teams[0];

  // Starts a brand new career with chosen team
  const handleStartNewCareer = (teamId: string, managerName: string, ownerName: string) => {
    const newSave = createInitialCareer(managerName, 'Brasil', teamId, ownerName);
    setCareer(newSave);
    setIsClubSelectOpen(false);
    setActiveTab('DASHBOARD');
  };

  // Update Owner Name
  const handleUpdateOwnerName = (newName: string) => {
    setCareer((prev) => ({
      ...prev,
      ownerName: newName,
    }));
  };

  // Update Team (tactics, lineup, training)
  const handleUpdateTeam = (updatedTeam: Team) => {
    const updatedTeams = career.teams.map((t) => (t.id === updatedTeam.id ? updatedTeam : t));
    setCareer((prev) => ({
      ...prev,
      teams: updatedTeams,
    }));
  };

  // Helper to advance round and simulate all concurrent AI matches of this round
  const processRoundProgression = (
    currentMatches: Match[],
    userMatchResult: Match | null,
    teamsList: Team[]
  ) => {
    let newFixtures = [...currentMatches];
    let updatedTeams = [...teamsList];
    let newStandingsA = [...career.seriesAStandings];
    let newStandingsB = [...career.seriesBStandings];

    const currentRound = career.currentRound;

    // Simulate all unplayed matches of the current round
    const roundMatches = newFixtures.filter((m) => m.round === currentRound && !m.played);

    for (const match of roundMatches) {
      // If this was the user's match already simulated interactively
      if (userMatchResult && match.id === userMatchResult.id) {
        newFixtures = newFixtures.map((m) => (m.id === match.id ? userMatchResult : m));
        if (match.competition === 'SERIE_A') {
          newStandingsA = updateStandingsWithMatch(newStandingsA, userMatchResult);
        } else if (match.competition === 'SERIE_B') {
          newStandingsB = updateStandingsWithMatch(newStandingsB, userMatchResult);
        }
        continue;
      }

      // Simulate AI match
      const home = updatedTeams.find((t) => t.id === match.homeTeamId);
      const away = updatedTeams.find((t) => t.id === match.awayTeamId);

      if (home && away) {
        const simResult = simulateMatchResult(home, away, match);
        newFixtures = newFixtures.map((m) => (m.id === match.id ? simResult.match : m));

        updatedTeams = updatedTeams.map((t) => {
          if (t.id === home.id) return simResult.updatedHomeTeam;
          if (t.id === away.id) return simResult.updatedAwayTeam;
          return t;
        });

        if (match.competition === 'SERIE_A') {
          newStandingsA = updateStandingsWithMatch(newStandingsA, simResult.match);
        } else if (match.competition === 'SERIE_B') {
          newStandingsB = updateStandingsWithMatch(newStandingsB, simResult.match);
        }
      }
    }

    // Weekly Financial update
    const isHomeNext = userMatchResult?.homeTeamId === userTeam.id;
    const weeklyIncome =
      career.finances.sponsorWeekly +
      career.finances.merchandisingWeekly +
      (isHomeNext ? career.finances.matchdayRevenue : 0);
    const weeklyExpense = career.finances.weeklyWageBill + career.finances.stadiumMaintenance;
    const netCash = weeklyIncome - weeklyExpense;

    const newFinances = {
      ...career.finances,
      balance: career.finances.balance + netCash,
      transferBudget: Math.max(0, career.finances.transferBudget + Math.round(netCash * 0.4)),
    };

    // Random news generation
    const randomNews = [...career.news];
    if (userMatchResult) {
      const userWon =
        (userMatchResult.homeTeamId === userTeam.id && userMatchResult.homeScore! > userMatchResult.awayScore!) ||
        (userMatchResult.awayTeamId === userTeam.id && userMatchResult.awayScore! > userMatchResult.homeScore!);
      const isDraw = userMatchResult.homeScore === userMatchResult.awayScore;

      randomNews.unshift({
        id: `news_res_${Date.now()}`,
        date: `Rodada ${currentRound}`,
        title: userWon
          ? `VITÓRIA ESPETACULAR! ${userTeam.shortName} brilha em campo e conquista 3 pontos vitais!`
          : isDraw
          ? `JOGO EQUILIBRADO: ${userTeam.shortName} empata na ${currentRound}ª rodada!`
          : `TROPEÇO: ${userTeam.shortName} sofre revés na ${currentRound}ª rodada e diretoria cobra reação imediata.`,
        summary: `Placar final registrado: ${userMatchResult.homeScore} x ${userMatchResult.awayScore}. Torcida repercute atuação nas redes sociais.`,
        category: 'CAMPEONATO',
        important: true,
      });
    }

    // Advance Round
    const nextRound = Math.min(career.maxRounds, currentRound + 1);

    // Board confidence adjustment based on results
    let boardConfidence = career.boardConfidence;
    if (userMatchResult) {
      const userWon =
        (userMatchResult.homeTeamId === userTeam.id && userMatchResult.homeScore! > userMatchResult.awayScore!) ||
        (userMatchResult.awayTeamId === userTeam.id && userMatchResult.awayScore! > userMatchResult.homeScore!);
      const isDraw = userMatchResult.homeScore === userMatchResult.awayScore;

      if (userWon) boardConfidence = Math.min(100, boardConfidence + 3);
      else if (isDraw) boardConfidence = Math.max(30, boardConfidence - 1);
      else boardConfidence = Math.max(25, boardConfidence - 4);
    }

    setCareer((prev) => ({
      ...prev,
      currentRound: nextRound,
      teams: updatedTeams,
      fixtures: newFixtures,
      seriesAStandings: newStandingsA,
      seriesBStandings: newStandingsB,
      finances: newFinances,
      news: randomNews.slice(0, 15),
      boardConfidence,
    }));
  };

  // Quick Simulation Button handler
  const handleSimulateQuick = (match: Match) => {
    const home = career.teams.find((t) => t.id === match.homeTeamId)!;
    const away = career.teams.find((t) => t.id === match.awayTeamId)!;

    const sim = simulateMatchResult(home, away, match);
    sound.playWhistle('final');

    const updatedTeams = career.teams.map((t) => {
      if (t.id === home.id) return sim.updatedHomeTeam;
      if (t.id === away.id) return sim.updatedAwayTeam;
      return t;
    });

    processRoundProgression(career.fixtures, sim.match, updatedTeams);
  };

  // Interactive 2D match completion
  const handleFinishInteractiveMatch = (
    updatedMatch: Match,
    updatedHome: Team,
    updatedAway: Team
  ) => {
    const updatedTeams = career.teams.map((t) => {
      if (t.id === updatedHome.id) return updatedHome;
      if (t.id === updatedAway.id) return updatedAway;
      return t;
    });

    processRoundProgression(career.fixtures, updatedMatch, updatedTeams);
    setInteractiveMatch(null);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-neutral-950 antialiased">
      {/* Top Header */}
      <Header
        career={career}
        onNewCareer={() => setIsClubSelectOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const next = !soundEnabled;
          setSoundEnabled(next);
          sound.setEnabled(next);
        }}
        onOpenOwnerModal={() => setIsOwnerModalOpen(true)}
      />

      {/* Navigation Subheader Tabs */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        incomingOffersCount={career.transferOffers.filter((o) => o.status === 'PENDING').length}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 animate-fade-in">
        {activeTab === 'DASHBOARD' && (
          <DashboardView
            career={career}
            onPlayInteractive={(match) => setInteractiveMatch(match)}
            onSimulateQuick={handleSimulateQuick}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'TACTICS' && (
          <TacticsView team={userTeam} onUpdateTeam={handleUpdateTeam} />
        )}

        {activeTab === 'TRANSFERS' && (
          <TransfersView career={career} onUpdateCareer={setCareer} />
        )}

        {activeTab === 'TRAINING' && (
          <TrainingView team={userTeam} onUpdateTeam={handleUpdateTeam} />
        )}

        {activeTab === 'COMPETITIONS' && <CompetitionsView career={career} />}

        {activeTab === 'FINANCES' && (
          <FinancesView career={career} onUpdateCareer={setCareer} />
        )}
      </main>

      {/* Footer with Owner of the Game Credits */}
      <footer className="border-t border-neutral-900 bg-neutral-950/80 py-4 px-4 text-xs text-neutral-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-400">FC BRASIL 26</span>
            <span>•</span>
            <span className="text-neutral-500">Futebol Brasileiro & Modo Carreira</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-medium flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
              <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/40 shrink-0" />
              <span>Dono do Jogo Oficial:</span>
              <strong className="text-amber-300 font-bold">{career.ownerName || 'VH'}</strong>
            </span>
            <button
              onClick={() => setIsOwnerModalOpen(true)}
              className="text-[11px] text-neutral-400 hover:text-amber-300 underline cursor-pointer transition-colors"
            >
              (alterar)
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive 2D Match Day Modal */}
      {interactiveMatch && (
        <MatchDayModal
          match={interactiveMatch}
          careerTeams={career.teams}
          userClubId={career.clubId}
          onFinishMatch={handleFinishInteractiveMatch}
          onClose={() => setInteractiveMatch(null)}
        />
      )}

      {/* New Career / Select Club Modal */}
      <ClubSelectModal
        teams={ALL_TEAMS}
        isOpen={isClubSelectOpen}
        initialOwnerName={career.ownerName || 'VH (vh0604918)'}
        onSelectClub={handleStartNewCareer}
      />

      {/* Owner of the Game Edit Modal */}
      <OwnerEditModal
        isOpen={isOwnerModalOpen}
        currentOwnerName={career.ownerName || 'VH (vh0604918)'}
        onSave={handleUpdateOwnerName}
        onClose={() => setIsOwnerModalOpen(false)}
      />
    </div>
  );
}
