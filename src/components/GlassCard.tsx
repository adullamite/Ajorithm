<<<<<<< HEAD
import React from 'react';
import { cn } from '@/lib/utils';
=======
import React from "react";
>>>>>>> main

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
<<<<<<< HEAD
  onClick?: () => void;
  hover?: boolean;
}

export function GlassCard({ children, className, onClick, hover = false }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass rounded-lg p-6',
        hover && 'cursor-pointer hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300',
        onClick && 'cursor-pointer',
        className
      )}
=======
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
>>>>>>> main
    >
      {children}
    </div>
  );
<<<<<<< HEAD
}
=======
};

export default GlassCard;
>>>>>>> main
