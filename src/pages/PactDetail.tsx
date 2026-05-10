<<<<<<< HEAD
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
=======
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import GlassCard from "@/components/GlassCard";
import MaterialIcon from "@/components/MaterialIcon";
import PactChip from "@/components/PactChip";
import ContributionTimeline from "@/components/ContributionTimeline";
import ConfirmModal from "@/components/ConfirmModal";
import TransactionLoader from "@/components/TransactionLoader";
import BlinkCard from "@/components/BlinkCard";
import { PactDetailSkeleton } from "@/components/Skeleton";
import { truncateAddress, lamportsToSol } from "@/lib/constants";
import { useAjorithm, type PactAccount } from "@/hooks/useAjorithm";

const PactDetail: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const { publicKey, connected } = useWallet();
  const { fetchPact, contribute, releasePayout, joinPact, loading } = useAjorithm();

  const [pact, setPact] = useState<PactAccount | null>(null);
  const [loadingPact, setLoadingPact] = useState(true);
  const [showConfirm, setShowConfirm] = useState<"contribute" | "payout" | "join" | null>(null);
  const [txModal, setTxModal] = useState(false);
  const [txStatus, setTxStatus] = useState<"loading" | "success" | "error">("loading");
  const [txHash, setTxHash] = useState("");
  const [txMessage, setTxMessage] = useState("");

  const loadPact = useCallback(async () => {
    if (!address || !connected) return;
    setLoadingPact(true);
    try {
      const data = await fetchPact(address);
      setPact(data);
    } catch {
      // silent
    } finally {
      setLoadingPact(false);
    }
  }, [address, connected, fetchPact]);
>>>>>>> main

  useEffect(() => {
    loadPact();
  }, [loadPact]);

