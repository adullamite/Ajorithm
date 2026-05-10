import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Sparkles, ArrowRight, Search, Filter, SortAsc,
  ChevronDown, X as CloseIcon, Shield, Users, Repeat,
  UserPlus, RotateCcw, Trophy, CircleDollarSign
} from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Navigation } from '@/components/Navigation';
import { PactCard } from '@/components/PactCard';
import { GlassCard } from '@/components/GlassCard';
import { PactCardSkeleton } from '@/components/Skeleton';
import { StatsDashboard } from '@/components/StatsDashboard';
import { TvlChart } from '@/components/TvlChart';
import { useAjorithm, type PactState } from '@/hooks/useAjorithm';
import { useTvlHistory } from '@/hooks/useTvlHistory';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

type StatusFilter = 'all' | 'active' | 'completed';
type SortOption = 'newest' | 'members' | 'pool';

export default function LandingPage() {
  const { connected } = useWallet();
  const { fetchAllPacts } = useAjorithm();
  const [pacts, setPacts] = useState<PactState[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showSort, setShowSort] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { history, record } = useTvlHistory();

  const loadPacts = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const data = await fetchAllPacts();
      setPacts(data);
      setLastRefresh(new Date());

      // Record TVL data point for history chart
      const tvl = data.reduce(
        (sum: number, p: PactState) =>
          sum + (p.contributionAmount.toNumber() / LAMPORTS_PER_SOL) * p.currentMembers,
        0
      );
      const members = new Set(data.flatMap((p: PactState) => p.members.map((m) => m.toBase58()))).size;
      record(tvl, data.length, members);
    } catch { /* silent */ }
    if (isInitial) setLoading(false);
  }, [fetchAllPacts]);

  // Initial fetch
  useEffect(() => {
    if (connected) {
      loadPacts(true);
    } else {
      setPacts([]);
      setLastRefresh(null);
    }
  }, [connected, loadPacts]);

  // 30-second polling
  useEffect(() => {
    if (!connected) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => loadPacts(false), 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [connected, loadPacts]);

  const filteredPacts = useMemo(() => {
    let result = [...pacts];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.publicKey.toBase58().toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter === 'active') result = result.filter((p) => p.isActive);
    if (statusFilter === 'completed') result = result.filter((p) => !p.isActive);

    // Sort
    if (sortBy === 'members') {
      result.sort((a, b) => b.currentMembers - a.currentMembers);
    } else if (sortBy === 'pool') {
      result.sort(
        (a, b) =>
          b.contributionAmount.toNumber() * b.currentMembers -
          a.contributionAmount.toNumber() * a.currentMembers
      );
    }

    return result;
  }, [pacts, search, statusFilter, sortBy]);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setSortBy('newest');
  };

  const hasActiveFilters = search.trim() || statusFilter !== 'all' || sortBy !== 'newest';

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="lg:pl-64 pt-14 lg:pt-0 pb-20 lg:pb-0">
        {/* Hero Section */}
        {!connected && (
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary-container/20 via-background to-background" />
            <div className="absolute top-20 left-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />

            <div className="relative max-w-4xl mx-auto px-4 py-24 lg:py-32 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-8">
                <Sparkles className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-secondary">Built on Solana</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight">
                Community Savings,
                <br />
                <span className="text-secondary neon-text">On-Chain.</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                Ajorithm brings the ancient African Ajo/Esusu savings tradition
                to the Solana blockchain. No middlemen. No trust issues. Just your community,
                saving together transparently and automatically.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <WalletMultiButton />
                <a
                  href="#how-ajo-works"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl glass text-foreground font-medium hover:border-primary/30 transition-all"
                >
                  How It Works
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap justify-center gap-3 mt-16">
                {[
                  { icon: Shield, label: 'Escrow Protected' },
                  { icon: Users, label: 'Up to 10 Members' },
                  { icon: Repeat, label: 'Auto Rotation' },
                ].map((feat) => (
                  <div
                    key={feat.label}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30 border border-border/50"
                  >
                    <feat.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{feat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How Ajo Works Section */}
            <div id="how-ajo-works" className="relative max-w-4xl mx-auto px-4 pb-24">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-4">
                How Ajo Works
              </h2>
              <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12 text-sm">
                A time-tested savings system, now trustless and transparent on Solana.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  {
                    step: 1,
                    icon: UserPlus,
                    title: 'Form a Group',
                    desc: 'Gather 2–10 trusted members to create a savings pact.',
                  },
                  {
                    step: 2,
                    icon: CircleDollarSign,
                    title: 'Contribute',
                    desc: 'Everyone contributes the same amount each round.',
                  },
                  {
                    step: 3,
                    icon: Users,
                    title: 'Receive Pool',
                    desc: 'One member receives the full pool each cycle.',
                  },
                  {
                    step: 4,
                    icon: RotateCcw,
                    title: 'Rotate',
                    desc: 'Continue until every member has received once.',
                  },
                  {
                    step: 5,
                    icon: Trophy,
                    title: 'Build Reputation',
                    desc: 'Your contribution history is tracked on-chain.',
                  },
                ].map((item) => (
                  <GlassCard key={item.step} className="relative p-5 text-center group">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center">
                      <span className="text-secondary text-xs font-bold">{item.step}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mt-3 mb-3 group-hover:bg-secondary/15 transition-colors">
                      <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-secondary transition-colors" />
                    </div>
                    <h3 className="text-foreground font-semibold text-sm mb-1">{item.title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
                  </GlassCard>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Browse Active Pacts */}
        {connected && (
          <section className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Active Pacts</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Browse and join savings groups on Solana
                </p>
              </div>
              <Link
                to="/create"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary/15 text-secondary text-sm font-medium hover:bg-secondary/20 transition-all self-start"
              >
                <Sparkles className="w-4 h-4" />
                Create Pact
              </Link>
            </div>

            {/* Stats Dashboard */}
            <StatsDashboard pacts={pacts} loading={loading} lastRefresh={lastRefresh} />

            {/* TVL History Chart */}
            <TvlChart history={history} />

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search pacts by name or address..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted/30 border border-border/50 text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>

              <div className="flex gap-2">
                {/* Status Chips */}
                {(['all', 'active', 'completed'] as StatusFilter[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      statusFilter === status
                        ? 'bg-primary/15 text-primary border border-primary/30'
                        : 'bg-muted/30 text-muted-foreground border border-border/50 hover:border-border'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}

                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowSort(!showSort)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-muted/30 border border-border/50 text-muted-foreground text-sm hover:border-border transition-all"
                  >
                    <SortAsc className="w-4 h-4" />
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {showSort && (
                    <div className="absolute right-0 top-full mt-1 w-44 glass-strong rounded-xl overflow-hidden z-50 shadow-xl">
                      {([
                        ['newest', 'Newest First'],
                        ['members', 'Most Members'],
                        ['pool', 'Largest Pool'],
                      ] as [SortOption, string][]).map(([value, label]) => (
                        <button
                          key={value}
                          onClick={() => { setSortBy(value); setShowSort(false); }}
                          className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                            sortBy === value
                              ? 'text-primary bg-primary/10'
                              : 'text-foreground hover:bg-muted/50'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Result count & clear */}
            {hasActiveFilters && (
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-medium text-muted-foreground px-2.5 py-1 rounded-full bg-muted/30">
                  {filteredPacts.length} result{filteredPacts.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <CloseIcon className="w-3 h-3" />
                  Clear filters
                </button>
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <PactCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredPacts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPacts.map((pact) => (
                  <PactCard key={pact.publicKey.toBase58()} pact={pact} />
                ))}
              </div>
            ) : (
              <GlassCard className="text-center py-16">
                <p className="text-muted-foreground text-lg mb-2">No pacts found</p>
                <p className="text-muted-foreground/60 text-sm mb-4">
                  {hasActiveFilters
                    ? 'Try adjusting your filters'
                    : 'Be the first to create one!'}
                </p>
                {hasActiveFilters ? (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 rounded-xl bg-primary/15 text-primary text-sm font-medium hover:bg-primary/20 transition-all"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <Link
                    to="/create"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary/15 text-secondary text-sm font-medium hover:bg-secondary/20 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    Create a Pact
                  </Link>
                )}
              </GlassCard>
            )}
          </section>
        )}
      </main>
    </div>
  );
}