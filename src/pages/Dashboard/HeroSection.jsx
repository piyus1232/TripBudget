import { motion } from 'framer-motion';
import React from 'react';
import TypingText from '../../framermotion/TypingText';
import WordByWordReveal from '../../framermotion/WordReveal';
import Button from '../../components/Button';
import heroImg from '../../assets/hero.jpg';

const HeroSection = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 5 }}
      transition={{
        duration: 1.2,
        ease: 'easeInOut',
        delay: 0.4,
      }}
      style={{ backgroundImage: `url(${heroImg})` }}
      className="bg-cover bg-center rounded-2xl overflow-hidden relative text-white p-4 sm:p-6 md:p-10 shadow-lg"
    >
      <div className=" p-4 sm:p-6 md:p-10 rounded-xl space-y-4 sm:space-y-5 text-center md:text-left">
        {/* Typing animated headline */}
        <TypingText
          text="Welcome back, Piyush"
          className="text-xl sm:text-2xl md:text-4xl font-semibold"
          delay={0.12}
        />

        {/* Subtext */}
        <WordByWordReveal
          text="Ready to plan your next adventure? Let's make it unforgettable."
          className="text-sm sm:text-base md:text-lg"
          delay={0.26}
        />

        {/* Button */}
        <div className="mt-6 sm:mt-8">
          <Button>Start Planning</Button>
        </div>
      </div>
    </motion.section>
  );
};

export default HeroSection;
