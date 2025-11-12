import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  glow = false,
  onClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`glass-card bg-purple-800/30 border-purple-500/30 ${className} ${
        glow ? 'shadow-lg shadow-primary/20' : ''
      } ${onClick ? 'cursor-pointer' : ''}`} 
    >
      {children}
    </motion.div>
  );
};
