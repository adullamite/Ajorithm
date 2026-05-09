import React from "react";
import { PublicKey } from "@solana/web3.js";
import MaterialIcon from "./MaterialIcon";
import { truncateAddress } from "@/lib/constants";

interface ContributionTimelineProps {
  payoutOrder: PublicKey[];
  currentRound: number;
  members: PublicKey[];
}

const ContributionTimeline: React.FC<ContributionTimelineProps> = ({
  payoutOrder,
  currentRound,
  members,
}) => {
  return (
    <div className="relative">
      {payoutOrder.map((member, index) => {
        const isCompleted = index < currentRound;
        const isCurrent = index === currentRound;
        const isPending = index > currentRound;

        return (
          <div key={index} className="flex gap-4 relative">
            {/* Vertical line */}
            {index < payoutOrder.length - 1 && (
              <div
                className={`
                  absolute left-5 top-10 w-0.5 h-full -translate-x-1/2
                  ${isCompleted ? "bg-neon/40" : "bg-outline-variant/30"}
                `}
              />
            )}

            {/* Step indicator */}
            <div className="relative z-10 flex-shrink-0">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${isCompleted
                    ? "bg-neon/20 border-2 border-neon"
                    : isCurrent
                    ? "bg-neon/10 border-2 border-neon neon-glow animate-pulse"
                    : "bg-surface-container-highest border border-outline-variant/50"
                  }
                `}
              >
                {isCompleted ? (
                  <MaterialIcon name="check" size={18} className="text-neon" />
                ) : isCurrent ? (
                  <MaterialIcon name="arrow_forward" size={18} className="text-neon" />
                ) : (
                  <span className="text-xs text-on-surface-variant font-medium">{index + 1}</span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className={`pb-8 flex-1 ${isCurrent ? "" : ""}`}>
              <div
                className={`
                  p-4 rounded-2xl transition-all duration-300
                  ${isCurrent
                    ? "glass-card-static neon-glow"
                    : isCompleted
                    ? "bg-surface-container/40"
                    : "bg-transparent"
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isCurrent ? "text-neon" : isCompleted ? "text-on-surface" : "text-on-surface-variant"}`}>
                      Round {index + 1} {isCurrent ? "— Current" : isCompleted ? "— Paid" : ""}
                    </p>
                    <p className="font-label text-outline mt-1">
                      {truncateAddress(member.toBase58())}
                    </p>
                  </div>
                  {isCompleted && (
                    <div className="flex items-center gap-1 text-neon text-xs">
                      <MaterialIcon name="verified" size={16} filled />
                      <span>Paid</span>
                    </div>
                  )}
                  {isCurrent && (
                    <div className="flex items-center gap-1 text-neon text-xs font-medium animate-pulse">
                      <MaterialIcon name="schedule" size={16} />
                      <span>Active</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContributionTimeline;
