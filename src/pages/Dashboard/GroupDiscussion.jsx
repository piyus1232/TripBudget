import React from 'react';
import Button from '../../components/Button';
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
      className="p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6"
    >
      {/* Text Content */}
      <div className="flex-1 w-full text-center md:text-left">
         <WordByWordReveal
          text="Group Discussion"
          className="text-xl text-white font-bold mb-10"
          delay={0.6}
        />
        
        <WordByWordReveal
          text="Join the Conversation"
          className="text-lg text-white/80"
          delay={0.6}
        />
        <WordByWordReveal
          text="Connect with fellow travelers and share your experiences."
          className="text-lg text-white/50"
          delay={0.3}
        />

        <div className="mt-6">
          <Button>
            Visit the Group Chat
          </Button>
        </div>
      </div>

      {/* Image */}
      <motion.div
  whileHover={{ scale: 1.03 }}
  transition={{ type: 'spring', stiffness: 100 }}
  className="w-full max-w-sm h-48 md:w-80 md:h-44 rounded-xl overflow-hidden"
>
      <div className="w-full max-w-sm h-48 md:w-80 md:h-44 rounded-xl overflow-hidden">
        <img
        
          src={groupImg}
          alt="Group chat preview"
          className="w-full h-full object-cover rounded-xl"
        />
      </div>
      </motion.div>
    </motion.div>
  );
};

export default GroupTeaser;
