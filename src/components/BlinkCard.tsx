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
