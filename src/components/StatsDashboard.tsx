import React, { useEffect, useState, useRef, useMemo } from 'react';
import { CircleDollarSign, Users, FileText, Activity, Zap, RefreshCw } from 'lucide-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { GlassCard } from './GlassCard';
import { cn } from '@/lib/utils';
import type { PactState } from '@/hooks/useAjorithm';

interface StatsDashboardProps {
  pacts: PactState[];
  loading: boolean;
  lastRefresh: Date | null;
}

/* ── animated counter hook (smoothly transitions between values) ── */
function useAnimatedNumber(target: number, duration = 1400, decimals = 0) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;

    startRef.current = null;

    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (target - from) * eased;
      setDisplay(parseFloat(current.toFixed(decimals)));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = target;
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, decimals]);

  return display;
}

/* ── delta badge: shows +/- change after refresh ── */
function DeltaBadge({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;
  if (diff === 0 || previous === 0) return null;

  const isPositive = diff > 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md animate-scale-in',
        isPositive
          ? 'bg-secondary/15 text-secondary'
          : 'bg-destructive/15 text-destructive'
      )}
    >
      {isPositive ? '+' : ''}
      {Number.isInteger(diff) ? diff : diff.toFixed(2)}
    </span>
  );
}

/* ── mini sparkline ── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 120;
  const h = 32;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} className="overflow-visible opacity-60">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.length > 0 && (
        <circle
          cx={(data.length - 1) / (data.length - 1) * w}
          cy={h - ((data[data.length - 1] - min) / range) * h}
          r="3"
          fill={color}
          className="animate-pulse"
        />
      )}
    </svg>
  );
}

/* ── ring progress ── */
function RingProgress({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - pct * circ;

  return (
    <svg width="72" height="72" className="transform -rotate-90">
      <circle cx="36" cy="36" r={r} fill="none" stroke="hsl(var(--muted)/0.3)" strokeWidth="5" />
      <circle
        cx="36" cy="36" r={r} fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
}

/* ── countdown ring ── */
function CountdownRing({ lastRefresh }: { lastRefresh: Date | null }) {
  const [elapsed, setElapsed] = useState(0);
  const INTERVAL = 30;

  useEffect(() => {
    if (!lastRefresh) return;
    const tick = () => {
      const secs = Math.floor((Date.now() - lastRefresh.getTime()) / 1000);
      setElapsed(Math.min(secs, INTERVAL));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastRefresh]);

  const remaining = INTERVAL - elapsed;
  const pct = elapsed / INTERVAL;
  const r = 8;
  const circ = 2 * Math.PI * r;
  const offset = circ - pct * circ;

  return (
    <div className="flex items-center gap-1.5">
      <svg width="20" height="20" className="transform -rotate-90">
        <circle cx="10" cy="10" r={r} fill="none" stroke="hsl(var(--muted)/0.3)" strokeWidth="2" />
        <circle
          cx="10" cy="10" r={r} fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>
      <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
        {remaining}s
      </span>
    </div>
  );
}

export function StatsDashboard({ pacts, loading, lastRefresh }: StatsDashboardProps) {
  /* track previous values for delta badges */
  const prevRef = useRef({ tvl: 0, totalPacts: 0, uniqueMembers: 0, rounds: 0 });

  /* derive stats */
  const tvl = pacts.reduce(
    (sum, p) => sum + (p.contributionAmount.toNumber() / LAMPORTS_PER_SOL) * p.currentMembers,
    0
  );
  const totalPacts = pacts.length;
  const activePacts = pacts.filter((p) => p.isActive).length;
  const uniqueMembers = new Set(pacts.flatMap((p) => p.members.map((m) => m.toBase58()))).size;
  const totalRoundsCompleted = pacts.reduce((s, p) => s + p.currentRound, 0);
  const avgMembers =
    totalPacts > 0
      ? parseFloat((pacts.reduce((s, p) => s + p.currentMembers, 0) / totalPacts).toFixed(1))
      : 0;

  /* snapshot previous on each pact change */
  const prev = prevRef.current;
  useEffect(() => {
    // update prev AFTER render so delta badges show correctly
    const timer = setTimeout(() => {
      prevRef.current = { tvl, totalPacts, uniqueMembers, rounds: totalRoundsCompleted };
    }, 1800); // after counter animation
    return () => clearTimeout(timer);
  }, [tvl, totalPacts, uniqueMembers, totalRoundsCompleted]);

  /* animated values (now smoothly transitions between old→new) */
  const animTVL = useAnimatedNumber(tvl, 1600, 2);
  const animPacts = useAnimatedNumber(totalPacts, 1200);
  const animMembers = useAnimatedNumber(uniqueMembers, 1400);
  const animRounds = useAnimatedNumber(totalRoundsCompleted, 1000);
  const animAvg = useAnimatedNumber(avgMembers, 1100, 1);

  /* sparkline data */
  const tvlSparkline = useMemo(
    () =>
      pacts.map((_, i) =>
        pacts
          .slice(0, i + 1)
          .reduce(
            (s, p) => s + (p.contributionAmount.toNumber() / LAMPORTS_PER_SOL) * p.currentMembers,
            0
          )
      ),
    [pacts]
  );
  const memberSparkline = useMemo(
    () =>
      pacts.map(
        (_, i) =>
          new Set(
            pacts.slice(0, i + 1).flatMap((p) => p.members.map((m) => m.toBase58()))
          ).size
      ),
    [pacts]
  );

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass rounded-lg p-5 space-y-3">
            <div className="h-3 w-16 rounded bg-muted/50 skeleton-pulse" />
            <div className="h-8 w-24 rounded bg-muted/50 skeleton-pulse" />
            <div className="h-4 w-full rounded bg-muted/50 skeleton-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-8 animate-fade-in">
      {/* Primary stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* TVL */}
        <GlassCard className="relative overflow-hidden group p-5">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-colors duration-500" />
          <div className="relative">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-2">
              <CircleDollarSign className="w-3.5 h-3.5 text-secondary" />
              Total Value Locked
            </div>
            <div className="flex items-center gap-2">
              <p className="text-2xl lg:text-3xl font-bold text-foreground font-mono tracking-tight">
                {animTVL.toFixed(2)}
              </p>
              <DeltaBadge current={tvl} previous={prev.tvl} />
            </div>
            <p className="text-secondary text-xs font-medium mt-1">SOL</p>
            <div className="mt-3">
              <Sparkline data={tvlSparkline.length > 1 ? tvlSparkline : [0, 0]} color="hsl(155, 70%, 59%)" />
            </div>
          </div>
        </GlassCard>

        {/* Total Pacts */}
        <GlassCard className="relative overflow-hidden group p-5">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
          <div className="relative">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-2">
              <FileText className="w-3.5 h-3.5 text-primary" />
              Total Pacts
            </div>
            <div className="flex items-end gap-3">
              <div className="flex items-center gap-2">
                <p className="text-2xl lg:text-3xl font-bold text-foreground font-mono tracking-tight">
                  {animPacts}
                </p>
                <DeltaBadge current={totalPacts} previous={prev.totalPacts} />
              </div>
              <div className="mb-1">
                <RingProgress value={activePacts} max={totalPacts} color="hsl(155, 70%, 59%)" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-secondary text-xs font-medium">{activePacts} active</span>
              <span className="text-muted-foreground text-xs">{totalPacts - activePacts} completed</span>
            </div>
          </div>
        </GlassCard>

        {/* Active Members */}
        <GlassCard className="relative overflow-hidden group p-5">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-neon/5 rounded-full blur-2xl group-hover:bg-neon/10 transition-colors duration-500" />
          <div className="relative">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-2">
              <Users className="w-3.5 h-3.5 text-neon" />
              Unique Members
            </div>
            <div className="flex items-center gap-2">
              <p className="text-2xl lg:text-3xl font-bold text-foreground font-mono tracking-tight">
                {animMembers}
              </p>
              <DeltaBadge current={uniqueMembers} previous={prev.uniqueMembers} />
            </div>
            <p className="text-neon text-xs font-medium mt-1">wallets</p>
            <div className="mt-3">
              <Sparkline data={memberSparkline.length > 1 ? memberSparkline : [0, 0]} color="hsl(155, 95%, 51%)" />
            </div>
          </div>
        </GlassCard>

        {/* Rounds Completed */}
        <GlassCard className="relative overflow-hidden group p-5">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-toast-warning/5 rounded-full blur-2xl group-hover:bg-toast-warning/10 transition-colors duration-500" />
          <div className="relative">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-2">
              <Zap className="w-3.5 h-3.5 text-toast-warning" />
              Rounds Completed
            </div>
            <div className="flex items-center gap-2">
              <p className="text-2xl lg:text-3xl font-bold text-foreground font-mono tracking-tight">
                {animRounds}
              </p>
              <DeltaBadge current={totalRoundsCompleted} previous={prev.rounds} />
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <Activity className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground text-xs">
                {animAvg} avg members/pact
              </span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Live indicator strip with countdown */}
      <div className="flex items-center gap-2 px-1">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
        </span>
        <span className="text-xs text-muted-foreground">
          Live on Solana Devnet
        </span>

        <div className="ml-auto flex items-center gap-3">
          {lastRefresh && (
            <>
              <div className="flex items-center gap-1 text-muted-foreground/60">
                <RefreshCw className="w-3 h-3" />
                <span className="text-[10px] font-mono">auto</span>
              </div>
              <CountdownRing lastRefresh={lastRefresh} />
            </>
          )}
          {totalPacts > 0 && (
            <span className="text-xs text-muted-foreground/50 font-mono">
              {totalPacts} pact{totalPacts !== 1 ? 's' : ''} indexed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
