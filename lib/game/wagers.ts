import type { Wager, LeaderboardEntry } from './types';

export function createWager(
  heroId: string,
  targetName: string,
  targetScore: number,
  amount: number,
  prediction: 'rise' | 'fall',
  ticksToResolve = 60,
): Omit<Wager, 'id'> {
  const resolvesAt = new Date(Date.now() + ticksToResolve * 10_000).toISOString();
  return {
    hero_id: heroId,
    target_hero_name: targetName,
    target_score_at_bet: targetScore,
    amount,
    prediction,
    status: 'active',
    placed_at: new Date().toISOString(),
    resolves_at: resolvesAt,
  };
}

export function resolveWager(wager: Wager, currentScore: number): { outcome: 'win' | 'loss'; payout: number } {
  const rose = currentScore > wager.target_score_at_bet;
  const fell = currentScore < wager.target_score_at_bet;
  const win = (wager.prediction === 'rise' && rose) || (wager.prediction === 'fall' && fell);
  return {
    outcome: win ? 'win' : 'loss',
    payout: win ? Math.floor(wager.amount * 1.8) : 0,
  };
}

// Simulate AI hero score drift: random walk ±5-15% each call
export function driftAIScore(score: number): number {
  const drift = Math.floor(score * (0.05 + Math.random() * 0.10));
  return Math.random() > 0.5 ? score + drift : Math.max(1, score - drift);
}

export const MAX_ACTIVE_WAGERS = 3;
export const MIN_WAGER = 50;
export const MAX_WAGER = 500;

export function getWagerOddsLabel(prediction: 'rise' | 'fall', targetName: string, locale: 'en'|'ru'|'zh'): string {
  const labels = {
    en: { rise: `${targetName} rises`, fall: `${targetName} falls` },
    ru: { rise: `${targetName} поднимется`, fall: `${targetName} упадёт` },
    zh: { rise: `${targetName}上升`, fall: `${targetName}下降` },
  };
  return labels[locale][prediction];
}
