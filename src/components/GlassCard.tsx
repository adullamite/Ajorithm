import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  active = false,
  hoverable = true,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        ${hoverable ? "glass-card" : "glass-card-static"} 
        ${active ? "pact-active-glow animate-pulse-neon" : ""} 
        ${onClick ? "cursor-pointer" : ""} 
        p-6 
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default GlassCard;
