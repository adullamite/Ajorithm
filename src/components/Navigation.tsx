import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, User, Wallet, LogOut } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';
import logoSvg from '@/assets/logo.svg';

const navLinks = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/create', icon: Plus, label: 'Create' },
  { href: '/profile', icon: User, label: 'Profile' },
];

function Logo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <img
      src={logoSvg}
      alt="Ajorithm Logo"
      className={cn(
        'object-contain',
        size === 'md' ? 'h-20 w-64' : 'h-14 w-48'
      )}
    />
  );
}

function WalletButton() {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  if (connected && publicKey) {
    const address = publicKey.toBase58();
    const short = address.slice(0, 4) + '..' + address.slice(-4);
    return (
      <div className="flex gap-2 w-full">
        <button
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
          onClick={() => setVisible(true)}
        >
          <Wallet className="w-4 h-4" />
          {short}
        </button>
        <button
          onClick={() => disconnect()}
          className="px-3 py-2 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 transition-colors"
          title="Disconnect"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setVisible(true)}
      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </button>
  );
}

export function Navigation() {
  const location = useLocation();
  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col glass-strong border-r border-border/50 z-40">
        <div className="p-6">
          <Link to="/">
            <Logo size="md" />
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
          <WalletButton />
        </div>
      </aside>

      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 glass-strong border-b border-border/50 px-3 h-14 flex items-center justify-between">
        <Link to="/">
          <Logo size="sm" />
        </Link>
        <div className="flex items-center gap-1.5 shrink-0">
          <ThemeToggle />
          <WalletButton />
        </div>
      </header>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-border/50 px-4 h-16 flex items-center justify-around">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.href;
          return (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200',
                isActive ? 'text-primary' : 'text-muted-foreground'
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
