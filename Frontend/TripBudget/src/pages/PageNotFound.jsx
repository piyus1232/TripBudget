import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * 404 — matches TripBudget theme: #171221, blue/cyan gradients, violet accents.
 */
export default function PageNotFound() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#171221] text-white">
      {/* Ambient orbs (same language as Landing) */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute top-1/2 left-0 h-64 w-64 -translate-y-1/2 rounded-full bg-violet-600/10 blur-3xl"
          aria-hidden
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg text-center"
        >
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-cyan-400/80">
            TripBudget
          </p>
          <h1 className="text-8xl font-black leading-none sm:text-9xl">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
              404
            </span>
          </h1>
          <h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl">
            Page not found
          </h2>
          <p className="mx-auto mt-4 max-w-md text-slate-400">
            This route doesn’t exist or was moved. Double-check the URL or head back
            to plan your next trip.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-400 hover:to-cyan-400"
            >
              Back to home
            </Link>
            <Link
              to="/plantrip"
              className="inline-flex items-center justify-center rounded-xl border border-slate-600 bg-[#1f1a2e] px-8 py-3.5 text-base font-semibold text-slate-200 transition hover:border-cyan-500/50 hover:bg-[#252038]"
            >
              Plan a trip
            </Link>
          </div>

          <div className="mt-14 flex justify-center gap-8 text-sm text-slate-500">
            <Link to="/dashboard" className="hover:text-cyan-400 transition">
              Dashboard
            </Link>
            <Link to="/Contact" className="hover:text-cyan-400 transition">
              Contact
            </Link>
            <Link to="/about" className="hover:text-cyan-400 transition">
              About
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
