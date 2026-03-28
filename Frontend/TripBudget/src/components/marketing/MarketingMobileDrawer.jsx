import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

/**
 * Shared hamburger drawer for Landing / About / Contact.
 * Portals to document.body so parent nav overflow/stacking never hides links.
 */
export function MarketingMobileDrawer({ open, onClose, onLogin, onRegister }) {
  const location = useLocation();
  const navigate = useNavigate();

  if (typeof document === 'undefined') return null;

  const goHome = () => {
    onClose();
    navigate('/');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    });
  };

  const linkInactive = 'text-slate-200 hover:bg-white/5 hover:text-white';
  const linkActive = 'bg-white/10 text-blue-400';

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            key="mnav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Close menu"
            className="fixed inset-0 z-[200] bg-black/65 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
          <motion.aside
            key="mnav-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.28 }}
            className="fixed inset-y-0 right-0 z-[210] flex w-[min(100%,20rem)] max-w-xs flex-col border-l border-slate-800 bg-slate-950 shadow-2xl md:hidden"
            aria-label="Mobile navigation"
          >
            <div className="flex min-h-0 max-h-[100dvh] flex-col overflow-y-auto overscroll-contain p-6">
              <div className="mb-4 flex shrink-0 items-center justify-between">
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-xl font-bold text-transparent">
                  TripBudget
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="flex shrink-0 flex-col gap-1 pb-4" aria-label="Primary">
                <button
                  type="button"
                  onClick={goHome}
                  className={`rounded-xl px-3 py-3 text-left text-lg font-medium transition-colors ${
                    location.pathname === '/' ? linkActive : linkInactive
                  }`}
                >
                  Home
                </button>
                <NavLink
                  to="/about"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-3 text-lg font-medium transition-colors ${isActive ? linkActive : linkInactive}`
                  }
                >
                  About
                </NavLink>
                {/* <NavLink
                  to="/ExploreCities"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-3 text-lg font-medium transition-colors ${isActive ? linkActive : linkInactive}`
                  }
                >
                  All destinations
                </NavLink> */}
                <NavLink
                  to="/contact"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-3 text-lg font-medium transition-colors ${isActive ? linkActive : linkInactive}`
                  }
                >
                  Contact us
                </NavLink>
              </nav>

              <div className="mt-auto flex shrink-0 flex-col gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={onRegister}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 text-lg font-semibold text-white"
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={onLogin}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 text-lg font-semibold text-white"
                >
                  Login
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
