import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  ArrowLeft, CircleDollarSign, Users, Repeat, Check,
  Clock, ArrowUpRight, Crown
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { GlassCard } from '@/components/GlassCard';
import { PactChip } from '@/components/PactChip';
import { BlinkCard } from '@/components/BlinkCard';
import { TransactionLoader } from '@/components/TransactionLoader';
import { PactDetailSkeleton } from '@/components/Skeleton';
import { useAjorithm, type PactState } from '@/hooks/useAjorithm';

export default function PactDetailPage() {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const { fetchPact, contribute, releasePayout, loading } = useAjorithm();
  const [pact, setPact] = useState<PactState | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [txSuccess, setTxSuccess] = useState(false);

  const loadPact = useCallback(async () => {
    if (!address) return;
    try {
      const pk = new PublicKey(address);
      const data = await fetchPact(pk);
      setPact(data);
    } catch { /* invalid address */ }
    setPageLoading(false);
  }, [address, fetchPact]);

  useEffect(() => {
    loadPact();
  }, [loadPact]);

  const isOrganizer = publicKey && pact && pact.organizer.toBase58() === publicKey.toBase58();
  const isMember = publicKey && pact && pact.members.some((m) => m.toBase58() === publicKey.toBase58());
  const pool = pact ? (pact.contributionAmount.toNumber() / LAMPORTS_PER_SOL) * pact.currentMembers : 0;
  const contribution = pact ? pact.contributionAmount.toNumber() / LAMPORTS_PER_SOL : 0;

  const handleContribute = async () => {
    if (!pact) return;
    const tx = await contribute(pact.publicKey);
    if (tx) {
      setTxSuccess(true);
      setTimeout(() => { setTxSuccess(false); loadPact(); }, 2000);
    }
  };

  const handleReleasePayout = async () => {
    if (!pact || pact.currentRound >= pact.payoutOrder.length) return;
    const recipient = pact.payoutOrder[pact.currentRound];
    const tx = await releasePayout(pact.publicKey, recipient);
    if (tx) {
      setTxSuccess(true);
      setTimeout(() => { setTxSuccess(false); loadPact(); }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <TransactionLoader isLoading={loading} isSuccess={txSuccess} />

      <main className="lg:pl-64 pt-14 lg:pt-0 pb-20 lg:pb-0">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {pageLoading ? (
            <PactDetailSkeleton />
          ) : !pact ? (
            <GlassCard className="text-center py-12">
              <p className="text-foreground font-semibold text-lg mb-2">Pact not found</p>
              <p className="text-muted-foreground text-sm">
                The pact address may be invalid or the account doesn't exist.
              </p>
            </GlassCard>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Header */}
              <GlassCard>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{pact.name}</h1>
                    <p className="text-muted-foreground text-xs font-mono mt-1">
                      {pact.publicKey.toBase58()}
                    </p>
                  </div>
                  <PactChip
                    label={pact.isActive ? 'Active' : 'Completed'}
                    variant={pact.isActive ? 'active' : 'completed'}
                    pulse={pact.isActive}
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-muted/30 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-2">
                      <CircleDollarSign className="w-3.5 h-3.5" />
                      Pool
                    </div>
                    <p className="text-foreground font-bold text-xl font-mono">{pool.toFixed(2)}</p>
                    <p className="text-muted-foreground text-xs">SOL</p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-2">
                      <CircleDollarSign className="w-3.5 h-3.5" />
                      Contribution
                    </div>
                    <p className="text-foreground font-bold text-xl font-mono">{contribution}</p>
                    <p className="text-muted-foreground text-xs">SOL per round</p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-2">
                      <Users className="w-3.5 h-3.5" />
                      Members
                    </div>
                    <p className="text-foreground font-bold text-xl">{pact.currentMembers}/{pact.maxMembers}</p>
                    <p className="text-muted-foreground text-xs">joined</p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-2">
                      <Repeat className="w-3.5 h-3.5" />
                      Round
                    </div>
                    <p className="text-foreground font-bold text-xl">{pact.currentRound}/{pact.totalRounds}</p>
                    <p className="text-muted-foreground text-xs">completed</p>
                  </div>
                </div>
              </GlassCard>

              {/* Actions */}
              {pact.isActive && (
                <div className="flex flex-col sm:flex-row gap-3">
                  {isMember && (
                    <button
                      onClick={handleContribute}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-secondary/15 text-secondary font-semibold text-sm hover:bg-secondary/20 transition-all disabled:opacity-50 neon-glow"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      Contribute {contribution} SOL
                    </button>
                  )}
                  {isOrganizer && pact.currentRound < pact.totalRounds && (
                    <button
                      onClick={handleReleasePayout}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary/15 text-primary font-semibold text-sm hover:bg-primary/20 transition-all disabled:opacity-50 primary-glow"
                    >
                      <CircleDollarSign className="w-4 h-4" />
                      Release Payout
                    </button>
                  )}
                </div>
              )}

              {/* Members List */}
              <GlassCard>
                <h3 className="text-foreground font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Members
                </h3>
                <div className="space-y-2">
                  {pact.members.map((member, i) => {
                    const addr = member.toBase58();
                    const isOrganizerMember = addr === pact.organizer.toBase58();
                    const isCurrentRecipient =
                      pact.currentRound < pact.payoutOrder.length &&
                      addr === pact.payoutOrder[pact.currentRound].toBase58();

                    return (
                      <div
                        key={addr}
                        className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">
                              {addr.slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="text-foreground text-sm font-mono">
                              {addr.slice(0, 6)}...{addr.slice(-4)}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {isOrganizerMember && (
                                <span className="text-[10px] text-primary flex items-center gap-1">
                                  <Crown className="w-3 h-3" /> Organizer
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {isCurrentRecipient && (
                          <PactChip label="Next Payout" variant="active" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Rotation Queue / Timeline */}
              <GlassCard>
                <h3 className="text-foreground font-semibold mb-4 flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-secondary" />
                  Contribution Timeline
                </h3>
                <div className="relative pl-6">
                  {pact.payoutOrder.map((recipient, round) => {
                    const addr = recipient.toBase58();
                    const isCompleted = round < pact.currentRound;
                    const isCurrent = round === pact.currentRound;

                    return (
                      <div key={round} className="relative pb-6 last:pb-0">
                        {/* Vertical line */}
                        {round < pact.payoutOrder.length - 1 && (
                          <div
                            className={`absolute left-[-12px] top-6 w-px h-full ${
                              isCompleted ? 'bg-secondary' : 'bg-border'
                            }`}
                          />
                        )}
                        {/* Dot */}
                        <div
                          className={`absolute left-[-16px] top-1.5 w-2.5 h-2.5 rounded-full border-2 ${
                            isCompleted
                              ? 'bg-secondary border-secondary'
                              : isCurrent
                              ? 'bg-primary border-primary animate-pulse'
                              : 'bg-muted border-border'
                          }`}
                        />

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-foreground font-medium">Round {round + 1}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {addr.slice(0, 6)}...{addr.slice(-4)}
                            </p>
                          </div>
                          {isCompleted && (
                            <div className="flex items-center gap-1 text-secondary text-xs">
                              <Check className="w-3.5 h-3.5" />
                              Paid
                            </div>
                          )}
                          {isCurrent && (
                            <div className="flex items-center gap-1 text-primary text-xs">
                              <Clock className="w-3.5 h-3.5" />
                              Current
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Blink Card */}
              <BlinkCard pact={pact} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
