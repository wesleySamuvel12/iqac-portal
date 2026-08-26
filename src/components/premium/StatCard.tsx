'use client';

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  type LucideIcon 
} from 'lucide-react';
import GlassCard, { GlassCardDark } from './GlassCard';
import AnimatedCounter, { CounterBadge } from './AnimatedCounter';

export type ColorVariant = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal' | 'indigo' | 'amber';

export interface StatCardProps {
  /** Main statistic value */
  value: number;
  /** Card title/label */
  title: string;
  /** Description or subtitle */
  description?: string;
  /** Icon component */
  icon?: LucideIcon;
  /** Color variant for icon background */
  color?: ColorVariant;
  /** Trend percentage (positive = up, negative = down) */
  trend?: number;
  /** Trend label (e.g., "vs last month") */
  trendLabel?: string;
  /** Prefix for the counter */
  prefix?: string;
  /** Suffix for the counter */
  suffix?: string;
  /** Use glassmorphism variant */
  glass?: boolean;
  /** Use dark theme */
  dark?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Action button or element */
  action?: React.ReactNode;
  /** Show compact version */
  compact?: boolean;
}

const colorVariants: Record<ColorVariant, { bg: string; icon: string; text: string; gradient: string }> = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    text: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600',
  },
  green: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    text: 'text-emerald-600',
    gradient: 'from-emerald-500 to-teal-500',
  },
  purple: {
    bg: 'bg-violet-50',
    icon: 'text-violet-600',
    text: 'text-violet-600',
    gradient: 'from-violet-500 to-purple-600',
  },
  orange: {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    text: 'text-amber-600',
    gradient: 'from-amber-500 to-amber-600',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    text: 'text-red-600',
    gradient: 'from-red-500 to-rose-500',
  },
  teal: {
    bg: 'bg-teal-50',
    icon: 'text-teal-600',
    text: 'text-teal-600',
    gradient: 'from-teal-500 to-cyan-500',
  },
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'text-indigo-600',
    text: 'text-indigo-600',
    gradient: 'from-indigo-500 to-violet-500',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    text: 'text-amber-600',
    gradient: 'from-amber-500 to-yellow-500',
  },
};

const StatCard: React.FC<StatCardProps> = ({
  value,
  title,
  description,
  icon: Icon,
  color = 'emerald',
  trend,
  trendLabel,
  prefix = '',
  suffix = '',
  glass = true,
  dark = false,
  className = '',
  action,
  compact = false,
}) => {
  const colors = colorVariants[color] || colorVariants.green;
  
  const isPositiveTrend = trend !== undefined && trend > 0;
  const isNegativeTrend = trend !== undefined && trend < 0;
  const isNeutralTrend = trend === 0;

  const TrendIcon = isPositiveTrend ? TrendingUp : isNegativeTrend ? TrendingDown : Minus;

  if (dark) {
    return (
      <GlassCardDark hover className={className}>
        <div className={`p-${compact ? '4' : '6'} w-full`}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-400 truncate">{title}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <CounterBadge
                  value={value}
                  prefix={prefix}
                  suffix={suffix}
                  size={compact ? 'md' : 'lg'}
                  color="default"
                />
              </div>
              {(trend !== undefined || description) && (
                <div className="mt-2 flex items-center gap-2">
                  {trend !== undefined && (
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        isPositiveTrend
                          ? 'text-emerald-400 bg-emerald-400/10'
                          : isNegativeTrend
                          ? 'text-red-400 bg-red-400/10'
                          : 'text-slate-400 bg-slate-400/10'
                      }`}
                    >
                      <TrendIcon className="w-3 h-3" />
                      {Math.abs(trend)}%
                    </span>
                  )}
                  {description && (
                    <span className="text-xs text-slate-500">{description}</span>
                  )}
                </div>
              )}
            </div>
            {Icon && (
              <div className={`p-3 rounded-xl bg-gradient-to-br ${colors.gradient} shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        </div>
      </GlassCardDark>
    );
  }

  // Use conditional rendering based on glass prop
  const cardClassName = "rounded-2xl bg-white border border-slate-200 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl";
  
  const cardContent = (
    <div className={`p-${compact ? '4' : '6'} w-full`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <CounterBadge
              value={value}
              prefix={prefix}
              suffix={suffix}
              size={compact ? 'md' : 'lg'}
              color={color === 'green' ? 'emerald' : color === 'teal' ? 'teal' : color as any}
            />
          </div>
          
          {/* Trend and Description */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {trend !== undefined && (
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  isPositiveTrend
                    ? 'text-emerald-700 bg-emerald-50'
                    : isNegativeTrend
                    ? 'text-red-700 bg-red-50'
                    : 'text-slate-600 bg-slate-100'
                }`}
              >
                <TrendIcon className={`w-3 h-3 ${isPositiveTrend ? '' : isNegativeTrend ? '' : ''}`} />
                {Math.abs(trend)}%
                {trendLabel && <span className="text-slate-400 ml-1">{trendLabel}</span>}
              </span>
            )}
            {description && !compact && (
              <span className="text-xs text-slate-400">{description}</span>
            )}
          </div>
        </div>

        {/* Icon */}
        {Icon && (
          <div className={`flex-shrink-0 p-3 rounded-2xl bg-gradient-to-br ${colors.gradient} shadow-lg shadow-${color}-200/50`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}

        {/* Action */}
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );

  if (glass) {
    return (
      <GlassCard className={cardClassName} hover={true}>
        {cardContent}
      </GlassCard>
    );
  }

  return (
    <div className={cardClassName}>
      {cardContent}
    </div>
  );
};

// Compact inline stat for dashboards
export interface InlineStatProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  color?: ColorVariant;
}

export const InlineStat: React.FC<InlineStatProps> = ({
  label,
  value,
  prefix = '',
  suffix = '',
  color = 'emerald',
}) => {
  const colors = colorVariants[color];

  return (
    <div className="flex items-center gap-3 py-2">
      <div className={`px-2.5 py-1 rounded-lg ${colors.bg}`}>
        <AnimatedCounter
          value={value}
          prefix={prefix}
          suffix={suffix}
          className={`text-sm font-semibold ${colors.text}`}
        />
      </div>
      <span className="text-sm text-slate-600">{label}</span>
    </div>
  );
};

// Stats Grid Container
export interface StatsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  children,
  columns = 4,
  className = '',
}) => {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 ${className}`}>
      {children}
    </div>
  );
};

export default StatCard;
