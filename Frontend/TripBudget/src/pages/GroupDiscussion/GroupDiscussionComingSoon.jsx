import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Sparkles, UsersRound, Route, Bell } from 'lucide-react';
import SideBar from '../../components/SideBar/SideBar';
import groupImg from '../../assets/groupdiscussion.webp';

const fade = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

const features = [
  {
    icon: MessageCircle,
    title: 'Traveler threads',
    text: 'Ask questions and swap itineraries with people planning similar trips.',
  },
  {
    icon: Route,
    title: 'Route & budget talk',
    text: 'Compare trains, stays, and costs before you commit.',
  },
  {
    icon: Bell,
    title: 'Stay in the loop',
    text: 'We will notify you when discussions go live.',
  },
];

export default function GroupDiscussionComingSoon() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#171221] text-white sm:flex-row">
      <SideBar />

      <main className="relative flex-1 overflow-hidden pt-14 pb-8 transition-all duration-300 sm:ml-[280px] sm:pt-2 md:ml-[300px]">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -right-20 top-0 h-[420px] w-[420px] rounded-full bg-violet-600/15 blur-3xl"
            aria-hidden
          />
          <div
            className="absolute -left-32 bottom-0 h-[380px] w-[380px] rounded-full bg-cyan-500/10 blur-3xl"
            aria-hidden
          />
          <div
            className="absolute left-1/2 top-1/3 h-px w-[min(80%,720px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"
            aria-hidden
          />
        </div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
          {/* Top label */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center gap-2 pt-2"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-cyan-300/90">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Community
            </span>
            <span className="text-sm text-slate-500">TripBudget</span>
          </motion.div>

          {/* Hero card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#1e1830] via-[#171221] to-[#14101c] p-6 shadow-2xl shadow-black/40 sm:p-10 md:p-12"
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative grid gap-10 lg:grid-cols-[1fr_min(280px,40%)] lg:items-center lg:gap-12">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-500/[0.12] px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-100/95">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
                  </span>
                  Coming soon
                </div>

                <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                  <span className="bg-gradient-to-r from-white via-cyan-100 to-cyan-300/90 bg-clip-text text-transparent">
                    Group discussions
                  </span>
                </h1>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
                  A dedicated space to connect with fellow travelers—share experiences, compare
                  plans, and discover ideas before your next trip.
                </p>

                <ul className="mt-8 space-y-4">
                  {features.map((f, i) => (
                    <motion.li
                      key={f.title}
                      custom={i}
                      variants={fade}
                      initial="hidden"
                      animate="visible"
                      className="flex gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-sm transition hover:border-cyan-500/20"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-cyan-300">
                        <f.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                      </span>
                      <div>
                        <p className="font-semibold text-slate-100">{f.title}</p>
                        <p className="mt-0.5 text-sm text-slate-500">{f.text}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>

                <div className="mt-10 flex flex-wrap gap-3">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:from-blue-400 hover:to-cyan-400 sm:px-8 sm:text-base"
                  >
                    Back to dashboard
                  </Link>
                  <Link
                    to="/plantrip"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-600/80 bg-[#1a1524] px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-500/40 hover:bg-[#221c30] sm:px-8 sm:text-base"
                  >
                    Plan a trip
                  </Link>
                </div>
              </div>

              {/* Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="relative mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 shadow-xl">
                  <img
                    src={groupImg}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#171221] via-transparent to-transparent opacity-90" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-md">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300">
                      <UsersRound className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">Traveler community</p>
                      <p className="text-xs text-slate-400">Launching after this feature ships</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-slate-600"
          >
            Have ideas? Use{' '}
            <Link to="/Contact" className="text-cyan-500/90 underline-offset-4 hover:text-cyan-400 hover:underline">
              Contact
            </Link>{' '}
            to reach us.
          </motion.p>
        </div>
      </main>
    </div>
  );
}
