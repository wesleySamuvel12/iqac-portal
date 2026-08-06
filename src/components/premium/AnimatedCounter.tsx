'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface AnimatedCounterProps {
  /** Target value to count to */
  value: number;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Prefix string (e.g., "+", "$") */
  prefix?: string;
  /** Suffix string (e.g., "%", "k") */
  suffix?: string;
  /** Number of decimal places */
  decimals?: number;
  /** Start counting on mount */
  startOnMount?: boolean;
  /** Easing function type */
  easing?: 'linear' | 'easeOut' | 'easeInOut' | 'bounce';
  /** Additional CSS classes */
  className?: string;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Separator for thousands (e.g., ",") */
  separator?: string;
}

// Easing functions
const easingFunctions = {
  linear: (t: number) => t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  bounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
};

// Format number with separators
const formatNumber = (
  num: number,
  decimals: number,
  separator: string
): string => {
  const fixed = num.toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');
  
  if (!separator) return fixed;
  
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return decimals > 0 ? `${formattedInt}.${decPart}` : formattedInt;
};

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0,
  startOnMount = true,
  easing = 'easeOut',
  className = '',
  onComplete,
  separator = ',',
}) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const hasCompletedRef = useRef(false);
  
  // Store the latest callback in a ref to avoid stale closure issues
  const valueRef = useRef(value);
  valueRef.current = value;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easingFunctions[easing](progress);
    
    setCurrentValue(easedProgress * valueRef.current);

    if (progress < 1) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      setCurrentValue(valueRef.current);
      setIsAnimating(false);
      hasCompletedRef.current = true;
      onCompleteRef.current?.();
    }
  }, [duration, easing]);

  const startAnimation = useCallback(() => {
    // Reset
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    startTimeRef.current = null;
    hasCompletedRef.current = false;
    setIsAnimating(true);
    
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [animate]);

  useEffect(() => {
    if (startOnMount) {
      startAnimation();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [startOnMount, startAnimation]);

  const displayValue = formatNumber(currentValue, decimals, separator);

  return (
    <span 
      className={`tabular-nums ${className}`}
      aria-label={`${prefix}${value}${suffix}`}
    >
      {prefix}{displayValue}{suffix}
    </span>
  );
};

// Hook version for more control
export function useAnimatedCounter(
  targetValue: number,
  options: Omit<AnimatedCounterProps, 'value' | 'className'> = {}
) {
  const [currentValue, setCurrentValue] = useState(0);
  const {
    duration = 2000,
    easing = 'easeOut',
    decimals = 0,
    separator = ',',
  } = options;

  const animateTo = useCallback((target: number) => {
    const startTime = performance.now();
    const startValue = currentValue;

    const step = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFunctions[easing](progress);
      
      setCurrentValue(startValue + (target - startValue) * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCurrentValue(target);
      }
    };

    requestAnimationFrame(step);
  }, [currentValue, duration, easing]);

  useEffect(() => {
    animateTo(targetValue);
  }, [targetValue, animateTo]);

  return {
    value: formatNumber(currentValue, decimals, separator),
    rawValue: currentValue,
  };
}

// Compact inline counter for stats
export interface CounterBadgeProps extends Omit<AnimatedCounterProps, 'className'> {
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'emerald' | 'indigo' | 'amber' | 'red' | 'teal';
}

export const CounterBadge: React.FC<CounterBadgeProps> = ({
  size = 'md',
  color = 'default',
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-lg font-semibold',
    md: 'text-2xl font-bold',
    lg: 'text-4xl font-bold',
  };

  const colorClasses = {
    default: 'text-slate-900',
    emerald: 'text-emerald-600',
    indigo: 'text-indigo-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
    teal: 'text-teal-600',
  };

  return (
    <AnimatedCounter
      {...props}
      className={`${sizeClasses[size]} ${colorClasses[color]}`}
    />
  );
};

export default AnimatedCounter;
