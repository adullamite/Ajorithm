<<<<<<< HEAD
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
  Users, CircleDollarSign, Shield, CheckCircle, Sparkles,
  ArrowLeft
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { GlassCard } from '@/components/GlassCard';
import { PactChip } from '@/components/PactChip';
import { TransactionLoader } from '@/components/TransactionLoader';
import { JoinPactSkeleton } from '@/components/Skeleton';
import { useAjorithm, type PactState } from '@/hooks/useAjorithm';

type JoinStep = 'details' | 'connect' | 'commit' | 'success';

export default function JoinPactPage() {
  const { blink } = useParams<{ blink: string }>();
  const navigate = useNavigate();
  const { publicKey, connected } = useWallet();
  const { fetchPact, joinPact, loading } = useAjorithm();
  const [pact, setPact] = useState<PactState | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [step, setStep] = useState<JoinStep>('details');
  const [txSuccess, setTxSuccess] = useState(false);

  const loadPact = useCallback(async () => {
    if (!blink || !connected) return;
    try {
      const pk = new PublicKey(blink);
      const data = await fetchPact(pk);
      setPact(data);
    } catch { /* invalid */ }
    setPageLoading(false);
  }, [blink, fetchPact, connected]);

  useEffect(() => {
    if (connected) {
      setPageLoading(true);
      loadPact();
    } else {
      setPact(null);
      setPageLoading(false);
    }
  }, [connected, loadPact]);

  useEffect(() => {
    if (connected && step === 'connect') {
      setStep('commit');
    }
  }, [connected, step]);

  const handleJoin = async () => {
    if (!pact) return;
    const tx = await joinPact(pact.publicKey);
    if (tx) {
      setTxSuccess(true);
      setStep('success');
    }
  };

  const pool = pact ? (pact.contributionAmount.toNumber() / LAMPORTS_PER_SOL) * pact.currentMembers : 0;
  const contribution = pact ? pact.contributionAmount.toNumber() / LAMPORTS_PER_SOL : 0;
  const slotsLeft = pact ? pact.maxMembers - pact.currentMembers : 0;
  const alreadyMember =
    publicKey && pact && pact.members.some((m) => m.toBase58() === publicKey.toBase58());

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <TransactionLoader isLoading={loading} isSuccess={txSuccess} />

      <main className="lg:pl-64 pt-14 lg:pt-0 pb-20 lg:pb-0">
        <div className="max-w-lg mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </button>

          {!connected ? (
            <GlassCard className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-5 primary-glow">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <p className="text-foreground font-semibold text-lg mb-2">
                Connect Your Wallet
              </p>
              <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
                Connect a Solana wallet to view this pact and join the savings group.
              </p>
              <div className="flex justify-center">
                <WalletMultiButton />
              </div>
            </GlassCard>
          ) : pageLoading ? (
            <JoinPactSkeleton />
          ) : !pact ? (
            <GlassCard className="text-center py-12">
              <p className="text-foreground font-semibold text-lg mb-2">Pact not found</p>
              <p className="text-muted-foreground text-sm">
                This invite link may be invalid or expired.
              </p>
            </GlassCard>
          ) : (
            <div className="animate-fade-in">
              {step === 'details' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4 neon-glow">
                      <Sparkles className="w-8 h-8 text-secondary" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">You're Invited!</h1>
                    <p className="text-muted-foreground">Join the "{pact.name}" savings group</p>
                  </div>

                  <GlassCard className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <CircleDollarSign className="w-5 h-5 text-secondary mx-auto mb-1" />
                      <p className="text-foreground font-bold font-mono">{pool.toFixed(2)} SOL</p>
                      <p className="text-muted-foreground text-xs">Pool</p>
                    </div>
                    <div className="text-center">
                      <Users className="w-5 h-5 text-primary mx-auto mb-1" />
                      <p className="text-foreground font-bold">{pact.currentMembers}/{pact.maxMembers}</p>
                      <p className="text-muted-foreground text-xs">Members</p>
                    </div>
                    <div className="text-center">
                      <CircleDollarSign className="w-5 h-5 text-neon mx-auto mb-1" />
                      <p className="text-foreground font-bold font-mono">{contribution} SOL</p>
                      <p className="text-muted-foreground text-xs">Per Round</p>
                    </div>
                    <div className="text-center">
                      <Shield className="w-5 h-5 text-primary mx-auto mb-1" />
                      <p className="text-foreground font-bold">{slotsLeft}</p>
                      <p className="text-muted-foreground text-xs">Slots Left</p>
                    </div>
                  </GlassCard>

                  {!pact.isActive ? (
                    <div className="text-center">
                      <PactChip label="This pact is no longer active" variant="completed" />
                    </div>
                  ) : slotsLeft <= 0 ? (
                    <div className="text-center">
                      <PactChip label="This pact is full" variant="completed" />
                    </div>
                  ) : (
                    <button
                      onClick={() => setStep(connected ? 'commit' : 'connect')}
                      className="w-full py-3.5 rounded-xl bg-secondary/20 text-secondary font-semibold text-sm hover:bg-secondary/25 transition-all neon-glow"
                    >
                      {connected ? 'Continue' : 'Connect Wallet to Join'}
                    </button>
                  )}
                </div>
              )}

              {step === 'connect' && (
                <div className="text-center space-y-6">
                  <h2 className="text-xl font-bold text-foreground">Connect Your Wallet</h2>
                  <p className="text-muted-foreground">
                    Connect a Solana wallet to join this savings group.
                  </p>
                  <div className="flex justify-center">
                    <WalletMultiButton />
                  </div>
                </div>
              )}

              {step === 'commit' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-foreground mb-2">Confirm Commitment</h2>
                    <p className="text-muted-foreground text-sm">
                      By joining, you commit to contributing {contribution} SOL each round.
                    </p>
                  </div>

                  <GlassCard className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground text-sm">Pact</span>
                      <span className="text-foreground font-medium text-sm">{pact.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground text-sm">Contribution</span>
                      <span className="text-foreground font-medium text-sm font-mono">{contribution} SOL</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground text-sm">Total Rounds</span>
                      <span className="text-foreground font-medium text-sm">{pact.totalRounds}</span>
                    </div>
                  </GlassCard>

                  {alreadyMember ? (
                    <div className="text-center">
                      <PactChip label="You're already a member" variant="active" />
                      <button
                        onClick={() => navigate(`/pact/${pact.publicKey.toBase58()}`)}
                        className="mt-4 px-5 py-2.5 rounded-xl bg-primary/15 text-primary text-sm font-medium hover:bg-primary/20 transition-all"
                      >
                        View Pact
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleJoin}
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-secondary/20 text-secondary font-semibold text-sm hover:bg-secondary/25 transition-all disabled:opacity-50 neon-glow"
                    >
                      Join Pact
                    </button>
                  )}
                </div>
              )}

              {step === 'success' && (
                <div className="text-center py-8 animate-scale-in">
                  <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6 neon-glow">
                    <CheckCircle className="w-10 h-10 text-secondary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Welcome!</h2>
                  <p className="text-muted-foreground mb-8">
                    You've joined "{pact.name}" successfully.
                  </p>
                  <button
                    onClick={() => navigate(`/pact/${pact.publicKey.toBase58()}`)}
                    className="px-6 py-3 rounded-xl bg-secondary/15 text-secondary font-medium text-sm hover:bg-secondary/20 transition-all"
                  >
                    View Pact Details
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
=======
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import GlassCard from "@/components/GlassCard";
import MaterialIcon from "@/components/MaterialIcon";
import PactChip from "@/components/PactChip";
import TransactionLoader from "@/components/TransactionLoader";
import { truncateAddress, lamportsToSol } from "@/lib/constants";
import { JoinPactSkeleton } from "@/components/Skeleton";
import { useAjorithm, type PactAccount } from "@/hooks/useAjorithm";

const JoinPact: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const { publicKey, connected } = useWallet();
  const { fetchPact, joinPact, loading } = useAjorithm();

  const [pact, setPact] = useState<PactAccount | null>(null);
  const [loadingPact, setLoadingPact] = useState(true);
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

  useEffect(() => {
    loadPact();
  }, [loadPact]);

  const isMember = pact?.members.some(
    (m) => m.toBase58() === publicKey?.toBase58()
  );

  const handleJoin = async () => {
    if (!address) return;
    setTxModal(true);
    setTxStatus("loading");
    setTxMessage("Joining pact...");
    try {
      const result = await joinPact(address);
      setTxHash(result.tx);
      setTxStatus("success");
      setTxMessage("You've joined the pact!");
    } catch (e: any) {
      setTxStatus("error");
      setTxMessage(e.message || "Failed to join");
    }
  };

  const contributionSol = pact ? lamportsToSol(Number(pact.contributionAmount)) : 0;

  return (
    <AppLayout>
      <TransactionLoader
        isOpen={txModal}
        status={txStatus}
        txHash={txHash}
        message={txMessage}
        onClose={() => {
          setTxModal(false);
          if (txStatus === "success") navigate(`/pact/${address}`);
        }}
      />

      <div className="max-w-md mx-auto mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Blink-style invite card */}
          <GlassCard hoverable={false} className="overflow-hidden">
            {/* Header gradient */}
            <div className="h-24 -mx-6 -mt-6 mb-6 bg-gradient-to-r from-ajo-primary-container via-surface-container-high to-neon/10 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-surface/80 backdrop-blur-xl flex items-center justify-center neon-glow">
                <MaterialIcon name="hub" size={32} className="text-neon" filled />
              </div>
            </div>

            {loadingPact ? (
              <JoinPactSkeleton />
            ) : !pact ? (
              <div className="text-center py-8">
                <MaterialIcon name="search_off" size={48} className="text-outline mb-4" />
                <p className="text-on-surface font-medium">Pact not found</p>
                <p className="text-sm text-on-surface-variant mt-1">This invite link may be invalid.</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <PactChip label="Invite" variant="purple" />
                  <h2 className="font-headline text-2xl text-on-surface mt-3">{pact.name}</h2>
                  <p className="font-label text-outline mt-1">{truncateAddress(address || "", 6)}</p>
                </div>

                <div className="space-y-3 mb-6">
                  {[
                    { label: "Contribution", value: `${contributionSol} SOL per round` },
                    { label: "Members", value: `${pact.currentMembers}/${pact.maxMembers}` },
                    { label: "Rounds", value: pact.totalRounds.toString() },
                    { label: "Status", value: pact.isActive ? "Active" : "Completed" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-surface-container-highest/30"
                    >
                      <span className="text-sm text-on-surface-variant">{item.label}</span>
                      <span className="text-sm font-medium text-on-surface">{item.value}</span>
                    </div>
                  ))}
                </div>

                {!connected ? (
                  <div className="text-center">
                    <p className="text-sm text-on-surface-variant mb-4">
                      Connect your wallet to join this pact
                    </p>
                    <WalletMultiButton />
                  </div>
                ) : isMember ? (
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-neon/10 flex items-center justify-center">
                      <MaterialIcon name="check_circle" size={24} className="text-neon" filled />
                    </div>
                    <p className="text-on-surface font-medium">You're already a member!</p>
                    <button
                      onClick={() => navigate(`/pact/${address}`)}
                      className="btn-primary px-6 py-2.5 text-sm mt-4"
                    >
                      View Pact
                    </button>
                  </div>
                ) : pact.currentMembers >= pact.maxMembers ? (
                  <div className="text-center">
                    <MaterialIcon name="group_off" size={32} className="text-outline mb-2" />
                    <p className="text-on-surface-variant text-sm">This pact is full.</p>
                  </div>
                ) : !pact.isActive ? (
                  <div className="text-center">
                    <p className="text-on-surface-variant text-sm">This pact is no longer active.</p>
                  </div>
                ) : (
                  <button
                    onClick={handleJoin}
                    disabled={loading}
                    className="btn-primary w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <MaterialIcon name="handshake" size={20} />
                    {loading ? "Joining..." : "Join This Pact"}
                  </button>
                )}
              </>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default JoinPact;
>>>>>>> main
