import React from 'react';
import { motion } from 'framer-motion';

export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const pageTransition = { duration: 0.24, ease: 'easeOut' };

const PageTransition = ({ children }) => (
  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
    {children}
  </motion.div>
);

export default PageTransition;
