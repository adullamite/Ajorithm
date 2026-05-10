<<<<<<< HEAD
import React, { useState } from 'react';
import { Share2, Copy, Check, Eye, EyeOff, ExternalLink, Users, CircleDollarSign, Sparkles } from 'lucide-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { GlassCard } from './GlassCard';
import { triggerToast } from '@/hooks/useAppToast';
import type { PactState } from '@/hooks/useAjorithm';

interface BlinkCardProps {
  pact: PactState;
}

export function BlinkCard({ pact }: BlinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Only show blink card for active pacts with open slots
  if (!pact.isActive || pact.currentMembers >= pact.maxMembers) return null;

  const inviteUrl = `${window.location.origin}/join/${pact.publicKey.toBase58()}`;
  const pool = (pact.contributionAmount.toNumber() / LAMPORTS_PER_SOL) * pact.currentMembers;
  const slotsLeft = pact.maxMembers - pact.currentMembers;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    triggerToast({ type: 'info', title: 'Invite link copied!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareX = () => {
    const text = `Join my Ajo savings group "${pact.name}" on Ajorithm!\n\n${pool.toFixed(2)} SOL pool | ${slotsLeft} slot${slotsLeft > 1 ? 's' : ''} left\n\nJoin here:`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(inviteUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground font-semibold flex items-center gap-2">
          <Share2 className="w-4 h-4 text-secondary" />
          Share & Invite
        </h3>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showPreview ? 'Hide' : 'Preview'}
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleShareX}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-foreground/10 text-foreground text-sm font-medium hover:bg-foreground/15 transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          Share on X
        </button>
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary/15 text-secondary text-sm font-medium hover:bg-secondary/20 transition-all"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>

      {/* Blink Preview */}
      {showPreview && (
        <div className="rounded-xl overflow-hidden border border-border/50 animate-fade-in">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-primary-container to-secondary/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-secondary/30 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-secondary" />
              </div>
              <span className="text-xs font-medium text-foreground/70">Ajorithm</span>
            </div>
            <h4 className="text-foreground font-bold text-lg">{pact.name}</h4>
            <p className="text-foreground/60 text-xs mt-1">Decentralized Ajo on Solana</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-px bg-border/30">
            <div className="bg-surface-container p-3 text-center">
              <CircleDollarSign className="w-4 h-4 text-secondary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Pool</p>
              <p className="text-sm font-bold text-foreground font-mono">{pool.toFixed(1)}</p>
            </div>
            <div className="bg-surface-container p-3 text-center">
              <Users className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Members</p>
              <p className="text-sm font-bold text-foreground">{pact.currentMembers}/{pact.maxMembers}</p>
            </div>
            <div className="bg-surface-container p-3 text-center">
              <Sparkles className="w-4 h-4 text-neon mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Slots</p>
              <p className="text-sm font-bold text-secondary">{slotsLeft} left</p>
            </div>
          </div>

          {/* Member Progress */}
          <div className="p-3 bg-surface-container">
            <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-secondary to-neon rounded-full transition-all"
                style={{ width: `${(pact.currentMembers / pact.maxMembers) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-muted-foreground">Filling up...</span>
              <span className="text-[10px] text-secondary font-medium">Powered by Solana</span>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
=======
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MaterialIcon from "./MaterialIcon";
import PactChip from "./PactChip";
import { truncateAddress, lamportsToSol } from "@/lib/constants";

interface BlinkCardProps {
  pactName: string;
  pactAddress: string;
  contributionAmount: number | bigint;
  currentMembers: number;
  maxMembers: number;
  currentRound: number;
  totalRounds: number;
  isActive: boolean;
}

const BlinkCard: React.FC<BlinkCardProps> = ({
  pactName,
  pactAddress,
  contributionAmount,
  currentMembers,
  maxMembers,
  currentRound,
  totalRounds,
  isActive,
}) => {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const contributionSol = lamportsToSol(Number(contributionAmount));
  const slotsLeft = maxMembers - currentMembers;
  const inviteUrl = `${window.location.origin}/join/${pactAddress}`;

  const tweetText = encodeURIComponent(
    `Join my Ajo savings circle "${pactName}" on Ajorithm!\n\n` +
    `${contributionSol} SOL per round | ${slotsLeft} slot${slotsLeft !== 1 ? "s" : ""} left\n\n` +
    `Trustless rotating savings on Solana.\n\n` +
    `${inviteUrl}`
  );

  const twitterShareUrl = `https://x.com/intent/tweet?text=${tweetText}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement("input");
      input.value = inviteUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-3">
      {/* Share buttons */}
      <div className="flex gap-2">
        <a
          href={twitterShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 no-underline"
          style={{ textDecoration: "none" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Share on X
        </a>
        <button
          onClick={handleCopyLink}
          className="btn-secondary px-4 py-2.5 text-sm flex items-center gap-2"
        >
          <MaterialIcon name={copied ? "check" : "link"} size={16} />
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>

      {/* Preview toggle */}
      <button
        onClick={() => setShowPreview(!showPreview)}
        className="w-full flex items-center justify-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors py-1"
      >
        <MaterialIcon name={showPreview ? "expand_less" : "expand_more"} size={16} />
        {showPreview ? "Hide Preview" : "Preview Blink Card"}
      </button>

      {/* Blink preview card */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl overflow-hidden border border-outline-variant/20 bg-surface-container">
              {/* Card header gradient */}
              <div className="relative h-28 bg-gradient-to-br from-ajo-primary-container via-surface-container-high to-neon/15 overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-neon/10 blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-ajo-primary/10 blur-xl" />

                {/* Logo and network */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-surface/70 backdrop-blur-xl flex items-center justify-center">
                    <MaterialIcon name="hub" size={16} className="text-neon" filled />
                  </div>
                  <span className="text-xs font-medium text-on-surface/80">Ajorithm</span>
                </div>

                <div className="absolute top-4 right-4">
                  <PactChip
                    label={isActive ? "Active" : "Completed"}
                    active={isActive}
                    variant={isActive ? "neon" : "default"}
                  />
                </div>

                {/* Pact name overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h4 className="font-headline text-lg text-on-surface truncate">{pactName}</h4>
                  <p className="font-label text-outline text-[10px] mt-0.5">
                    {truncateAddress(pactAddress, 6)}
                  </p>
                </div>
              </div>

              {/* Card body */}
              <div className="p-4 space-y-3">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="font-data text-base text-on-surface">{contributionSol}</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">SOL/round</p>
                  </div>
                  <div className="text-center border-x border-outline-variant/20">
                    <p className="font-data text-base text-on-surface">
                      {currentMembers}/{maxMembers}
                    </p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Members</p>
                  </div>
                  <div className="text-center">
                    <p className="font-data text-base text-on-surface">
                      {currentRound}/{totalRounds}
                    </p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Round</p>
                  </div>
                </div>

                {/* Slots indicator */}
                {slotsLeft > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neon/5 border border-neon/10">
                    <MaterialIcon name="group_add" size={16} className="text-neon" />
                    <span className="text-xs text-neon font-medium">
                      {slotsLeft} slot{slotsLeft !== 1 ? "s" : ""} remaining
                    </span>
                  </div>
                )}

                {/* Member progress bar */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] text-on-surface-variant">Members</span>
                    <span className="text-[10px] text-on-surface-variant">
                      {((currentMembers / maxMembers) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neon rounded-full transition-all duration-500"
                      style={{ width: `${(currentMembers / maxMembers) * 100}%` }}
                    />
                  </div>
                </div>

                {/* CTA mock */}
                <div className="pt-1">
                  <div className="btn-primary w-full py-2.5 text-xs font-semibold text-center rounded-xl opacity-80 pointer-events-none">
                    Join This Pact
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 397.7 311.7" className="text-on-surface-variant opacity-60">
                      <path
                        fill="currentColor"
                        d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7zm0-234.1c2.5-2.4 5.8-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8zm268.5 120.7c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"
                      />
                    </svg>
                    <span className="text-[9px] text-on-surface-variant/60">Solana Devnet</span>
                  </div>
                  <span className="text-[9px] text-on-surface-variant/40">ajorithm.app</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlinkCard;
>>>>>>> main
