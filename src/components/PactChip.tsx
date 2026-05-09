import React from "react";

interface PactChipProps {
  label: string;
  active?: boolean;
  variant?: "default" | "neon" | "purple";
}

const PactChip: React.FC<PactChipProps> = ({ label, active = false, variant = "default" }) => {
  const variants = {
    default: "bg-surface-container-highest/60 text-on-surface-variant border-outline-variant/30",
    neon: "bg-neon/10 text-neon border-neon/30",
    purple: "bg-ajo-primary-container/40 text-ajo-primary border-ajo-primary/30",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
        border backdrop-blur-sm transition-all duration-300
        ${variants[variant]}
        ${active ? "animate-pulse-neon" : ""}
      `}
    >
      {active && (
        <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
      )}
      {label}
    </span>
  );
};

export default PactChip;
