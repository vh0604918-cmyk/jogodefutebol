import { Player, PlayerPosition, PlayerStats } from '../types/game';

// Helper to compute stats from position and overall rating
export function createStats(pos: PlayerPosition, ovr: number): PlayerStats {
  const variation = (offset: number) => Math.min(99, Math.max(45, Math.round(ovr + offset + (Math.random() * 4 - 2))));

  switch (pos) {
    case 'GOL':
      return {
        pace: variation(-25),
        shooting: variation(-35),
        passing: variation(-15),
        dribbling: variation(-30),
        defense: variation(-15),
        physical: variation(0),
      };
    case 'ZAG':
      return {
        pace: variation(-12),
        shooting: variation(-28),
        passing: variation(-15),
        dribbling: variation(-20),
        defense: variation(3),
        physical: variation(5),
      };
    case 'LD':
    case 'LE':
      return {
        pace: variation(5),
        shooting: variation(-18),
        passing: variation(-2),
        dribbling: variation(0),
        defense: variation(-2),
        physical: variation(2),
      };
    case 'VOL':
      return {
        pace: variation(-8),
        shooting: variation(-12),
        passing: variation(0),
        dribbling: variation(-5),
        defense: variation(4),
        physical: variation(6),
      };
    case 'MC':
      return {
        pace: variation(-5),
        shooting: variation(-5),
        passing: variation(5),
        dribbling: variation(3),
        defense: variation(-5),
        physical: variation(0),
      };
    case 'MEI':
      return {
        pace: variation(2),
        shooting: variation(2),
        passing: variation(6),
        dribbling: variation(6),
        defense: variation(-20),
        physical: variation(-8),
      };
    case 'PE':
    case 'PD':
      return {
        pace: variation(8),
        shooting: variation(2),
        passing: variation(-2),
        dribbling: variation(7),
        defense: variation(-25),
        physical: variation(-6),
      };
    case 'ATA':
    default:
      return {
        pace: variation(3),
        shooting: variation(6),
        passing: variation(-6),
        dribbling: variation(2),
        defense: variation(-30),
        physical: variation(3),
      };
  }
}

export function createPlayer(
  id: string,
  name: string,
  commonName: string,
  pos: PlayerPosition,
  ovr: number,
  age: number,
  number: number,
  customStats?: Partial<PlayerStats>,
  potentialBonus = 3
): Player {
  const baseStats = createStats(pos, ovr);
  const stats: PlayerStats = {
    ...baseStats,
    ...(customStats || {}),
  };

  // Realistic Brazilian market valuation in R$
  const ageFactor = age < 23 ? 1.4 : age > 31 ? 0.6 : 1.0;
  const value = Math.round(Math.pow(ovr - 55, 2.5) * 8000 * ageFactor);
  const wage = Math.max(25000, Math.round((value * 0.015) / 12));

  return {
    id,
    name,
    commonName,
    number,
    position: pos,
    age,
    nationality: 'Brasil',
    overall: ovr,
    potential: Math.min(96, Math.max(ovr, ovr + (age < 23 ? potentialBonus + Math.floor(Math.random() * 5) : 1))),
    stats,
    stamina: 85 + Math.floor(Math.random() * 15),
    morale: 80 + Math.floor(Math.random() * 20),
    form: 7,
    value,
    wage,
    contractYears: 2 + Math.floor(Math.random() * 3),
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    matchesPlayed: 0,
  };
}
