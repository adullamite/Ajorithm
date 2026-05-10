import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
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
    >
      {children}
    </div>
  );
}
