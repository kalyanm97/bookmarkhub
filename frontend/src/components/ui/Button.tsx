'use client';

import React from 'react';

export default function Button({ children, className = '', loading = false, disabled = false, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      className={`button ${className}`}
      disabled={disabled || loading}
    >
      {loading ? 'Loading…' : children}
    </button>
  );
}
