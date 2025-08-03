'use client';

import React, { useState } from 'react';
import {
  FaBars,
  FaTimes,
  FaHome,
  FaMapMarkedAlt,
  FaSearchLocation,
  FaUsers,
  FaPlusCircle,
  FaCalculator,
  FaUserCircle
} from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

function SideBar({ initial, animate, transition }) {
  const [isOpen, setIsOpen] = useState(false);

  const navoptions = [
    { label: "Dashboard", path: "/DashBoard", icon: <FaHome /> },
    { label: "My Trips", path: "/MyTrips", icon: <FaMapMarkedAlt /> },
    { label: "Explore Cities", path: "/ExploreCities", icon: <FaSearchLocation /> },
    { label: "GroupDiscussions", path: "/GroupDiscussions", icon: <FaUsers /> },
    { label: "Plan a Trip", path: "/plantrip", icon: <FaPlusCircle /> },
    { label: "BudgetEstimator", path: "/budgetestimator", icon: <FaCalculator /> },
  ];

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        className="fixed top-4 left-4 z-50 sm:hidden bg-purple-800 p-2 rounded-md text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={initial}
        animate={animate}
        transition={transition}
        className={`fixed top-0 left-0 h-screen bg-[#171221] text-white shadow-lg z-40 flex flex-col w-[240px] sm:w-[260px] md:w-[280px] lg:w-[300px] transition-all duration-300
          ${isOpen ? 'block' : 'hidden sm:flex'}`}
          
      >
          <div className="absolute right-0 top-0 h-full w-[1px] bg-white/5"></div>
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <h1 className="text-2xl sm:text-3xl font-bold text-purple-500">TripBudget</h1>
        </div>
{/* <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-blue-400/30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div> */}

    {/* <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rotate-45 animate-bounce" style={{animationDelay: '0s', animationDuration: '6s'}} />
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full animate-pulse" style={{animationDelay: '2s', animationDuration: '4s'}} />
        <div className="absolute bottom-40 left-1/4 w-12 h-12 bg-gradient-to-br from-green-500/10 to-teal-500/10 rotate-12 animate-spin" style={{animationDuration: '20s'}} />
      </div> */}

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <nav className="flex flex-col space-y-2">
            {navoptions.map((item, index) => (
              <NavLink
                to={item.path}
                key={index}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-900 transition duration-200 ${
                    isActive ? 'bg-purple-800 font-semibold' : 'text-purple-100'
                  }`
                }
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-base">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Account Link */}
        <div className="p-4 border-t border-white/10">
          <NavLink
            to="/account"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-900 transition duration-200 ${
                isActive ? 'bg-purple-800 font-semibold' : 'text-purple-100'
              }`
            }
          >
            <FaUserCircle className="text-xl" />
            <span className="text-base">Account</span>
          </NavLink>
        </div>
      </motion.aside>
    </>
  );
}

export default SideBar;
