import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import GlassCard from "@/components/GlassCard";
import MaterialIcon from "@/components/MaterialIcon";
import PactCard from "@/components/PactCard";
import ReputationBadge from "@/components/ReputationBadge";
import PactChip from "@/components/PactChip";
import { truncateAddress } from "@/lib/constants";
import { ProfileSkeleton, PactCardSkeleton } from "@/components/Skeleton";
import { useAjorithm, type PactAccount, type ReputationAccount } from "@/hooks/useAjorithm";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const { fetchAllPacts, fetchReputation } = useAjorithm();

  const [balance, setBalance] = useState<number>(0);
  const [myPacts, setMyPacts] = useState<PactAccount[]>([]);
  const [reputations, setReputations] = useState<Record<string, ReputationAccount>>({});
  const [loadingData, setLoadingData] = useState(true);

  const totalContributions = Object.values(reputations).reduce(
    (sum, r) => sum + (r?.contributionsMade || 0),
    0
  );
  const totalMissed = Object.values(reputations).reduce(
    (sum, r) => sum + (r?.contributionsMissed || 0),
    0
  );
  const bestStreak = Object.values(reputations).reduce(
    (max, r) => Math.max(max, r?.streak || 0),
    0
  );

  const loadData = useCallback(async () => {
    if (!publicKey || !connected) return;
    setLoadingData(true);
    try {
      const [bal, allPacts] = await Promise.all([
        connection.getBalance(publicKey),
        fetchAllPacts(),
      ]);
      setBalance(bal / LAMPORTS_PER_SOL);

      const mine = allPacts.filter((p) =>
        p.members.some((m) => m.toBase58() === publicKey.toBase58())
      );
      setMyPacts(mine);

      const reps: Record<string, ReputationAccount> = {};
      for (const pact of mine) {
        const rep = await fetchReputation(
          publicKey.toBase58(),
          pact.publicKey.toBase58()
        );
        if (rep) {
          reps[pact.publicKey.toBase58()] = rep;
        }
      }
      setReputations(reps);
    } catch {
      // silent
    } finally {
      setLoadingData(false);
    }
  }, [publicKey, connected, connection, fetchAllPacts, fetchReputation]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!connected || !publicKey) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <MaterialIcon name="account_circle" size={64} className="text-outline mb-4" />
          <h2 className="font-headline text-2xl text-on-surface mb-2">Connect Your Wallet</h2>
          <p className="text-on-surface-variant">Connect your wallet to view your profile.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl text-on-surface mb-2">Profile</h1>
        <p className="font-label text-outline">{publicKey.toBase58()}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Profile info */}
        <div className="space-y-6">
          {/* Wallet card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard hoverable={false}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ajo-primary-container to-neon/20 flex items-center justify-center">
                  <MaterialIcon name="account_circle" size={36} className="text-ajo-primary" />
                </div>
                <div>
                  <p className="font-headline text-lg text-on-surface">
                    {truncateAddress(publicKey.toBase58(), 6)}
                  </p>
                  <PactChip label="Devnet" variant="purple" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-on-surface-variant">Balance</span>
                  <span className="font-data text-lg text-on-surface">
                    {balance.toFixed(4)} <span className="text-sm text-on-surface-variant">SOL</span>
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-on-surface-variant">Active Pacts</span>
                  <span className="font-data text-lg text-on-surface">
                    {myPacts.filter((p) => p.isActive).length}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-on-surface-variant">Total Pacts</span>
                  <span className="font-data text-lg text-on-surface">{myPacts.length}</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Reputation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard hoverable={false}>
              <h3 className="font-headline text-lg text-on-surface mb-6">Reputation</h3>

              <div className="flex justify-center mb-6">
                <ReputationBadge
                  contributionsMade={totalContributions}
                  contributionsMissed={totalMissed}
                  streak={bestStreak}
                  size="lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="font-data text-xl text-neon">{totalContributions}</p>
                  <p className="text-xs text-on-surface-variant mt-1">Made</p>
                </div>
                <div>
                  <p className="font-data text-xl text-ajo-error">{totalMissed}</p>
                  <p className="text-xs text-on-surface-variant mt-1">Missed</p>
                </div>
                <div>
                  <p className="font-data text-xl text-ajo-primary">{bestStreak}</p>
                  <p className="text-xs text-on-surface-variant mt-1">Best Streak</p>
                </div>
              </div>

              {totalContributions === 0 && (
                <div className="text-center mt-6 pt-4 border-t border-outline-variant/20">
                  <p className="text-sm text-on-surface-variant">
                    Join a pact and start contributing to build your reputation!
                  </p>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>

        {/* Right - Pact history */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline text-xl text-on-surface">Your Pacts</h2>
              <button
                onClick={loadData}
                className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1"
              >
                <MaterialIcon name="refresh" size={14} />
                Refresh
              </button>
            </div>

            {loadingData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <PactCardSkeleton key={i} />
                ))}
              </div>
            ) : myPacts.length === 0 ? (
              <GlassCard hoverable={false} className="text-center py-12">
                <MaterialIcon name="folder_open" size={48} className="text-outline mb-4" />
                <p className="text-on-surface-variant mb-2">No pacts yet</p>
                <p className="text-sm text-outline mb-6">
                  Create or join a pact to get started!
                </p>
                <button
                  onClick={() => navigate("/create")}
                  className="btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2"
                >
                  <MaterialIcon name="add_circle" size={18} />
                  Create Pact
                </button>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myPacts.map((pact, i) => (
                  <motion.div
                    key={pact.publicKey.toBase58()}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                  >
                    <PactCard pact={pact} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;