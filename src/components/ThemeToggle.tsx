import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative flex items-center justify-center w-10 h-10 rounded-xl',
        'glass hover:border-primary/30 transition-all duration-300',
        'group',
        className
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Sun
        className={cn(
          'w-[18px] h-[18px] absolute transition-all duration-300',
          isDark
            ? 'rotate-0 scale-100 text-foreground'
            : 'rotate-90 scale-0 text-foreground'
        )}
      />
      <Moon
        className={cn(
          'w-[18px] h-[18px] absolute transition-all duration-300',
          isDark
            ? '-rotate-90 scale-0 text-foreground'
            : 'rotate-0 scale-100 text-foreground'
        )}
      />
    </button>
  );
}
