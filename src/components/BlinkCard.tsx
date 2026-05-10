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
