import React from 'react';
import Button from '../../components/utils/Button';
import WordByWordReveal from '../../framermotion/WordReveal';
import groupImg from '../../assets/groupdiscussion.webp'; 
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 0 },
  visible: { opacity: 1, y: 30 },
};

const GroupTeaser = () => {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      transition={{ duration: 1.5, delay: 0.4, ease: 'easeInOut' }}
      className="p-4 sm:p-8 rounded-xl flex flex-col md:flex-row items-center justify-between gap-8 w-full"
    >
      {/* Text Content */}
      <div className="flex-1 w-full text-center md:text-left space-y-2">
        <WordByWordReveal
          text="Group Discussion"
          className="text-xl sm:text-2xl md:text-3xl text-white font-bold mb-4"
          delay={0.6}
        />
        <WordByWordReveal
          text="Join the Conversation"
          className="text-lg sm:text-xl text-white/80"
          delay={0.6}
        />
        <WordByWordReveal
          text="Connect with fellow travelers and share your experiences."
          className="text-base sm:text-lg text-white/50"
          delay={0.3}
        />
        <div className="mt-6 flex justify-center md:justify-start">
          <Button>
            Visit the Group Chat
          </Button>
        </div>
      </div>

      {/* Image */}
      <motion.div
        whileHover={{ scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="max-w-xs md:w-80 h-40 sm:h-48 md:h-44 rounded-xl overflow-hidden flex-shrink-0"
      >
        <img
          src={groupImg}
          alt="Group chat preview"
          className="w-full h-full object-cover rounded-xl"
        />
      </motion.div>
    </motion.div>
  );
};

export default GroupTeaser;
