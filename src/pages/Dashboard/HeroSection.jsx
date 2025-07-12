import { motion } from 'framer-motion';
import React from 'react';
import TypingText from '../../framermotion/TypingText';
import Reveal from '../../framermotion/Reveal';
import WordByWordReveal from '../../framermotion/WordReveal';

const HeroSection = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: -20}}
      animate={{ opacity: 1, y: 5}}
      transition={{
        duration: 1.4,
        ease: 'easeInOut',
        delay: 0.4,
      }}
      className="bg-[url('./assets/hero.jpg')] bg-cover bg-center rounded-2xl overflow-hidden relative text-white p-6 md:p-10 shadow-lg"
    >
      <div className="bg-black/5 p-6 md:p-10 rounded-xl space-y-5">
        {/* Typing animated headline */}
        <TypingText
          text="Welcome back, Piyush"
          className="text-2xl md:text-4xl font-semibold"
           delay={0.19}
        />

        {/* Subtext with WordByWordReveal */}
        <WordByWordReveal
          text="Ready to plan your next adventure? Let's make it unforgettable."
          className="text-sm md:text-base"
          delay={0.26} // Faster delay between words
        />
      
        {/* Button with Reveal */}
        


      {/* Button with Reveal */}
<motion.button
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{
    delay: 1.2, // Appears after text animations
    duration: 1.3,
    ease: "easeOut"
  }}
  whileHover={{
    scale: 1.05,
    transition: { duration: 0.2 }
  }}
  whileTap={{ scale: 0.98 }}
  className="bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600 text-white font-medium py-2 px-5 rounded-xl"
>
  Start Planning
</motion.button>
        
      </div>
    </motion.section>
  );
};

export default HeroSection;