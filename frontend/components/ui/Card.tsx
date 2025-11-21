import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  glow = false,
  onClick,
  hover = true
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { scale: 1.02 } : {}}
      onClick={onClick}
      className={`glass-card ${className} ${
        glow ? 'shadow-lg shadow-primary/20' : ''
      } ${onClick ? 'cursor-pointer' : ''}`} 
    >
      {children}
    </motion.div>
  );
};