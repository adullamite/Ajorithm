import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionLoaderProps {
  isLoading: boolean;
  isSuccess: boolean;
  onComplete?: () => void;
  message?: string;
}

export function TransactionLoader({ isLoading, isSuccess, onComplete, message }: TransactionLoaderProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onComplete]);

  if (!isLoading && !showSuccess) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="glass-strong p-8 flex flex-col items-center gap-4 min-w-[280px]">
        {showSuccess ? (
          <>
            <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center neon-glow animate-scale-in">
              <CheckCircle className="w-8 h-8 text-secondary" />
            </div>
            <p className="text-foreground font-semibold text-lg">Success</p>
            {message && <p className="text-muted-foreground text-sm">{message}</p>}
          </>
        ) : (
          <>
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 animate-spin-slow" viewBox="0 0 64 64">
                <circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="4"
                />
                <circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke="hsl(var(--secondary))"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="120 60"
                />
              </svg>
            </div>
            <p className="text-foreground font-semibold">Processing Transaction...</p>
            {message && <p className="text-muted-foreground text-sm">{message}</p>}
          </>
        )}
      </div>
    </div>
  );
}
