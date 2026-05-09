import React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-surface relative overflow-hidden">
      {/* Background gradient blobs */}
      <div className="gradient-blob-purple -top-64 -left-32 opacity-60" />
      <div className="gradient-blob-neon top-1/3 right-0 opacity-40" />
      <div className="gradient-blob-purple bottom-0 right-1/4 opacity-30" />

      <Sidebar />

      {/* Top bar (mobile + desktop) */}
      <header className="fixed top-0 right-0 left-0 lg:left-[280px] z-30 bg-surface/60 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center justify-between px-4 lg:px-8 py-3">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neon/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-neon" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>hub</span>
            </div>
            <span className="font-display text-lg text-on-surface">Ajorithm</span>
          </div>

          {/* Spacer for desktop */}
          <div className="hidden lg:block" />

          <WalletMultiButton />
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 lg:ml-[280px] pt-[68px] pb-24 lg:pb-8 min-h-screen">
        <div className="px-4 lg:px-8 xl:px-20 py-6 lg:py-8 max-w-[1200px]">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default AppLayout;
