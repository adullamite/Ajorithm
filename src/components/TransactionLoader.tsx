<<<<<<< HEAD
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
=======
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import MaterialIcon from "./MaterialIcon";

interface TransactionLoaderProps {
  isOpen: boolean;
  status: "loading" | "success" | "error";
  message?: string;
  txHash?: string;
  onClose?: () => void;
}

const TransactionLoader: React.FC<TransactionLoaderProps> = ({
  isOpen,
  status,
  message,
  txHash,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-modal p-8 max-w-sm w-full mx-4 text-center"
          >
            {status === "loading" && (
              <>
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-2 border-outline-variant" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-neon animate-spin" />
                  <div className="absolute inset-2 rounded-full border border-outline-variant/30" />
                  <div className="absolute inset-2 rounded-full border border-transparent border-t-neon/50 animate-spin" style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
                </div>
                <p className="text-on-surface font-medium text-lg">Processing Transaction</p>
                <p className="text-on-surface-variant text-sm mt-2">
                  {message || "Waiting for confirmation..."}
                </p>
              </>
            )}

            {status === "success" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neon/10 flex items-center justify-center neon-glow-strong">
                  <MaterialIcon name="check_circle" size={48} className="text-neon" filled />
                </div>
                <p className="text-on-surface font-medium text-lg">Transaction Confirmed</p>
                <p className="text-on-surface-variant text-sm mt-2">
                  {message || "Your transaction was successful!"}
                </p>
                {txHash && (
                  <a
                    href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 text-neon text-sm font-label hover:underline"
                  >
                    View on Explorer
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="btn-primary w-full mt-6 py-3 text-sm font-semibold"
                >
                  Done
                </button>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-ajo-error/10 flex items-center justify-center" style={{ boxShadow: "0 0 20px rgba(255,180,171,0.2)" }}>
                  <MaterialIcon name="error" size={48} className="text-ajo-error" filled />
                </div>
                <p className="text-on-surface font-medium text-lg">Transaction Failed</p>
                <p className="text-on-surface-variant text-sm mt-2">
                  {message || "Something went wrong. Please try again."}
                </p>
                <button
                  onClick={onClose}
                  className="btn-secondary w-full mt-6 py-3 text-sm font-medium"
                >
                  Close
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransactionLoader;
>>>>>>> main
