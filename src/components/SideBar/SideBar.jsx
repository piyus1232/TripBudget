import React, { useState } from 'react';
import { FaBars, FaTimes, FaHome, FaMapMarkedAlt, FaSearchLocation, FaUsers, FaPlusCircle, FaCalculator, FaUserCircle } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

function SideBar() {
  const [isOpen, setIsOpen] = useState(false);

  const navoptions = [
    { label: "Dashboard", path: "/DashBoard", icon: <FaHome /> },
    { label: "My Trips", path: "/MyTrips", icon: <FaMapMarkedAlt /> },
    { label: "Explore Cities", path: "/ExploreCities", icon: <FaSearchLocation /> },
    { label: "GroupDiscussions", path: "/GroupDiscussions", icon: <FaUsers /> },
    { label: "Plan a Trip", path: "/planatrip", icon: <FaPlusCircle /> },
    { label: "BudgetEstimator", path: "/budgetestimator", icon: <FaCalculator /> },
  ];

  return (
    <>
      {/* Hamburger Icon */}
      <button
        className="fixed top-4 left-4 z-50 sm:hidden bg-purple-800 p-2 rounded-md text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -250 }}
        animate={{ x: isOpen || window.innerWidth >= 640 ? 0 : -250 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 h-screen w-[260px] sm:w-[280px] md:w-[320px] lg:w-[380px] bg-[#14101d] text-white shadow-lg z-40 flex flex-col transition-all duration-300 ${
          isOpen ? 'block' : 'hidden sm:flex'
        }`}
      >
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto border-t border-white/10">
          <h1 className="text-3xl ml-7 sm:text-4xl font-bold text-purple-400 mb-6 sm:mb-8">Tripbudget</h1>
          <nav className="flex flex-col space-y-2">
            {navoptions.map((item, index) => (
              <NavLink
                to={item.path}
                key={index}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-2 sm:p-3 rounded-lg hover:bg-purple-900 transition-all duration-200 ${
                    isActive ? 'bg-purple-800 font-medium' : 'text-purple-100'
                  }`
                }
              >
                <span className="text-2xl sm:text-3xl">{item.icon}</span>
                <span className="text-lg sm:text-xl">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-3 sm:p-4 border-t border-white/10">
          <NavLink
            to="/account"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center space-x-3 p-2 sm:p-3 rounded-lg hover:bg-purple-900 transition-all duration-200 ${
                isActive ? 'bg-purple-800 font-medium' : 'text-purple-100'
              }`
            }
          >
            <FaUserCircle className="text-3xl sm:text-4xl" />
            <span className="text-lg sm:text-3xl">Account</span>
          </NavLink>
        </div>
      </motion.aside>
    </>
  );
}

export default SideBar;
