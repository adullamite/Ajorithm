import React from "react";
import MaterialIcon from "./MaterialIcon";

interface ReputationBadgeProps {
  contributionsMade: number;
  contributionsMissed: number;
  streak: number;
  size?: "sm" | "md" | "lg";
}

type BadgeTier = "gold" | "silver" | "bronze" | "none";

function getBadgeTier(contributionsMade: number, streak: number): BadgeTier {
  if (contributionsMade >= 20 && streak >= 10) return "gold";
  if (contributionsMade >= 10 && streak >= 5) return "silver";
  if (contributionsMade >= 3) return "bronze";
  return "none";
}

const tierConfig = {
  gold: {
    label: "Gold",
    icon: "workspace_premium",
    className: "badge-gold",
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
  },
  silver: {
    label: "Silver",
    icon: "military_tech",
    className: "badge-silver",
    bg: "bg-gray-400/10",
    text: "text-gray-300",
  },
  bronze: {
    label: "Bronze",
    icon: "shield",
    className: "badge-bronze",
    bg: "bg-orange-400/10",
    text: "text-orange-300",
  },
  none: {
    label: "New",
    icon: "person",
    className: "border border-outline-variant",
    bg: "bg-surface-container-highest/40",
    text: "text-on-surface-variant",
  },
};

const sizeMap = {
  sm: { container: "w-10 h-10", icon: 20 },
  md: { container: "w-14 h-14", icon: 28 },
  lg: { container: "w-20 h-20", icon: 40 },
};

const ReputationBadge: React.FC<ReputationBadgeProps> = ({
  contributionsMade,
  contributionsMissed,
  streak,
  size = "md",
}) => {
  const tier = getBadgeTier(contributionsMade, streak);
  const config = tierConfig[tier];
  const sizeConfig = sizeMap[size];

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`
          ${sizeConfig.container} rounded-full ${config.className} ${config.bg}
          flex items-center justify-center transition-all duration-300
        `}
      >
        <MaterialIcon name={config.icon} size={sizeConfig.icon} className={config.text} filled />
      </div>
      {size !== "sm" && (
        <span className={`text-xs font-medium ${config.text}`}>{config.label}</span>
      )}
    </div>
  );
};

export { getBadgeTier };
export default ReputationBadge;
