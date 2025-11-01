'use client';

import React from 'react';

export default function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`card bg-base-200 shadow-sm p-6 ${className}`}>{children}</div>
  );
}
