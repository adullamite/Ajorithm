import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import GlassCard from "@/components/GlassCard";
import MaterialIcon from "@/components/MaterialIcon";
import TransactionLoader from "@/components/TransactionLoader";
import { useAjorithm } from "@/hooks/useAjorithm";

type Step = "details" | "review" | "success";

const CreatePact: React.FC = () => {
  const navigate = useNavigate();
  const { connected } = useWallet();
  const { createPact, loading } = useAjorithm();

  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [contribution, setContribution] = useState("");
  const [maxMembers, setMaxMembers] = useState("5");
  const [txStatus, setTxStatus] = useState<"loading" | "success" | "error">("loading");
  const [txHash, setTxHash] = useState<string>("");
  const [pactAddress, setPactAddress] = useState<string>("");
  const [showTxModal, setShowTxModal] = useState(false);
  const [formError, setFormError] = useState("");

  const isValid =
    name.trim().length > 0 &&
    name.trim().length <= 32 &&
    parseFloat(contribution) > 0 &&
    parseInt(maxMembers) >= 2 &&
    parseInt(maxMembers) <= 10;

  const handleSubmit = async () => {
    if (!isValid) return;
    setFormError("");
    setShowTxModal(true);
    setTxStatus("loading");
    try {
      const result = await createPact(name.trim(), parseFloat(contribution), parseInt(maxMembers));
      setTxHash(result.tx);
      setPactAddress(result.pactAddress);
      setTxStatus("success");
      setStep("success");
    } catch (e: any) {
      setTxStatus("error");
      setFormError(e.message || "Transaction failed");
    }
  };

  if (!connected) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <MaterialIcon name="account_balance_wallet" size={64} className="text-outline mb-4" />
          <h2 className="font-headline text-2xl text-on-surface mb-2">Connect Your Wallet</h2>
          <p className="text-on-surface-variant">You need a connected wallet to create a pact.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <TransactionLoader
        isOpen={showTxModal}
        status={txStatus}
        txHash={txHash}
        message={
          txStatus === "loading"
            ? "Deploying your pact on-chain..."
            : txStatus === "success"
            ? "Your pact has been created!"
            : formError
        }
        onClose={() => {
          setShowTxModal(false);
          if (txStatus === "success") navigate(`/pact/${pactAddress}`);
        }}
      />

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface text-sm mb-4 transition-colors"
        >
          <MaterialIcon name="arrow_back" size={18} />
          Back
        </button>
        <h1 className="font-display text-3xl lg:text-4xl text-on-surface">Create a Pact</h1>
        <p className="text-on-surface-variant mt-2">
          Set up a new rotating savings group on Solana.
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-3 mb-8">
        {[
          { key: "details", label: "Details", icon: "edit" },
          { key: "review", label: "Review", icon: "visibility" },
          { key: "success", label: "Deploy", icon: "rocket_launch" },
        ].map((s, i) => {
          const isActive = s.key === step;
          const isDone =
            (s.key === "details" && (step === "review" || step === "success")) ||
            (s.key === "review" && step === "success");
          return (
            <React.Fragment key={s.key}>
              {i > 0 && (
                <div className={`h-px flex-1 ${isDone || isActive ? "bg-neon/40" : "bg-outline-variant/30"}`} />
              )}
              <div className="flex items-center gap-2">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm
                    ${isDone
                      ? "bg-neon/20 text-neon"
                      : isActive
                      ? "bg-neon text-surface"
                      : "bg-surface-container-highest text-on-surface-variant"
                    }
                  `}
                >
                  {isDone ? (
                    <MaterialIcon name="check" size={16} />
                  ) : (
                    <MaterialIcon name={s.icon} size={16} />
                  )}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    isActive ? "text-on-surface" : "text-on-surface-variant"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === "details" && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <GlassCard hoverable={false} className="max-w-lg">
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Pact Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={32}
                    placeholder="e.g., Lagos Savers Circle"
                    className="input-glass w-full px-4 py-3 text-sm"
                  />
                  <p className="text-xs text-outline mt-1.5">{name.length}/32 characters</p>
                </div>

                {/* Contribution */}
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Contribution Amount (SOL)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={contribution}
                      onChange={(e) => setContribution(e.target.value)}
                      min="0.001"
                      step="0.01"
                      placeholder="0.1"
                      className="input-glass w-full px-4 py-3 text-sm pr-14"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-outline font-medium">
                      SOL
                    </span>
                  </div>
                  <p className="text-xs text-outline mt-1.5">
                    Each member contributes this amount per round
                  </p>
                </div>

                {/* Max members */}
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Maximum Members
                  </label>
                  <div className="flex gap-2">
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        onClick={() => setMaxMembers(num.toString())}
                        className={`
                          w-10 h-10 rounded-xl text-sm font-medium transition-all duration-300
                          ${parseInt(maxMembers) === num
                            ? "bg-neon text-surface neon-glow"
                            : "bg-surface-container-highest/60 text-on-surface-variant hover:bg-surface-container-highest"
                          }
                        `}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-outline mt-1.5">
                    Number of rounds equals number of members
                  </p>
                </div>

                <button
                  onClick={() => setStep("review")}
                  disabled={!isValid}
                  className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  Continue to Review
                  <MaterialIcon name="arrow_forward" size={18} />
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {step === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <GlassCard hoverable={false} className="max-w-lg">
              <h3 className="font-headline text-xl text-on-surface mb-6">Review Your Pact</h3>

              <div className="space-y-4 mb-8">
                {[
                  { label: "Pact Name", value: name },
                  { label: "Contribution", value: `${contribution} SOL` },
                  { label: "Members", value: `${maxMembers} max` },
                  { label: "Rounds", value: maxMembers },
                  {
                    label: "Total Pool per Round",
                    value: `${(parseFloat(contribution) * parseInt(maxMembers)).toFixed(2)} SOL`,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3 border-b border-outline-variant/20 last:border-0"
                  >
                    <span className="text-sm text-on-surface-variant">{item.label}</span>
                    <span className="text-sm font-medium text-on-surface">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="glass-card-static p-4 mb-6 border-neon/20">
                <div className="flex items-start gap-3">
                  <MaterialIcon name="info" size={20} className="text-neon mt-0.5" />
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Creating a pact will deploy a new savings group on Solana Devnet.
                    You will be the organizer and automatically join as the first member.
                    A small SOL fee will be charged for the on-chain transaction.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("details")}
                  className="btn-secondary flex-1 py-3 text-sm"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <MaterialIcon name="rocket_launch" size={18} />
                  Deploy Pact
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <GlassCard hoverable={false} className="max-w-lg text-center py-10">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neon/10 flex items-center justify-center neon-glow-strong">
                <MaterialIcon name="celebration" size={40} className="text-neon" filled />
              </div>
              <h3 className="font-headline text-2xl text-on-surface mb-2">Pact Created!</h3>
              <p className="text-on-surface-variant text-sm mb-6">
                Your savings group is live on Solana Devnet.
              </p>
              <p className="font-label text-outline mb-8 break-all px-4">{pactAddress}</p>
              <div className="flex gap-3 max-w-xs mx-auto">
                <button
                  onClick={() => navigate(`/pact/${pactAddress}`)}
                  className="btn-primary flex-1 py-3 text-sm font-semibold"
                >
                  View Pact
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="btn-secondary flex-1 py-3 text-sm"
                >
                  Home
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default CreatePact;
