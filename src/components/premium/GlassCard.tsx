'use client';

import React, { forwardRef } from 'react';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Enable gradient border effect */
  gradient?: boolean;
  /** Enable hover animation */
  hover?: boolean;
  /** Glow effect color */
  glow?: string;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      className = '',
      gradient = false,
      hover = true,
      glow,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      relative rounded-2xl bg-white/70 backdrop-blur-xl 
      border border-white/20 shadow-lg
      transition-all duration-300 ease-out
    `;

    const gradientStyles = gradient
      ? 'before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-br before:from-emerald-400/50 before:via-teal-400/50 before:to-indigo-400/50 before:-z-10'
      : '';

    const hoverStyles = hover
      ? 'hover:-translate-y-1 hover:shadow-2xl hover:bg-white/80'
      : '';

    const glowStyle = glow
      ? `hover:shadow-${glow}/25`
      : '';

    return (
      <div
        ref={ref}
        className={`
          ${baseStyles}
          ${gradientStyles}
          ${hoverStyles}
          ${glowStyle}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        style={{
          ...(glow ? { '--tw-shadow-color': glow } as React.CSSProperties : {}),
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

// Gradient Border Wrapper for more control
export interface GlassCardGradientProps {
  children: React.ReactNode;
  className?: string;
  from?: string;
  via?: string;
  to?: string;
}

export const GlassCardGradient: React.FC<GlassCardGradientProps> = ({
  children,
  className = '',
  from = 'from-emerald-400/50',
  via = 'via-teal-400/50',
  to = 'to-indigo-400/50',
}) => {
  return (
    <div className={`relative rounded-2xl p-[1px] bg-gradient-to-br ${from} ${via} ${to} ${className}`}>
      <div className="rounded-2xl bg-white/70 backdrop-blur-xl h-full">
        {children}
      </div>
    </div>
  );
};

// Dark variant for dashboard sections
export const GlassCardDark: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hover = true,
  ...props
}) => {
  const baseStyles = `
    relative rounded-2xl bg-slate-900/70 backdrop-blur-xl 
    border border-white/10 shadow-lg
    transition-all duration-300 ease-out text-white
    ${hover ? 'hover:-translate-y-1 hover:shadow-2xl hover:bg-slate-900/80' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={baseStyles} {...props}>
      {children}
    </div>
  );
};

export default GlassCard;
