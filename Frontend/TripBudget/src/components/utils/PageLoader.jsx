import React from 'react';

/**
 * Full-page loader — matches TripBudget dark theme (#171221, violet accent).
 * Use while waiting for auth or initial API data to avoid white flash.
 */
export default function PageLoader({ message = 'Loading…', subMessage }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-[#171221] px-6 text-white">
      <div className="relative">
        <div
          className="h-14 w-14 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400"
          aria-hidden
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 opacity-90" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-base font-medium text-white">{message}</p>
        {subMessage ? (
          <p className="mt-2 max-w-sm text-sm text-slate-400">{subMessage}</p>
        ) : null}
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-violet-500/60 animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
