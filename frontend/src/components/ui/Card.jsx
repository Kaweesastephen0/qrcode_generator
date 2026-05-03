import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn.js';

const Card = React.forwardRef(({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  hover = false,
  glass = false,
  gradient = false,
  ...props
}, ref) => {
  const baseStyles = 'rounded-2xl transition-all duration-300';
  
  const variants = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white border-0',
    outlined: 'bg-transparent border-2 border-gray-300',
    ghost: 'bg-transparent',
  };
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };
  
  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  };
  
  const glassStyles = glass ? 'backdrop-blur-lg bg-white/80 border border-white/20' : '';
  const hoverStyles = hover ? 'hover:shadow-xl hover:scale-[1.02] cursor-pointer' : '';
  
  const cardStyles = cn(
    baseStyles,
    variants[variant],
    paddings[padding],
    shadows[shadow],
    glassStyles,
    hoverStyles,
    className
  );

  const motionProps = hover ? {
    whileHover: { 
      scale: 1.02,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  } : {};

  return (
    <motion.div
      ref={ref}
      className={cardStyles}
      {...motionProps}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';

export const CardHeader = React.forwardRef(({
  children,
  className = '',
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-6', className)}
    {...props}
  >
    {children}
  </div>
));

CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef(({
  children,
  className = '',
  ...props
}, ref) => (
  <h3
    ref={ref}
    className={cn('text-2xl font-bold leading-none tracking-tight text-gray-900', className)}
    {...props}
  >
    {children}
  </h3>
));

CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef(({
  children,
  className = '',
  ...props
}, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-600', className)}
    {...props}
  >
    {children}
  </p>
));

CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef(({
  children,
  className = '',
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn('pt-0', className)}
    {...props}
  >
    {children}
  </div>
));

CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef(({
  children,
  className = '',
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-6', className)}
    {...props}
  >
    {children}
  </div>
));

CardFooter.displayName = 'CardFooter';

export default Card;
