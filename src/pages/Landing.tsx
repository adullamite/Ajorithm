import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import PactCard from "@/components/PactCard";
import MaterialIcon from "@/components/MaterialIcon";
import PactChip from "@/components/PactChip";
import AppLayout from "@/components/AppLayout";
import { PactCardSkeleton, StatSkeleton } from "@/components/Skeleton";
import { useAjorithm, type PactAccount } from "@/hooks/useAjorithm";

const features = [
  {
    icon: "diversity_3",
    title: "Rotating Savings",
    description: "Traditional Ajo/Esusu circles powered by smart contracts. Pool funds, take turns.",
  },
  {
    icon: "shield",
    title: "Trustless & Secure",
    description: "Funds held in on-chain escrow. No middlemen, no rug pulls. Transparent by design.",
  },
  {
    icon: "trending_up",
    title: "Reputation System",
    description: "Build your on-chain reputation. Earn badges for consistent contributions.",
  },
];

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { connected } = useWallet();
  const { fetchAllPacts } = useAjorithm();
  const [pacts, setPacts] = useState<PactAccount[]>([]);
  const [loadingPacts, setLoadingPacts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");
  const [sortBy, setSortBy] = useState<"newest" | "members" | "pool">("newest");

  const filteredPacts = useMemo(() => {
    let result = [...pacts];

    // Search by name or address
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.publicKey.toBase58().toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter === "active") {
      result = result.filter((p) => p.isActive);
    } else if (statusFilter === "completed") {
      result = result.filter((p) => !p.isActive);
    }

    // Sort
    if (sortBy === "members") {
      result.sort((a, b) => b.currentMembers - a.currentMembers);
    } else if (sortBy === "pool") {
      result.sort(
        (a, b) =>
          Number(b.contributionAmount) * b.currentMembers -
          Number(a.contributionAmount) * a.currentMembers
      );
    }
    // "newest" keeps the default on-chain order (most recent first)

    return result;
  }, [pacts, searchQuery, statusFilter, sortBy]);

  const loadPacts = useCallback(async () => {
    if (!connected) return;
    setLoadingPacts(true);
    try {
      const all = await fetchAllPacts();
      setPacts(all);
    } catch {
      // silent
    } finally {
      setLoadingPacts(false);
    }
  }, [connected, fetchAllPacts]);

  useEffect(() => {
    if (connected) loadPacts();
  }, [connected, loadPacts]);

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative mb-12 lg:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PactChip label="Solana Devnet" variant="purple" />

          <h1 className="font-display text-4xl lg:text-5xl xl:text-6xl text-on-surface mt-4 leading-[1.1]">
            Community Savings,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon to-ajo-secondary">
              On-Chain
            </span>
          </h1>

          <p className="text-on-surface-variant text-base lg:text-lg mt-4 max-w-xl leading-relaxed">
            Ajorithm bridges traditional African financial circles with Web3.
            Create trustless rotating savings groups, contribute together, and
            build your on-chain reputation.
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            {connected ? (
              <>
                <button
                  onClick={() => navigate("/create")}
                  className="btn-primary px-6 py-3 text-sm font-semibold flex items-center gap-2"
                >
                  <MaterialIcon name="add_circle" size={20} />
                  Create a Pact
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById("browse-pacts");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="btn-secondary px-6 py-3 text-sm font-medium flex items-center gap-2"
                >
                  <MaterialIcon name="explore" size={20} />
                  Browse Pacts
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-on-surface-variant">
                  Connect your wallet to get started
                </p>
                <WalletMultiButton />
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        {connected && (
          <div className="grid grid-cols-3 gap-4 mt-10">
            {loadingPacts ? (
              <>{[1, 2, 3].map((i) => <StatSkeleton key={i} />)}</>
            ) : pacts.length > 0 ? (
              <>
                {[
                  { label: "Active Pacts", value: pacts.filter((p) => p.isActive).length.toString() },
                  { label: "Total Members", value: pacts.reduce((a, p) => a + p.currentMembers, 0).toString() },
                  { label: "Total Pacts", value: pacts.length.toString() },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                  >
                    <GlassCard hoverable={false} className="p-4 text-center">
                      <p className="font-data text-2xl text-on-surface">{stat.value}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{stat.label}</p>
                    </GlassCard>
                  </motion.div>
                ))}
              </>
            ) : null}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="mb-12 lg:mb-16">
        <h2 className="font-headline text-2xl text-on-surface mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.2 }}
            >
              <GlassCard hoverable={false} className="h-full">
                <div className="w-12 h-12 rounded-2xl bg-neon/10 flex items-center justify-center mb-4">
                  <MaterialIcon name={feature.icon} size={24} className="text-neon" />
                </div>
                <h3 className="font-headline text-lg text-on-surface mb-2">{feature.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {feature.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Browse Pacts */}
      {connected && (
        <section id="browse-pacts" className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline text-2xl text-on-surface">Browse Pacts</h2>
            <button onClick={loadPacts} className="btn-secondary px-4 py-2 text-xs flex items-center gap-1.5">
              <MaterialIcon name="refresh" size={16} />
              Refresh
            </button>
          </div>

          {/* Search & Filter Bar */}
          {!loadingPacts && pacts.length > 0 && (
            <div className="space-y-3 mb-6">
              {/* Search input */}
              <div className="relative">
                <MaterialIcon
                  name="search"
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or address..."
                  className="input-glass w-full pl-11 pr-4 py-3 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface-container-highest/60 flex items-center justify-center hover:bg-surface-container-highest transition-colors"
                  >
                    <MaterialIcon name="close" size={14} className="text-on-surface-variant" />
                  </button>
                )}
              </div>

              {/* Filters row */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Status filter chips */}
                <div className="flex gap-1.5">
                  {(["all", "active", "completed"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`
                        px-3.5 py-1.5 rounded-full text-xs font-medium border
                        transition-all duration-300
                        ${statusFilter === status
                          ? status === "active"
                            ? "bg-neon/15 text-neon border-neon/30"
                            : status === "completed"
                            ? "bg-ajo-primary/10 text-ajo-primary border-ajo-primary/30"
                            : "bg-on-surface/10 text-on-surface border-on-surface/20"
                          : "bg-transparent text-on-surface-variant border-outline-variant/30 hover:border-outline-variant/60"
                        }
                      `}
                    >
                      {status === "all" ? "All" : status === "active" ? "Active" : "Completed"}
                    </button>
                  ))}
                </div>

                {/* Divider */}
                <div className="w-px h-5 bg-outline-variant/30 mx-1 hidden sm:block" />

                {/* Sort dropdown */}
                <div className="relative ml-auto">
                  <div className="flex items-center gap-1.5">
                    <MaterialIcon name="sort" size={16} className="text-on-surface-variant" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "newest" | "members" | "pool")}
                      className="appearance-none bg-transparent text-xs font-medium text-on-surface-variant cursor-pointer focus:outline-none pr-4"
                    >
                      <option value="newest">Newest</option>
                      <option value="members">Most Members</option>
                      <option value="pool">Largest Pool</option>
                    </select>
                  </div>
                </div>

                {/* Result count */}
                <span className="text-xs text-outline hidden sm:block">
                  {filteredPacts.length} pact{filteredPacts.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}

          {loadingPacts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <PactCardSkeleton key={i} />
              ))}
            </div>
          ) : pacts.length === 0 ? (
            <GlassCard hoverable={false} className="text-center py-12">
              <MaterialIcon name="inbox" size={48} className="text-outline mb-4" />
              <p className="text-on-surface-variant">No pacts found on devnet</p>
              <p className="text-sm text-outline mt-1">Be the first to create one!</p>
              <button
                onClick={() => navigate("/create")}
                className="btn-primary px-6 py-2.5 text-sm mt-6 inline-flex items-center gap-2"
              >
                <MaterialIcon name="add_circle" size={18} />
                Create Pact
              </button>
            </GlassCard>
          ) : filteredPacts.length === 0 && pacts.length > 0 ? (
            <GlassCard hoverable={false} className="text-center py-10">
              <MaterialIcon name="search_off" size={40} className="text-outline mb-3" />
              <p className="text-on-surface-variant text-sm">No pacts match your search</p>
              <button
                onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
                className="text-neon text-xs font-medium mt-3 hover:underline"
              >
                Clear filters
              </button>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPacts.map((pact, i) => (
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
        </section>
      )}
    </AppLayout>
  );
};

export default Landing;