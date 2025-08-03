import React from 'react';
import Card from '../../components/utils/Card';
import { motion } from 'framer-motion';


const fadeUp = {
  hidden: { opacity: 0, y: 0 },
  visible: { opacity: 1, y: 40 },
};

const TravelStats = () => {
  return (

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full">
      {['Total Trips Planned', 'Average Budget', 'Last Destination'].map((title, index) => (
        <motion.div
          key={index}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{
            duration: 1.4,
            delay: 0.5,
            ease: 'easeInOut',
          }}
          whileHover={{
            scale: 1.04, // just a tiny "towards you" effect
            transition: { type: 'spring', stiffness: 100 },
          }}
          className="w-full"
        >
          <Card className="bg-transparent border border-white/5 rounded-xl p-4 sm:p-6 flex flex-col items-center">
            <h3 className="text-xs sm:text-sm md:text-base uppercase text-white/80 tracking-wide text-center">
              {title}
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-white/ mt-2 text-center">
              {title === 'Total Trips Planned' && 5}
              {title === 'Average Budget' && '\u20b91,200'}
              {title === 'Last Destination' && 'Udaipur'}
            </p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default TravelStats;
