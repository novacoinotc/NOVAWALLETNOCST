'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'neon';
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      hoverable = false,
      padding = 'md',
      className = '',
      ...props
    },
    ref
  ) => {
    const variants = {
      default: 'bg-card border border-border',
      glass: 'glass',
      neon: 'bg-card neon-border',
    };

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    return (
      <motion.div
        ref={ref}
        initial={hoverable ? { scale: 1 } : undefined}
        whileHover={hoverable ? { scale: 1.02 } : undefined}
        className={`
          rounded-2xl
          ${variants[variant]}
          ${paddings[padding]}
          ${hoverable ? 'cursor-pointer transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
