import React from "react";

interface SkeletonProps {
  className?: string;
}

/** Base skeleton pulse block */
const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => (
  <div
    className={`rounded-xl bg-surface-container-highest/40 animate-pulse ${className}`}
  />
);

/** Skeleton for a single PactCard */
export const PactCardSkeleton: React.FC = () => (
  <div className="glass-card-static p-6 space-y-4">
    {/* Header */}
    <div className="flex items-start justify-between">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    {/* Stats */}
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
    {/* Progress bar */}
    <div className="space-y-2">
      <div className="flex justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-1.5 w-full rounded-full" />
    </div>
    {/* Facepile row */}
    <div className="flex items-center justify-between">
      <div className="flex -space-x-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="w-8 h-8 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-4 w-10" />
    </div>
  </div>
);

/** Skeleton for stat cards on Landing */
export const StatSkeleton: React.FC = () => (
  <div className="glass-card-static p-4 text-center space-y-2">
    <Skeleton className="h-7 w-12 mx-auto" />
    <Skeleton className="h-3 w-20 mx-auto" />
  </div>
);

/** Skeleton for the PactDetail page header + stats + timeline */
export const PactDetailSkeleton: React.FC = () => (
  <div className="space-y-6 animate-in">
    {/* Back link */}
    <Skeleton className="h-4 w-28" />

    {/* Header */}
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-72" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card-static p-4 space-y-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="glass-card-static p-6 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-10" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>

        {/* Timeline */}
        <div className="glass-card-static p-6 space-y-5">
          <Skeleton className="h-5 w-32" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Actions */}
        <div className="glass-card-static p-6 space-y-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
        {/* Members */}
        <div className="glass-card-static p-6 space-y-3">
          <Skeleton className="h-5 w-28" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-highest/20">
              <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 w-10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/** Skeleton for the Profile page */
export const ProfileSkeleton: React.FC = () => (
  <div className="space-y-6 animate-in">
    {/* Header */}
    <div className="space-y-2">
      <Skeleton className="h-9 w-32" />
      <Skeleton className="h-3 w-72" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column */}
      <div className="space-y-6">
        {/* Wallet card */}
        <div className="glass-card-static p-6 space-y-5">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-2xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between py-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
        {/* Reputation */}
        <div className="glass-card-static p-6 space-y-5">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="w-20 h-20 rounded-full mx-auto" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center space-y-1">
                <Skeleton className="h-6 w-8 mx-auto" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-7 w-20 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <PactCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

/** Skeleton for the JoinPact invite card */
export const JoinPactSkeleton: React.FC = () => (
  <div className="glass-card-static overflow-hidden">
    {/* Gradient header */}
    <div className="h-24 bg-gradient-to-r from-surface-container-high/40 via-surface-container-highest/30 to-surface-container-high/40 flex items-center justify-center">
      <Skeleton className="w-16 h-16 rounded-2xl" />
    </div>
    <div className="p-6 space-y-4">
      <div className="text-center space-y-2">
        <Skeleton className="h-5 w-14 rounded-full mx-auto" />
        <Skeleton className="h-7 w-48 mx-auto" />
        <Skeleton className="h-3 w-32 mx-auto" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex justify-between py-2.5 px-4 rounded-xl bg-surface-container-highest/20">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  </div>
);

export default Skeleton;
