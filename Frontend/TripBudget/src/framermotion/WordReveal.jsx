import { motion } from 'framer-motion';
import React from 'react';

const WordByWordReveal = ({ text, delay = 0.15, className = '' }) => {
  const words = text.split(' ');

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: delay,
          },
        },
      }}
      className={className}
    >
      {words.map((word, index) => (
        <React.Fragment key={index}>
          <motion.span
            className="inline-block"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { duration: 0.5 }
              },
            }}
          >
            {word}
          </motion.span>
          {index < words.length - 1 && <span> </span>}
        </React.Fragment>
      ))}
    </motion.div>
  );
};

export default WordByWordReveal;