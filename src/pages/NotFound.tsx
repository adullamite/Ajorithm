import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { GlassCard } from '@/components/GlassCard';

export default function NotFound() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="lg:pl-64 pt-14 lg:pt-0 pb-20 lg:pb-0 flex items-center justify-center min-h-screen">
        <GlassCard className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/15 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
          <p className="text-muted-foreground mb-6">
            Page "{location.pathname}" not found.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/15 text-primary text-sm font-medium hover:bg-primary/20 transition-all"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </GlassCard>
      </main>
    </div>
  );
}
