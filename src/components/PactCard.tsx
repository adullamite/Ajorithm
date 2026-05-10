<<<<<<< HEAD
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, CircleDollarSign, ArrowRight } from 'lucide-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { GlassCard } from './GlassCard';
import { PactChip } from './PactChip';
import type { PactState } from '@/hooks/useAjorithm';

interface PactCardProps {
  pact: PactState;
}

export function PactCard({ pact }: PactCardProps) {
  const pool = (pact.contributionAmount.toNumber() / LAMPORTS_PER_SOL) * pact.currentMembers;
  const progress = pact.totalRounds > 0 ? (pact.currentRound / pact.totalRounds) * 100 : 0;
  const nextPayoutIdx = pact.currentRound < pact.payoutOrder.length ? pact.currentRound : null;

  return (
    <Link to={`/pact/${pact.publicKey.toBase58()}`}>
      <GlassCard hover className="group">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-foreground font-semibold text-lg leading-tight">{pact.name}</h3>
            <p className="text-muted-foreground text-xs font-mono mt-1">
              {pact.publicKey.toBase58().slice(0, 8)}...
            </p>
          </div>
          <PactChip
            label={pact.isActive ? 'Active' : 'Completed'}
            variant={pact.isActive ? 'active' : 'completed'}
            pulse={pact.isActive}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-muted/30 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
              <CircleDollarSign className="w-3.5 h-3.5" />
              Current Pool
            </div>
            <p className="text-foreground font-semibold font-mono">{pool.toFixed(2)} SOL</p>
          </div>
          <div className="bg-muted/30 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
              <Users className="w-3.5 h-3.5" />
              Members
            </div>
            <p className="text-foreground font-semibold">
              {pact.currentMembers}/{pact.maxMembers}
            </p>
          </div>
        </div>

        {/* Cycle Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Cycle Progress</span>
            <span className="text-foreground font-mono">
              Round {pact.currentRound}/{pact.totalRounds}
            </span>
          </div>
          <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Member Facepile */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {pact.members.slice(0, 5).map((member, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full bg-primary-container border-2 border-surface-container flex items-center justify-center"
              >
                <span className="text-[10px] font-bold text-primary">
                  {member.toBase58().slice(0, 2)}
                </span>
              </div>
            ))}
            {pact.members.length > 5 && (
              <div className="w-7 h-7 rounded-full bg-muted border-2 border-surface-container flex items-center justify-center">
                <span className="text-[10px] font-medium text-muted-foreground">
                  +{pact.members.length - 5}
                </span>
              </div>
            )}
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
        </div>
      </GlassCard>
    </Link>
  );
}
=======
import React from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "./GlassCard";
import PactChip from "./PactChip";
import MaterialIcon from "./MaterialIcon";
import { truncateAddress, lamportsToSol } from "@/lib/constants";
import type { PactAccount } from "@/hooks/useAjorithm";

interface PactCardProps {
  pact: PactAccount;
}

const PactCard: React.FC<PactCardProps> = ({ pact }) => {
  const navigate = useNavigate();
  const contributionSol = lamportsToSol(Number(pact.contributionAmount));
  const poolTotal = contributionSol * pact.currentMembers;
  const progress = pact.totalRounds > 0
    ? (pact.currentRound / pact.totalRounds) * 100
    : 0;

  return (
    <GlassCard
      active={pact.isActive}
      onClick={() => navigate(`/pact/${pact.publicKey.toBase58()}`)}
      className="group"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-headline text-lg text-on-surface">{pact.name}</h3>
          <p className="font-label text-outline mt-1">
            {truncateAddress(pact.publicKey.toBase58())}
          </p>
        </div>
        <PactChip
          label={pact.isActive ? "Active" : "Completed"}
          active={pact.isActive}
          variant={pact.isActive ? "neon" : "default"}
        />
      </div>

      {/* Pool & Payout */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-xs text-on-surface-variant mb-1">Current Pool</p>
          <p className="font-data text-xl text-on-surface">
            {poolTotal.toFixed(2)}
            <span className="text-sm text-on-surface-variant ml-1">SOL</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-on-surface-variant mb-1">Contribution</p>
          <p className="font-data text-xl text-on-surface">
            {contributionSol.toFixed(2)}
            <span className="text-sm text-on-surface-variant ml-1">SOL</span>
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-on-surface-variant">Cycle Progress</p>
          <p className="font-label text-on-surface-variant">
            Round {pact.currentRound}/{pact.totalRounds}
          </p>
        </div>
        <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
          <div
            className="h-full bg-neon rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Members facepile */}
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {pact.members.slice(0, 5).map((m, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-ajo-primary-container border-2 border-surface-container flex items-center justify-center"
            >
              <span className="text-xs font-medium text-ajo-primary">
                {truncateAddress(m.toBase58(), 2).slice(0, 2)}
              </span>
            </div>
          ))}
          {pact.members.length > 5 && (
            <div className="w-8 h-8 rounded-full bg-surface-container-highest border-2 border-surface-container flex items-center justify-center">
              <span className="text-xs text-on-surface-variant">
                +{pact.members.length - 5}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-on-surface-variant text-sm">
          <MaterialIcon name="group" size={18} />
          <span>{pact.currentMembers}/{pact.maxMembers}</span>
        </div>
      </div>
    </GlassCard>
  );
};

export default PactCard;
>>>>>>> main
