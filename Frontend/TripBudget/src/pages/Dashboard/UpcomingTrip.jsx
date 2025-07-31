import React from 'react';
import { motion } from 'framer-motion';
import Button from '../../components/utils/Button';
import WordByWordReveal from '../../framermotion/WordReveal';
import upcomingImg from '../../assets/upcoming.webp';

const fadeUp = {
  hidden: { opacity: 0, y: 0 },
  visible: { opacity: 1, y: 40 },
};

const UpcomingTrip = () => {
  return (
    <motion.div
      key="upcoming"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      transition={{ duration: 1.5, delay: 0.4, ease: 'easeInOut' }}
      className="p-4 sm:p-8 rounded-xl flex flex-col md:flex-row items-center md:items-start justify-between gap-8 w-full min-h-[210px]"
    >
      {/* Left Info Section */}
      <div className="flex-1 w-full text-center md:text-left space-y-2">
        <WordByWordReveal
          text="UpComing Trip"
          className="text-xl sm:text-2xl md:text-3xl text-white font-bold "
          delay={0.6}
        />
        <WordByWordReveal
          text="Summer in Mumbai"
          className="text-lg sm:text-xl text-white/80 mt-4"
          delay={0.4}
        />
        <WordByWordReveal
          text="4th–10th August"
          className="text-base sm:text-lg text-white/50 mb-6"
          delay={0.6}
        />
        <div className="mb-6 flex justify-center md:justify-start">
          <Button>View Trip</Button>
        </div>
      </div>

      {/* Right Image Section */}
      <motion.div
        whileHover={{ scale: 1.03 }}
        className="max-w-xs md:w-80 h-40 sm:h-48 md:h-44 rounded-xl overflow-hidden flex-shrink-0"
      >
        <img
          src={upcomingImg}
          alt="Upcoming trip"
          className="w-full h-full object-cover rounded-xl"
        />
      </motion.div>
    </motion.div>
  );
};

export default UpcomingTrip;
