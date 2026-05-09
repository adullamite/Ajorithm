import React, { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Link } from 'react-router-dom';
import {
  User, Trophy, Award, Star, TrendingUp,
  CheckCircle, XCircle, Flame, ArrowRight
} from 'lucide-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Navigation } from '@/components/Navigation';
import { GlassCard } from '@/components/GlassCard';
import { PactChip } from '@/components/PactChip';
import { ProfileSkeleton } from '@/components/Skeleton';
import { useAjorithm, type PactState, type ReputationState } from '@/hooks/useAjorithm';

interface PactWithRep {
  pact: PactState;
  reputation: ReputationState | null;
}

function getReputationScore(rep: ReputationState): number {
  const total = rep.contributionsMade + rep.contributionsMissed;
  if (total === 0) return 100;
  return Math.round((rep.contributionsMade / total) * 100);
}

function getBadge(score: number): { label: string; color: string; glow: string } {
  if (score >= 95) return { label: 'Gold', color: 'text-yellow-400', glow: 'glow-gold' };
  if (score >= 80) return { label: 'Silver', color: 'text-gray-300', glow: 'glow-silver' };
  return { label: 'Bronze', color: 'text-orange-400', glow: 'glow-bronze' };
}

export default function ProfilePage() {
  const { publicKey, connected } = useWallet();
  const { fetchAllPacts, fetchReputation } = useAjorithm();
  const [loading, setLoading] = useState(true);
  const [pactData, setPactData] = useState<PactWithRep[]>([]);

  const loadProfile = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const allPacts = await fetchAllPacts();
      const myPacts = allPacts.filter((p) =>
        p.members.some((m) => m.toBase58() === publicKey.toBase58())
      );

      const withRep = await Promise.all(
        myPacts.map(async (pact) => {
          const reputation = await fetchReputation(publicKey, pact.publicKey);
          return { pact, reputation };
        })
      );

      setPactData(withRep);
    } catch { /* handle silently */ }
    setLoading(false);
  }, [publicKey, fetchAllPacts, fetchReputation]);

  useEffect(() => {
    if (connected) loadProfile();
  }, [connected, loadProfile]);

  const totalContributions = pactData.reduce(
    (sum, d) => sum + (d.reputation?.contributionsMade ?? 0),
    0
  );
  const totalMissed = pactData.reduce(
    (sum, d) => sum + (d.reputation?.contributionsMissed ?? 0),
    0
  );
  const bestStreak = pactData.reduce(
    (max, d) => Math.max(max, d.reputation?.streak ?? 0),
    0
  );
  const avgScore =
    pactData.length > 0
      ? Math.round(
          pactData.reduce(
            (sum, d) => sum + (d.reputation ? getReputationScore(d.reputation) : 100),
            0
          ) / pactData.length
        )
      : 100;

  const badge = getBadge(avgScore);

  if (!connected) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="lg:pl-64 pt-14 lg:pt-0 pb-20 lg:pb-0 flex items-center justify-center min-h-screen">
          <GlassCard className="text-center max-w-sm">
            <p className="text-foreground font-semibold mb-2">Connect your wallet</p>
            <p className="text-muted-foreground text-sm">
              Connect to view your profile and reputation.
            </p>
          </GlassCard>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="lg:pl-64 pt-14 lg:pt-0 pb-20 lg:pb-0">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">Profile</h1>

          {loading ? (
            <ProfileSkeleton />
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Identity Card */}
              <GlassCard className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center primary-glow">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-foreground text-xs font-mono break-all">
                    {publicKey?.toBase58()}
                  </p>
                  <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                    <PactChip label={`${pactData.length} Pact${pactData.length !== 1 ? 's' : ''}`} variant="active" />
                  </div>
                </div>
              </GlassCard>

              {/* Reputation Score */}
              <GlassCard>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-foreground font-semibold flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-secondary" />
                    Reputation Score
                  </h3>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${badge.glow}`}>
                    <Award className={`w-7 h-7 ${badge.color}`} />
                  </div>
                </div>

                <div className="text-center mb-6">
                  <p className="text-5xl font-bold text-foreground font-mono">{avgScore}</p>
                  <p className={`text-sm font-medium mt-1 ${badge.color}`}>{badge.label} Badge</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-muted/30 rounded-xl p-3 text-center">
                    <CheckCircle className="w-4 h-4 text-secondary mx-auto mb-1" />
                    <p className="text-foreground font-bold font-mono">{totalContributions}</p>
                    <p className="text-muted-foreground text-xs">Made</p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-3 text-center">
                    <XCircle className="w-4 h-4 text-destructive mx-auto mb-1" />
                    <p className="text-foreground font-bold font-mono">{totalMissed}</p>
                    <p className="text-muted-foreground text-xs">Missed</p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-3 text-center">
                    <Flame className="w-4 h-4 text-toast-warning mx-auto mb-1" />
                    <p className="text-foreground font-bold font-mono">{bestStreak}</p>
                    <p className="text-muted-foreground text-xs">Best Streak</p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-3 text-center">
                    <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-foreground font-bold font-mono">{pactData.length}</p>
                    <p className="text-muted-foreground text-xs">Pacts</p>
                  </div>
                </div>
              </GlassCard>

              {/* Pact History */}
              <GlassCard>
                <h3 className="text-foreground font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" />
                  Pact History
                </h3>
                {pactData.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    No pacts yet. Join or create one to get started.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {pactData.map(({ pact, reputation }) => {
                      const repScore = reputation ? getReputationScore(reputation) : 100;
                      const pool =
                        (pact.contributionAmount.toNumber() / LAMPORTS_PER_SOL) *
                        pact.currentMembers;
                      return (
                        <Link
                          key={pact.publicKey.toBase58()}
                          to={`/pact/${pact.publicKey.toBase58()}`}
                          className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors group"
                        >
                          <div>
                            <p className="text-foreground font-medium text-sm">{pact.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-muted-foreground font-mono">
                                {pool.toFixed(2)} SOL
                              </span>
                              <PactChip
                                label={pact.isActive ? 'Active' : 'Done'}
                                variant={pact.isActive ? 'active' : 'completed'}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-mono text-foreground">{repScore}%</span>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </GlassCard>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
