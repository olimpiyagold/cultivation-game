'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, Coins, AlertCircle } from 'lucide-react';
import { useGame } from '@/lib/game/context';
import { MIN_WAGER, MAX_WAGER, MAX_ACTIVE_WAGERS } from '@/lib/game/wagers';
import type { Wager } from '@/lib/game/context';

export function WagerView() {
  const { hero, leaderboard, wagers, placeWager, resolveExpiredWagers } = useGame();
  const [amount, setAmount] = useState(MIN_WAGER);
  const [prediction, setPrediction] = useState<'rise' | 'fall'>('rise');
  const [targetName, setTargetName] = useState('');
  const [targetScore, setTargetScore] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [tab, setTab] = useState<'place' | 'active'>('place');

  useEffect(() => { resolveExpiredWagers(); }, []);

  if (!hero) return null;

  const aiHeroes = leaderboard.filter(e => e.is_ai);
  const activeWagers = wagers.filter(w => w.status === 'active');
  const resolvedWagers = wagers.filter(w => w.status === 'resolved').slice(0, 5);
  const canPlace = activeWagers.length < MAX_ACTIVE_WAGERS && hero.gold >= amount;

  function selectTarget(name: string, score: number) {
    setTargetName(name);
    setTargetScore(score);
  }

  async function handlePlace() {
    if (!targetName || !canPlace) return;
    setPlacing(true);
    await placeWager(targetName, targetScore, amount, prediction);
    setTargetName('');
    setTargetScore(0);
    setPlacing(false);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="rounded-xl border border-gold/30 bg-gold/5 p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-xl">💰</div>
        <div>
          <p className="font-calligraphy font-semibold text-sm">Spirit Stone Exchange</p>
          <p className="text-xs text-muted-foreground">灵石赌坊 · Bet on rival cultivators</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className="text-sm font-bold text-amber-500">{hero.gold} 💎</p>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-1 p-0.5 bg-muted/30 rounded-lg">
        <button onClick={() => setTab('place')} className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${tab === 'place' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}>
          Place Bet
        </button>
        <button onClick={() => setTab('active')} className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${tab === 'active' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}>
          Active ({activeWagers.length}/{MAX_ACTIVE_WAGERS})
        </button>
      </div>

      {tab === 'place' && (
        <div className="flex flex-col gap-3">
          {/* Active wager limit notice */}
          {activeWagers.length >= MAX_ACTIVE_WAGERS && (
            <div className="rounded-lg border border-crimson/30 bg-crimson/5 p-2.5 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-crimson shrink-0" />
              <p className="text-xs text-crimson">Max {MAX_ACTIVE_WAGERS} active wagers. Resolve existing bets first.</p>
            </div>
          )}

          {/* Target selection */}
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-muted-foreground font-medium">Select Target Cultivator</p>
            <div className="flex flex-col gap-1.5">
              {aiHeroes.slice(0, 6).map(e => (
                <button
                  key={e.id}
                  onClick={() => selectTarget(e.hero_name, e.laziness_score)}
                  className={`flex items-center gap-2 rounded-lg border p-2.5 text-left transition-all ${
                    targetName === e.hero_name
                      ? 'border-gold/50 bg-gold/10'
                      : 'border-border bg-card/50 hover:border-border/80'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center text-xs font-bold text-muted-foreground">
                    {e.hero_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{e.hero_name}</p>
                    <p className="text-[10px] text-muted-foreground">{e.stage}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">Laziness</p>
                    <p className="text-xs font-bold text-amber-500">{e.laziness_score}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Prediction */}
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-muted-foreground font-medium">Prediction</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPrediction('rise')}
                className={`rounded-lg border p-2.5 flex items-center justify-center gap-2 transition-all ${
                  prediction === 'rise' ? 'border-jade/50 bg-jade/10 text-jade' : 'border-border text-muted-foreground hover:border-border/80'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Score Rises</span>
              </button>
              <button
                onClick={() => setPrediction('fall')}
                className={`rounded-lg border p-2.5 flex items-center justify-center gap-2 transition-all ${
                  prediction === 'fall' ? 'border-crimson/50 bg-crimson/10 text-crimson' : 'border-border text-muted-foreground hover:border-border/80'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span className="text-xs font-medium">Score Falls</span>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-medium">Wager Amount</p>
              <p className="text-xs text-amber-500 font-medium">{amount} 💎 → win {Math.floor(amount * 1.8)} 💎</p>
            </div>
            <input
              type="range"
              min={MIN_WAGER}
              max={Math.min(MAX_WAGER, hero.gold)}
              step={50}
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{MIN_WAGER} min</span>
              <span>{Math.min(MAX_WAGER, hero.gold)} max</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[50, 100, 250, 500].map(v => (
                <button
                  key={v}
                  onClick={() => setAmount(Math.min(v, Math.min(MAX_WAGER, hero.gold)))}
                  disabled={hero.gold < v}
                  className="py-1 rounded-md text-[10px] bg-muted/40 hover:bg-muted/70 disabled:opacity-30 transition-all font-medium"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Place button */}
          <button
            onClick={handlePlace}
            disabled={!targetName || !canPlace || placing}
            className="w-full py-2.5 rounded-lg bg-gold/20 border border-gold/40 text-amber-500 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gold/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {placing ? (
              <><Clock className="w-4 h-4 animate-spin" /> Placing...</>
            ) : (
              <><Coins className="w-4 h-4" /> Place Wager ({amount} stones)</>
            )}
          </button>
        </div>
      )}

      {tab === 'active' && (
        <div className="flex flex-col gap-2">
          {activeWagers.length === 0 && resolvedWagers.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">No wagers placed. The bold cultivator risks all.</p>
          )}
          {activeWagers.map(w => <WagerRow key={w.id} wager={w} />)}
          {resolvedWagers.length > 0 && (
            <>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-1">Resolved</p>
              {resolvedWagers.map(w => <WagerRow key={w.id} wager={w} />)}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function WagerRow({ wager }: { wager: Wager }) {
  const timeLeft = new Date(wager.resolves_at).getTime() - Date.now();
  const mins = Math.max(0, Math.floor(timeLeft / 60000));

  return (
    <div className={`rounded-lg border p-2.5 ${
      wager.status === 'active' ? 'border-border bg-card/50' :
      wager.outcome === 'win' ? 'border-jade/30 bg-jade/5' : 'border-crimson/20 bg-crimson/5'
    }`}>
      <div className="flex items-center gap-2">
        {wager.prediction === 'rise'
          ? <TrendingUp className={`w-4 h-4 shrink-0 ${wager.status === 'active' ? 'text-jade' : wager.outcome === 'win' ? 'text-jade' : 'text-crimson'}`} />
          : <TrendingDown className={`w-4 h-4 shrink-0 ${wager.status === 'active' ? 'text-crimson' : wager.outcome === 'win' ? 'text-jade' : 'text-crimson'}`} />}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{wager.target_hero_name}</p>
          <p className="text-[10px] text-muted-foreground">will {wager.prediction} · {wager.amount} staked</p>
        </div>
        {wager.status === 'active' ? (
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{mins}m</p>
            <p className="text-[10px] text-amber-500">+{Math.floor(wager.amount * 1.8)} if win</p>
          </div>
        ) : (
          <div className="text-right">
            {wager.outcome === 'win' ? (
              <p className="text-xs font-bold text-jade">+{wager.payout ?? 0} 💎</p>
            ) : (
              <p className="text-xs font-bold text-crimson">-{wager.amount} 💎</p>
            )}
            <p className="text-[10px] text-muted-foreground capitalize">{wager.outcome}</p>
          </div>
        )}
      </div>
    </div>
  );
}
