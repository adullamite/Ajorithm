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