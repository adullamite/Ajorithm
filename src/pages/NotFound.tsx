<<<<<<< HEAD
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
=======
import React from "react";
import { useNavigate } from "react-router-dom";
import MaterialIcon from "@/components/MaterialIcon";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center relative overflow-hidden">
      <div className="gradient-blob-purple top-1/4 left-1/4" />
      <div className="gradient-blob-neon bottom-1/4 right-1/4" />

      <div className="relative z-10 text-center px-4">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface-container-high/60 backdrop-blur-xl flex items-center justify-center">
          <MaterialIcon name="explore_off" size={40} className="text-outline" />
        </div>
        <h1 className="font-display text-5xl text-on-surface mb-3">404</h1>
        <p className="text-on-surface-variant text-lg mb-8">Page not found</p>
        <button
          onClick={() => navigate("/")}
          className="btn-primary px-8 py-3 text-sm font-semibold inline-flex items-center gap-2"
        >
          <MaterialIcon name="home" size={18} />
          Go Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
>>>>>>> main
