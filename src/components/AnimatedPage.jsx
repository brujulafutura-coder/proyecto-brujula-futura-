import { motion } from 'framer-motion';

const pageVariants = {
  initial:  { opacity: 0, y: 30, scale: 0.98 },
  animate:  { opacity: 1, y: 0, scale: 1 },
  exit:     { opacity: 0, y: -20, scale: 0.98 },
};

const pageTransition = {
  type: 'spring',
  stiffness: 260,
  damping: 25,
  duration: 0.4,
};

export default function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      style={{ width: '100%', minHeight: '100vh' }}
    >
      {children}
    </motion.div>
  );
}
