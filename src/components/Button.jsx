import React from 'react'
import { motion } from 'framer-motion'

function Button({
    className='',
    children,

    ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.03 }}
      className={`bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600 text-white font-medium py-2 px-5 rounded-xl transition-all ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export default Button