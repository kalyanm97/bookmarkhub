'use client';

import React from 'react';

export default function Modal({ children, open, onClose }: { children: React.ReactNode; open: boolean; onClose?: () => void; }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="bg-base-200 rounded shadow-lg z-10 w-full max-w-2xl">
        {children}
      </div>
    </div>
  );
}
