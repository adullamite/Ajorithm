import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import MaterialIcon from "./MaterialIcon";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  loading = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-modal p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-neon/10 flex items-center justify-center">
                <MaterialIcon name="security" size={22} className="text-neon" />
              </div>
              <h3 className="font-headline text-lg text-on-surface">{title}</h3>
            </div>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6">{description}</p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="btn-secondary flex-1 py-3 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="btn-primary flex-1 py-3 text-sm"
              >
                {loading ? "Processing..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
