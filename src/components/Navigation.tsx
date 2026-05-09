import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, User, Sparkles } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/create', icon: Plus, label: 'Create' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function Navigation() {
  const location = useLocation();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col glass-strong border-r border-border/50 z-40">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-secondary/20 flex items-center justify-center neon-glow">
              <Sparkles className="w-5 h-5 text-secondary" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">Ajorithm</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 space-y-3">
          <ThemeToggle className="w-full" />
          <WalletMultiButton />
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 glass-strong border-b border-border/50 px-3 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-secondary" />
          </div>
          <span className="text-lg font-bold text-foreground">Ajorithm</span>
        </Link>
        <div className="flex items-center gap-1.5 shrink-0 overflow-hidden">
          <ThemeToggle />
          <div className="wallet-mobile-wrapper">
            <WalletMultiButton />
          </div>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-border/50 px-4 h-16 flex items-center justify-around">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.href;
          return (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <link.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}