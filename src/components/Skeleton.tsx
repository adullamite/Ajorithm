import React from 'react';
import { cn } from '@/lib/utils';

function SkeletonBox({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg bg-muted/50 skeleton-pulse', className)} />
  );
}

export function PactCardSkeleton() {
  return (
    <div className="glass rounded-lg p-6 space-y-4">
      <div className="flex justify-between">
        <div className="space-y-2">
          <SkeletonBox className="h-5 w-32" />
          <SkeletonBox className="h-3 w-20" />
        </div>
        <SkeletonBox className="h-6 w-16 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SkeletonBox className="h-16 rounded-xl" />
        <SkeletonBox className="h-16 rounded-xl" />
      </div>
      <SkeletonBox className="h-1.5 rounded-full" />
      <div className="flex gap-1">
        {[...Array(4)].map((_, i) => (
          <SkeletonBox key={i} className="w-7 h-7 rounded-full" />
        ))}
      </div>
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="glass rounded-lg p-6 space-y-3">
      <SkeletonBox className="h-4 w-24" />
      <SkeletonBox className="h-8 w-16" />
    </div>
  );
}

export function PactDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="glass rounded-lg p-6 space-y-4">
        <SkeletonBox className="h-7 w-48" />
        <SkeletonBox className="h-4 w-32" />
        <div className="grid grid-cols-3 gap-4">
          <SkeletonBox className="h-20 rounded-xl" />
          <SkeletonBox className="h-20 rounded-xl" />
          <SkeletonBox className="h-20 rounded-xl" />
        </div>
      </div>
      <div className="glass rounded-lg p-6 space-y-3">
        <SkeletonBox className="h-5 w-24" />
        {[...Array(4)].map((_, i) => (
          <SkeletonBox key={i} className="h-12 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="glass rounded-lg p-6 flex items-center gap-4">
        <SkeletonBox className="w-16 h-16 rounded-full" />
        <div className="space-y-2">
          <SkeletonBox className="h-6 w-40" />
          <SkeletonBox className="h-4 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <SkeletonBox className="h-24 rounded-lg" />
        <SkeletonBox className="h-24 rounded-lg" />
        <SkeletonBox className="h-24 rounded-lg" />
      </div>
    </div>
  );
}

export function JoinPactSkeleton() {
  return (
    <div className="glass rounded-lg p-8 space-y-6 max-w-lg mx-auto">
      <SkeletonBox className="h-8 w-48 mx-auto" />
      <SkeletonBox className="h-4 w-full" />
      <SkeletonBox className="h-4 w-3/4" />
      <SkeletonBox className="h-12 w-full rounded-xl" />
    </div>
  );
}
