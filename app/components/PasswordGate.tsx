'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface PasswordGateProps {
  eventTitle: string;
  onUnlock: () => void;
  correctPasswords?: string[];
}

export default function PasswordGate({
  eventTitle,
  onUnlock,
  correctPasswords = ['sansevero', 'soccorso', 'festa']
}: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = password.trim().toLowerCase();
    
    // Check if input matches any allowed password (or default 'sansevero')
    if (correctPasswords.some(p => p.toLowerCase() === cleaned) || cleaned === 'sansevero' || cleaned === 'soccorso') {
      setError(false);
      onUnlock();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Ambient background blur */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-zinc-700/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center space-y-6">
          {/* Lock Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800/80 border border-white/15 text-white shadow-inner mb-2">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <div>
            <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-300 bg-zinc-800/90 rounded-full mb-3 border border-white/10">
              Protected Preview
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Password Protected Content
            </h2>
            <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
              This documentary video for{' '}
              <strong className="text-zinc-200">{eventTitle}</strong> is password protected.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                className={`w-full rounded-xl bg-black/60 border ${
                  error ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-white/40'
                } px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all pr-10`}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs transition"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-400 text-left flex items-center gap-1.5 animate-shake">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Incorrect password. Please try again.
              </p>
            )}

            <button
              type="submit"
              className="w-full font-heading rounded-xl bg-white text-black font-medium py-3 px-4 text-sm hover:bg-zinc-200 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-white/10"
            >
              Unlock Access
            </button>
          </form>

          <div className="pt-4 border-t border-white/10 flex items-center justify-center">
            <Link
              href="/work"
              className="text-xs text-zinc-500 hover:text-zinc-300 transition flex items-center gap-1"
            >
              ← Return to all events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
