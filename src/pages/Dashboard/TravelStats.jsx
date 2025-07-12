// src/Pages/Dashboard/TravelStats.jsx

import React from 'react';
import Card from '../../components/Card'; // ✅ your custom wrapper component
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 0 },
  visible: { opacity: 1, y: 40 },
};

const TravelStats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {['Total Trips Planned', 'Average Budget', 'Last Destination'].map((title, index) => (
        <motion.div
          key={index}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{
            duration: 1.6,
            delay: index * 0.2,
            ease: 'easeInOut',
          }}
        >
          <Card className="bg-transparent border border-white/10 rounded-xl p-4">
            <h3 className="text-xs uppercase text-white/80 tracking-wide">
              {title}
            </h3>
            <p className="text-2xl font-bold text-white mt-2">
              {title === 'Total Trips Planned' && 5}
              {title === 'Average Budget' && '₹1,200'}
              {title === 'Last Destination' && 'Udaipur'}
            </p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default TravelStats;
