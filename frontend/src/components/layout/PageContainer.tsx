import React from 'react';
import { motion } from 'framer-motion';

interface PageContainerProps {
  children: React.ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        maxWidth: 1180,
        margin: '0 auto',
        padding: '2rem 2rem',
      }}
    >
      {children}
    </motion.main>
  );
}
