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

  useEffect(() => {
    loadPact();
  }, [loadPact]);

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