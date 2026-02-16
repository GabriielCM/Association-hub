'use client';

import { type ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  variant?: 'surface' | 'elevated' | 'accent';
  className?: string;
  noPadding?: boolean;
}

const variantClasses: Record<string, string> = {
  surface:
    'bg-white/5 border border-white/10 backdrop-blur-xl shadow-glass',
  elevated:
    'bg-white/8 border border-white/15 backdrop-blur-xl shadow-glass-lg',
  accent:
    'bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 backdrop-blur-xl shadow-glass',
};

export function GlassCard({
  children,
  variant = 'surface',
  className = '',
  noPadding = false,
}: GlassCardProps) {
  return (
    <div
      className={`rounded-3xl ${variantClasses[variant]} ${
        noPadding ? '' : 'p-4'
      } ${className}`}
    >
      {children}
    </div>
  );
}
