import React from 'react';

export default function Skeleton({ className = '', fade = false }: { className?: string; fade?: boolean }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse bg-zinc-800 rounded ${className} ${fade ? 'opacity-0 animate-fade-in' : ''}`}
      style={fade ? { animationDuration: '350ms', animationFillMode: 'forwards' } : undefined}
    />
  );
}