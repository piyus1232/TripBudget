// src/framermotion/Reveal.jsx
import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

const Reveal = ({
  children,
  width = 'fit-content',
  animateOnce = true,
  slideAnimation = false, // disabled by default now
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: animateOnce });

  const mainControls = useAnimation();
  const slideControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start('visible');
      slideControls.start('visible');
    }
  }, [isInView]);

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        width,
        overflow: 'hidden',
        willChange: 'transform, opacity', // improves animation performance
      }}
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 60 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {children}
      </motion.div>

      {slideAnimation && (
        <motion.div
          variants={{
            hidden: { left: 0 },
            visible: { left: '100%' },
          }}
          initial="hidden"
          animate={slideControls}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: 4,
            bottom: 4,
            left: 0,
            right: 0,
            background: '#22c55e', // test overlay (disable if not needed)
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
};

export default Reveal;