<<<<<<< HEAD
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
=======
  const isMember = pact?.members.some(
    (m) => m.toBase58() === publicKey?.toBase58()
  );
  const isOrganizer = pact?.organizer.toBase58() === publicKey?.toBase58();
  const contributionSol = pact ? lamportsToSol(Number(pact.contributionAmount)) : 0;
  const poolTotal = contributionSol * (pact?.currentMembers || 0);
  const currentRecipient = pact?.payoutOrder?.[pact.currentRound];
  const progress = pact && pact.totalRounds > 0
    ? (pact.currentRound / pact.totalRounds) * 100
    : 0;

  const handleAction = async (action: "contribute" | "payout" | "join") => {
    if (!address) return;
    setShowConfirm(null);
    setTxModal(true);
    setTxStatus("loading");
    try {
      let result;
      if (action === "contribute") {
        setTxMessage("Submitting your contribution...");
        result = await contribute(address);
      } else if (action === "payout") {
        if (!currentRecipient) throw new Error("No recipient");
        setTxMessage("Releasing payout...");
        result = await releasePayout(address, currentRecipient.toBase58());
      } else {
        setTxMessage("Joining pact...");
        result = await joinPact(address);
      }
      setTxHash(result.tx);
      setTxStatus("success");
      setTxMessage(
        action === "contribute"
          ? "Contribution submitted!"
          : action === "payout"
          ? "Payout released!"
          : "Welcome to the pact!"
      );
      loadPact();
    } catch (e: any) {
      setTxStatus("error");
      setTxMessage(e.message || "Transaction failed");
    }
  };

  if (!connected) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <MaterialIcon name="account_balance_wallet" size={64} className="text-outline mb-4" />
          <h2 className="font-headline text-2xl text-on-surface mb-2">Connect Your Wallet</h2>
          <p className="text-on-surface-variant">Connect your wallet to view pact details.</p>
        </div>
      </AppLayout>
    );
  }

  if (loadingPact) {
    return (
      <AppLayout>
        <PactDetailSkeleton />
      </AppLayout>
    );
  }

  if (!pact) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <MaterialIcon name="search_off" size={64} className="text-outline mb-4" />
          <h2 className="font-headline text-2xl text-on-surface mb-2">Pact Not Found</h2>
          <p className="text-on-surface-variant mb-4">The pact you're looking for doesn't exist.</p>
          <button onClick={() => navigate("/")} className="btn-primary px-6 py-2.5 text-sm">
            Go Home
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ConfirmModal
        isOpen={showConfirm === "contribute"}
        onClose={() => setShowConfirm(null)}
        onConfirm={() => handleAction("contribute")}
        title="Confirm Contribution"
        description={`You are about to contribute ${contributionSol} SOL to this pact. This will be transferred to the on-chain escrow.`}
        confirmLabel={`Contribute ${contributionSol} SOL`}
        loading={loading}
      />
      <ConfirmModal
        isOpen={showConfirm === "payout"}
        onClose={() => setShowConfirm(null)}
        onConfirm={() => handleAction("payout")}
        title="Release Payout"
        description={`You are about to release the pooled funds to ${currentRecipient ? truncateAddress(currentRecipient.toBase58()) : "the next recipient"} for this round.`}
        confirmLabel="Release Payout"
        loading={loading}
      />
      <ConfirmModal
        isOpen={showConfirm === "join"}
        onClose={() => setShowConfirm(null)}
        onConfirm={() => handleAction("join")}
        title="Join This Pact"
        description={`You are about to join "${pact.name}". You'll be committed to contributing ${contributionSol} SOL each round.`}
        confirmLabel="Join Pact"
        loading={loading}
      />
      <TransactionLoader
        isOpen={txModal}
        status={txStatus}
        txHash={txHash}
        message={txMessage}
        onClose={() => setTxModal(false)}
      />

      {/* Back */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface text-sm mb-6 transition-colors"
      >
        <MaterialIcon name="arrow_back" size={18} />
        Back to Pacts
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-3xl text-on-surface">{pact.name}</h1>
              <PactChip
                label={pact.isActive ? "Active" : "Completed"}
                active={pact.isActive}
                variant={pact.isActive ? "neon" : "default"}
              />
            </div>
            <p className="font-label text-outline">{address}</p>
          </div>
          {isOrganizer && (
            <PactChip label="Organizer" variant="purple" />
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Pool Total", value: `${poolTotal.toFixed(2)} SOL`, icon: "savings" },
                { label: "Contribution", value: `${contributionSol} SOL`, icon: "payments" },
                { label: "Members", value: `${pact.currentMembers}/${pact.maxMembers}`, icon: "group" },
                { label: "Round", value: `${pact.currentRound}/${pact.totalRounds}`, icon: "loop" },
              ].map((stat, i) => (
                <GlassCard key={i} hoverable={false} className="p-4">
                  <MaterialIcon name={stat.icon} size={20} className="text-on-surface-variant mb-2" />
                  <p className="font-data text-lg text-on-surface">{stat.value}</p>
                  <p className="text-xs text-on-surface-variant mt-1">{stat.label}</p>
                </GlassCard>
              ))}
            </div>
          </motion.div>

          {/* Progress bar */}
          <GlassCard hoverable={false}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-on-surface">Cycle Progress</span>
              <span className="font-label text-on-surface-variant">{progress.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neon to-ajo-secondary rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </GlassCard>

          {/* Rotation Timeline */}
          <GlassCard hoverable={false}>
            <h3 className="font-headline text-lg text-on-surface mb-6">Rotation Queue</h3>
            {pact.payoutOrder.length > 0 ? (
              <ContributionTimeline
                payoutOrder={pact.payoutOrder}
                currentRound={pact.currentRound}
                members={pact.members}
              />
            ) : (
              <p className="text-on-surface-variant text-sm">
                Rotation order will be set once all members join.
              </p>
            )}
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard hoverable={false}>
              <h3 className="font-headline text-lg text-on-surface mb-4">Actions</h3>
              <div className="space-y-3">
                {!isMember && pact.isActive && pact.currentMembers < pact.maxMembers && (
                  <button
                    onClick={() => setShowConfirm("join")}
                    className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <MaterialIcon name="person_add" size={18} />
                    Join Pact
                  </button>
                )}

                {isMember && pact.isActive && (
                  <button
                    onClick={() => setShowConfirm("contribute")}
                    className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <MaterialIcon name="payments" size={18} />
                    Contribute {contributionSol} SOL
                  </button>
                )}

                {isOrganizer && pact.isActive && (
                  <button
                    onClick={() => setShowConfirm("payout")}
                    className="btn-secondary w-full py-3 text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <MaterialIcon name="send_money" size={18} />
                    Release Payout
                  </button>
                )}

                {!pact.isActive && (
                  <div className="text-center py-4">
                    <MaterialIcon name="check_circle" size={32} className="text-neon mb-2" filled />
                    <p className="text-sm text-on-surface-variant">This pact has been completed.</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Invite / Blink Share */}
          {pact.isActive && pact.currentMembers < pact.maxMembers && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <GlassCard hoverable={false}>
                <h3 className="font-headline text-lg text-on-surface mb-1">Invite Members</h3>
                <p className="text-xs text-on-surface-variant mb-4">
                  Share this pact on X or copy the invite link.
                </p>
                <BlinkCard
                  pactName={pact.name}
                  pactAddress={address || ""}
                  contributionAmount={pact.contributionAmount}
                  currentMembers={pact.currentMembers}
                  maxMembers={pact.maxMembers}
                  currentRound={pact.currentRound}
                  totalRounds={pact.totalRounds}
                  isActive={pact.isActive}
                />
              </GlassCard>
            </motion.div>
          )}

          {/* Members */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard hoverable={false}>
              <h3 className="font-headline text-lg text-on-surface mb-4">
                Members ({pact.currentMembers}/{pact.maxMembers})
              </h3>
              <div className="space-y-3">
                {pact.members.map((member, i) => {
                  const addr = member.toBase58();
                  const isCurrentUser = addr === publicKey?.toBase58();
                  const isOrg = addr === pact.organizer.toBase58();
                  return (
                    <div
                      key={i}
                      className={`
                        flex items-center justify-between p-3 rounded-xl transition-all
                        ${isCurrentUser ? "bg-neon/5 border border-neon/20" : "bg-surface-container-highest/30"}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-ajo-primary-container flex items-center justify-center">
                          <span className="text-xs font-medium text-ajo-primary">
                            {truncateAddress(addr, 2).slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-label text-on-surface text-xs">
                            {truncateAddress(addr)}
                          </p>
                          {isCurrentUser && (
                            <span className="text-[10px] text-neon">You</span>
                          )}
                        </div>
                      </div>
                      {isOrg && (
                        <PactChip label="Org" variant="purple" />
                      )}
                    </div>
                  );
                })}
                {pact.currentMembers < pact.maxMembers && (
                  <div className="flex items-center justify-center py-3 border border-dashed border-outline-variant/30 rounded-xl">
                    <span className="text-xs text-outline">
                      {pact.maxMembers - pact.currentMembers} slots remaining
                    </span>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PactDetail;
>>>>>>> main
