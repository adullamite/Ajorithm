import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  ArrowLeft, ArrowRight, Check, CircleDollarSign, Users,
  FileText, UserPlus, Eye, Sparkles, GripVertical
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { GlassCard } from '@/components/GlassCard';
import { TransactionLoader } from '@/components/TransactionLoader';
import { useAjorithm } from '@/hooks/useAjorithm';

type Step = 'type' | 'details' | 'order' | 'invite' | 'review' | 'success';

const steps: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: 'type', label: 'Type', icon: FileText },
  { id: 'details', label: 'Details', icon: CircleDollarSign },
  { id: 'order', label: 'Order', icon: GripVertical },
  { id: 'invite', label: 'Invite', icon: UserPlus },
  { id: 'review', label: 'Review', icon: Eye },
];

export default function CreatePactPage() {
  const navigate = useNavigate();
  const { connected } = useWallet();
  const { createPact, loading } = useAjorithm();
  const [currentStep, setCurrentStep] = useState<Step>('type');
  const [txSuccess, setTxSuccess] = useState(false);
  const [createdAddress, setCreatedAddress] = useState('');

  // Form state
  const [pactType, setPactType] = useState<'fixed' | 'flexible'>('fixed');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [maxMembers, setMaxMembers] = useState(5);

  const currentStepIdx = steps.findIndex((s) => s.id === currentStep);

  const goNext = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStep(steps[currentStepIdx + 1].id);
    }
  };

  const goBack = () => {
    if (currentStepIdx > 0) {
      setCurrentStep(steps[currentStepIdx - 1].id);
    }
  };

  const handleDeploy = async () => {
    if (!name || !amount) return;
    const result = await createPact(name, parseFloat(amount), maxMembers);
    if (result) {
      setCreatedAddress(result.pactAddress.toBase58());
      setTxSuccess(true);
      setCurrentStep('success');
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="lg:pl-64 pt-14 lg:pt-0 pb-20 lg:pb-0 flex items-center justify-center min-h-screen">
          <GlassCard className="text-center max-w-sm">
            <p className="text-foreground font-semibold mb-2">Connect your wallet</p>
            <p className="text-muted-foreground text-sm">
              You need to connect a wallet to create a pact.
            </p>
          </GlassCard>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <TransactionLoader isLoading={loading} isSuccess={txSuccess} message="Deploying pact..." />

      <main className="lg:pl-64 pt-14 lg:pt-0 pb-20 lg:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-foreground">Create a Pact</h1>
            <p className="text-muted-foreground mt-1">
              Set up a new rotating savings group on Solana.
            </p>
          </div>

          {/* Step Indicator */}
          {currentStep !== 'success' && (
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
              {steps.map((step, i) => {
                const isActive = i === currentStepIdx;
                const isCompleted = i < currentStepIdx;
                return (
                  <React.Fragment key={step.id}>
                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-primary/15 text-primary border border-primary/30'
                          : isCompleted
                          ? 'bg-secondary/15 text-secondary'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <step.icon className="w-3.5 h-3.5" />
                      )}
                      <span className="hidden sm:inline">{step.label}</span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`w-6 h-px ${i < currentStepIdx ? 'bg-secondary' : 'bg-border'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* Step Content */}
          <div className="animate-fade-in">
            {currentStep === 'type' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground mb-4">Select Pact Type</h2>
                {[
                  { value: 'fixed' as const, title: 'Fixed Rotation', desc: 'Members take turns in a set order. Simple and predictable.' },
                  { value: 'flexible' as const, title: 'Flexible', desc: 'Organizer decides payout order each round. More control.' },
                ].map((opt) => (
                  <GlassCard
                    key={opt.value}
                    hover
                    onClick={() => setPactType(opt.value)}
                    className={pactType === opt.value ? 'border-primary/40 bg-primary/5' : ''}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-foreground font-semibold">{opt.title}</p>
                        <p className="text-muted-foreground text-sm mt-1">{opt.desc}</p>
                      </div>
                      {pactType === opt.value && (
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                      )}
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}

            {currentStep === 'details' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Setup Details</h2>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Pact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Weekend Savings Club"
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 32))}
                    className="w-full h-12 px-4 rounded-xl bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-colors"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{name.length}/32 characters</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Contribution Amount (SOL)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.5"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-muted/30 border border-border/50 text-foreground font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Max Members: <span className="text-primary font-mono">{maxMembers}</span>
                  </label>
                  <input
                    type="range"
                    min={2}
                    max={10}
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(Number(e.target.value))}
                    className="w-full accent-secondary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>2</span>
                    <span>10</span>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'order' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground mb-2">Rotation Order</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Members will be added to the rotation in the order they join.
                  The organizer (you) will be first.
                </p>
                <GlassCard>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">1</span>
                    </div>
                    <div>
                      <p className="text-foreground font-medium text-sm">You (Organizer)</p>
                      <p className="text-muted-foreground text-xs">First in rotation</p>
                    </div>
                  </div>
                  {Array.from({ length: maxMembers - 1 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30">
                      <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                        <span className="text-xs font-medium text-muted-foreground">{i + 2}</span>
                      </div>
                      <p className="text-muted-foreground text-sm">Waiting for member...</p>
                    </div>
                  ))}
                </GlassCard>
              </div>
            )}

            {currentStep === 'invite' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground mb-2">Invite Members</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  After creating the pact, you'll get a shareable link to invite members.
                  You can also share it as a Blink on X/Twitter.
                </p>
                <GlassCard>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">Share after creation</p>
                      <p className="text-muted-foreground text-sm">
                        Invite links will be available on the pact detail page.
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            )}

            {currentStep === 'review' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground mb-4">Review & Deploy</h2>
                <GlassCard className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground text-sm">Type</span>
                    <span className="text-foreground font-medium text-sm capitalize">{pactType}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground text-sm">Name</span>
                    <span className="text-foreground font-medium text-sm">{name || '—'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground text-sm">Contribution</span>
                    <span className="text-foreground font-medium text-sm font-mono">{amount || '0'} SOL</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground text-sm">Max Members</span>
                    <span className="text-foreground font-medium text-sm">{maxMembers}</span>
                  </div>
                </GlassCard>

                <button
                  onClick={handleDeploy}
                  disabled={!name || !amount || loading}
                  className="w-full py-3.5 rounded-xl bg-secondary/20 text-secondary font-semibold text-sm hover:bg-secondary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed neon-glow"
                >
                  Deploy Pact On-Chain
                </button>
              </div>
            )}

            {currentStep === 'success' && (
              <div className="text-center py-12 animate-scale-in">
                <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6 neon-glow">
                  <Sparkles className="w-10 h-10 text-secondary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Pact Created!</h2>
                <p className="text-muted-foreground mb-6">
                  Your savings group is live on Solana devnet.
                </p>
                <p className="text-xs text-muted-foreground font-mono mb-8 break-all">
                  {createdAddress}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate(`/pact/${createdAddress}`)}
                    className="px-6 py-3 rounded-xl bg-secondary/15 text-secondary font-medium text-sm hover:bg-secondary/20 transition-all"
                  >
                    View Pact
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 rounded-xl glass text-foreground font-medium text-sm hover:border-primary/30 transition-all"
                  >
                    Back Home
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          {currentStep !== 'success' && currentStep !== 'review' && (
            <div className="flex justify-between mt-8">
              <button
                onClick={goBack}
                disabled={currentStepIdx === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={goNext}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary/15 text-primary text-sm font-medium hover:bg-primary/20 transition-all"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
