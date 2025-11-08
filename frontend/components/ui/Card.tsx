import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  glow = false 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card bg-purple-800/30 border-purple-500/30 ${className} ${
        glow ? 'shadow-lg shadow-primary/20' : ''
      }`}
    >
      {children}
    </motion.div>
  );
};