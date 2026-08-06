'use client';

import React, { useState, useEffect } from 'react';

export interface ProgressRingProps {
  /** Progress percentage (0-100) */
  progress: number;
  /** Size of the ring in pixels */
  size?: number;
  /** Stroke width in pixels */
  strokeWidth?: number;
  /** Center text content */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Color variant or custom color */
  color?: 'emerald' | 'indigo' | 'amber' | 'red' | 'teal' | 'violet' | 'gradient';
  /** Animation duration in ms */
  animationDuration?: number;
  /** Show percentage text automatically */
  showPercentage?: boolean;
  /** Custom label for center */
  label?: string;
  /** Background track color */
  trackColor?: string;
}

const colorMap = {
  emerald: {
    primary: '#10b981',
    light: '#34d399',
    gradient: ['#10b981', '#34d399'],
  },
  indigo: {
    primary: '#6366f1',
    light: '#818cf8',
    gradient: ['#6366f1', '#818cf8'],
  },
  amber: {
    primary: '#f59e0b',
    light: '#fbbf24',
    gradient: ['#f59e0b', '#fbbf24'],
  },
  red: {
    primary: '#ef4444',
    light: '#f87171',
    gradient: ['#ef4444', '#f87171'],
  },
  teal: {
    primary: '#14b8a6',
    light: '#2dd4bf',
    gradient: ['#14b8a6', '#2dd4bf'],
  },
  violet: {
    primary: '#8b5cf6',
    light: '#a78bfa',
    gradient: ['#8b5cf6', '#a78bfa'],
  },
  gradient: {
    primary: '#10b981',
    light: '#8b5cf6',
    gradient: ['#10b981', '#14b8a6', '#6366f1', '#8b5cf6'],
  },
};

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  children,
  className = '',
  color = 'emerald',
  animationDuration = 1500,
  showPercentage = false,
  label,
  trackColor = '#e2e8f0',
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedProgress / 100) * circumference;
  
  const colors = colorMap[color];
  const center = size / 2;

  useEffect(() => {
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progressRatio = Math.min(elapsed / animationDuration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progressRatio, 3);
      setAnimatedProgress(eased * Math.min(progress, 100));
      
      if (progressRatio < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [progress, animationDuration]);

  // Determine color based on percentage if gradient
  const getStrokeColor = () => {
    if (color === 'gradient') {
      return `url(#gradient-${color})`;
    }
    return colors.primary;
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Gradient definition */}
        {color === 'gradient' && (
          <defs>
            <linearGradient
              id={`gradient-${color}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              {colors.gradient.map((c, i) => (
                <stop
                  key={i}
                  offset={`${(i / (colors.gradient.length - 1)) * 100}%`}
                  stopColor={c}
                />
              ))}
            </linearGradient>
          </defs>
        )}
        
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          opacity={0.3}
        />
        
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.3s ease',
            filter: color === 'gradient' ? 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.4))' : `drop-shadow(0 0 4px ${colors.primary}40)`,
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children || (
          <>
            {showPercentage && (
              <span className="text-2xl font-bold text-slate-800">
                {Math.round(animatedProgress)}%
              </span>
            )}
            {label && (
              <span className="text-xs text-slate-500 mt-0.5">{label}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Mini version for inline use
export interface ProgressRingMiniProps extends Omit<ProgressRingProps, 'size' | 'strokeWidth'> {
  size?: number;
}

export const ProgressRingMini: React.FC<ProgressRingMiniProps> = ({ 
  size = 48, 
  ...props 
}) => {
  return <ProgressRing {...props} size={size} strokeWidth={4} />;
};

// With animated counter inside
// ProgressRingWithCounter uses the same props as ProgressRing minus children and showPercentage
export type ProgressRingWithCounterProps = Omit<ProgressRingProps, 'children' | 'showPercentage'>;

export const ProgressRingWithCounter: React.FC<ProgressRingWithCounterProps> = (props) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const ratio = Math.min(elapsed / (props.animationDuration || 1500), 1);
      const eased = 1 - Math.pow(1 - ratio, 3);
      setDisplayValue(Math.round(eased * props.progress));
      if (ratio < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [props.progress, props.animationDuration]);

  return (
    <ProgressRing {...props}>
      <span className="text-2xl font-bold text-slate-800">{displayValue}</span>
      {props.label && (
        <span className="text-xs text-slate-500 mt-0.5">{props.label}</span>
      )}
    </ProgressRing>
  );
};

// Status indicator ring (small dot)
export interface StatusDotProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: number;
  pulse?: boolean;
  label?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({
  status,
  size = 12,
  pulse = true,
  label,
}) => {
  const statusColors = {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    neutral: '#94a3b8',
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-block rounded-full ${pulse ? 'animate-pulse' : ''}`}
        style={{
          width: size,
          height: size,
          backgroundColor: statusColors[status],
          boxShadow: `0 0 ${size}px ${statusColors[status]}60`,
        }}
      />
      {label && (
        <span className="text-sm text-slate-600">{label}</span>
      )}
    </div>
  );
};

export default ProgressRing;
