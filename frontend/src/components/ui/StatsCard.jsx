import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const StatsCard = React.forwardRef(({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  description,
  className = '',
  variant = 'default',
  size = 'md',
  ...props
}, ref) => {
  const getTrendIcon = () => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decrease':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600 bg-green-50';
      case 'decrease':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const variants = {
    default: 'bg-white border border-gray-200',
    primary: 'bg-blue-50 border border-blue-200',
    glass: 'bg-white/80 backdrop-blur-lg border border-white/20',
  };

  const sizes = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const motionProps = {
    whileHover: { 
      scale: 1.02,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  };

  return (
    <motion.div
      ref={ref}
      className={cn(
        'rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300',
        variants[variant],
        sizes[size],
        className
      )}
      {...motionProps}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          
          {change && (
            <div className="flex items-center mt-2">
              <div className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', getChangeColor())}>
                {getTrendIcon()}
                <span className="ml-1">{change}</span>
              </div>
            </div>
          )}
          
          {description && (
            <p className="text-sm text-gray-500 mt-2">{description}</p>
          )}
        </div>
        
        {Icon && (
          <div className="ml-4 p-3 bg-blue-50 rounded-xl">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        )}
      </div>
    </motion.div>
  );
});

StatsCard.displayName = 'StatsCard';

export default StatsCard;
