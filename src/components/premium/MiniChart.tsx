'use client';

import React, { useRef, useEffect, useState } from 'react';

// Types
export type ChartType = 'sparkline' | 'bar' | 'donut' | 'area';

export interface ChartDataPoint {
  value: number;
  label?: string;
  color?: string;
}

export interface MiniChartProps {
  /** Data array */
  data: number[] | ChartDataPoint[];
  /** Chart type */
  type?: ChartType;
  /** Primary color (can be Tailwind class or hex) */
  color?: string;
  /** Secondary color for gradients */
  secondaryColor?: string;
  /** Width of the chart container */
  width?: number | string;
  /** Height of the chart container */
  height?: number;
  /** Show data points on sparkline/line */
  showPoints?: boolean;
  /** Show tooltip on hover */
  showTooltip?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Custom value formatter for tooltips */
  formatValue?: (value: number) => string;
  /** Additional CSS classes */
  className?: string;
  /** Donut center text (for donut charts) */
  centerText?: string;
  /** Donut center subtext */
  centerSubtext?: string;
}

// Color utilities
const resolveColor = (color: string): string => {
  const colorMap: Record<string, string> = {
    emerald: '#10b981',
    teal: '#14b8a6',
    indigo: '#6366f1',
    violet: '#8b5cf6',
    amber: '#f59e0b',
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#22c55e',
    orange: '#f97316',
    slate: '#64748b',
  };
  
  if (color.startsWith('#') || color.startsWith('rgb')) return color;
  return colorMap[color] || colorMap.emerald;
};

// Easing function
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

const MiniChart: React.FC<MiniChartProps> = ({
  data,
  type = 'sparkline',
  color = 'emerald',
  secondaryColor,
  width = '100%',
  height = 40,
  showPoints = false,
  showTooltip = false,
  animationDuration = 1000,
  formatValue = (v) => v.toFixed(2),
  centerText,
  centerSubtext,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredValue, setHoveredValue] = useState<{ x: number; y: number; value: number } | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const primaryColor = resolveColor(color);
  const secColor = secondaryColor ? resolveColor(secondaryColor) : primaryColor;

  // Normalize data to array of numbers
  const normalizedData: number[] = Array.isArray(data[0]) 
    ? (data as ChartDataPoint[]).map(d => d.value)
    : data as number[];

  // Animation effect
  useEffect(() => {
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      setAnimationProgress(easeOutCubic(progress));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [data, animationDuration]);

  // Draw sparkline or area chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !normalizedData.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set actual size for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = type === 'bar' ? 0 : 2;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    const minVal = Math.min(...normalizedData);
    const maxVal = Math.max(...normalizedData);
    const range = maxVal - minVal || 1;

    if (type === 'sparkline' || type === 'area') {
      const points = normalizedData.map((val, i) => ({
        x: padding + (i / (normalizedData.length - 1 || 1)) * (w - padding * 2),
        y: padding + ((maxVal - val) / range) * (h - padding * 2),
        value: val,
      }));

      // Draw area fill for area type
      if (type === 'area') {
        ctx.beginPath();
        ctx.moveTo(points[0].x, h);
        
        // Animate path drawing
        const animatedLength = Math.floor(points.length * animationProgress);
        
        for (let i = 0; i <= animatedLength && i < points.length; i++) {
          if (i === 0) {
            ctx.lineTo(points[i].x, points[i].y * animationProgress + h * (1 - animationProgress));
          } else {
            ctx.lineTo(points[i].x, points[i].y);
          }
        }
        
        if (animatedLength > 0 && animatedLength < points.length) {
          ctx.lineTo(points[animatedLength].x, h);
        } else if (animatedLength >= points.length - 1) {
          ctx.lineTo(points[points.length - 1].x, h);
        }
        
        ctx.closePath();
        
        // Gradient fill
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, primaryColor + '40');
        gradient.addColorStop(1, primaryColor + '05');
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Draw line
      ctx.beginPath();
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const animatedLength = Math.floor((points.length - 1) * animationProgress);

      for (let i = 0; i <= animatedLength && i < points.length; i++) {
        const point = points[i];
        const animatedY = point.y * Math.min(animationProgress * 1.5, 1) + h * (1 - Math.min(animationProgress * 1.5, 1));
        
        if (i === 0) {
          ctx.moveTo(point.x, animatedY);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }

      ctx.stroke();

      // Draw points
      if (showPoints && animationProgress >= 1) {
        points.forEach((point) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = primaryColor;
          ctx.fill();
          
          ctx.beginPath();
          ctx.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.fill();
        });
      }
    }

    if (type === 'bar') {
      const barWidth = (w / normalizedData.length) * 0.7;
      const gap = (w / normalizedData.length) * 0.3;

      normalizedData.forEach((val, i) => {
        const barHeight = ((val - minVal) / range) * (h - 4) * animationProgress;
        const x = i * (barWidth + gap) + gap / 2;
        const y = h - barHeight;

        // Rounded top bars
        const radius = Math.min(barWidth / 2, 4);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, h);
        ctx.lineTo(x, h);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();

        // Gradient fill
        const gradient = ctx.createLinearGradient(x, y, x, h);
        gradient.addColorStop(0, primaryColor);
        gradient.addColorStop(1, secColor);
        ctx.fillStyle = gradient;
        ctx.fill();
      });
    }

    if (type === 'donut') {
      const total = normalizedData.reduce((a, b) => a + b, 0);
      const centerX = w / 2;
      const centerY = h / 2;
      const outerRadius = Math.min(w, h) / 2 - 2;
      const innerRadius = outerRadius * 0.65;

      let startAngle = -Math.PI / 2;

      normalizedData.forEach((val, i) => {
        const sliceAngle = (val / total) * Math.PI * 2 * animationProgress;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
        ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
        ctx.closePath();

        // Use color from data or cycle through colors
        const sliceColor = Array.isArray(data[0]) 
          ? resolveColor((data as ChartDataPoint)[i]?.color || color)
          : i % 2 === 0 ? primaryColor : secColor;
        
        ctx.fillStyle = sliceColor;
        ctx.fill();

        startAngle = endAngle;
      });

      // Center text
      if (centerText && animationProgress >= 1) {
        ctx.fillStyle = '#374151';
        ctx.font = `bold ${h * 0.22}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(centerText, centerX, centerY - (centerSubtext ? 4 : 0));

        if (centerSubtext) {
          ctx.fillStyle = '#9CA3AF';
          ctx.font = `${h * 0.12}px system-ui`;
          ctx.fillText(centerSubtext, centerX, centerY + h * 0.15);
        }
      }
    }
  }, [normalizedData, type, primaryColor, secColor, height, width, animationProgress, showPoints, centerText, centerSubtext, data]);

  // Handle mouse move for tooltip
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!showTooltip || type === 'donut') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (type === 'bar') {
      const barIndex = Math.floor((x / rect.width) * normalizedData.length);
      if (barIndex >= 0 && barIndex < normalizedData.length) {
        setHoveredValue({ x, y, value: normalizedData[barIndex] });
      } else {
        setHoveredValue(null);
      }
    } else {
      const dataIndex = Math.round(((x - 2) / (rect.width - 4)) * (normalizedData.length - 1));
      if (dataIndex >= 0 && dataIndex < normalizedData.length) {
        setHoveredValue({ x, y, value: normalizedData[dataIndex] });
      } else {
        setHoveredValue(null);
      }
    }
  };

  const handleMouseLeave = () => setHoveredValue(null);

  return (
    <div className={`relative inline-block ${className}`} style={{ width, height }}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
      
      {/* Tooltip */}
      {showTooltip && hoveredValue && (
        <div 
          className="
            absolute z-50 px-2 py-1 
            bg-slate-900 text-white text-xs rounded-lg shadow-lg
            pointer-events-none transform -translate-x-1/2 -translate-y-full
            mt-[-8px]
          "
          style={{ left: hoveredValue.x, top: hoveredValue.y }}
        >
          {formatValue(hoveredValue.value)}
        </div>
      )}
    </div>
  );
};

// Preset configurations
export interface SparklineProps extends Omit<MiniChartProps, 'type'> {
  trend?: 'up' | 'down' | 'neutral';
  showTrendIndicator?: boolean;
}

export const Sparkline: React.FC<SparklineProps> = ({ 
  trend, 
  showTrendIndicator = true,
  ...props 
}) => {
  const trendColors = {
    up: { main: '#22c55e', light: '#86efac' },
    down: { main: '#ef4444', light: '#fca5a5' },
    neutral: { main: '#64748b', light: '#94a3b8' },
  };

  const colors = trend ? trendColors[trend] : { main: '#10b981', light: '#34d399' };

  return (
    <div className="flex items-center gap-2">
      <MiniChart {...props} type="sparkline" color={colors.main} secondaryColor={colors.light} />
      {showTrendIndicator && trend && (
        <span className={`text-xs font-medium ${
          trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-slate-500'
        }`}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
        </span>
      )}
    </div>
  );
};

export const MiniBar: React.FC<Omit<MiniChartProps, 'type'>> = (props) => (
  <MiniChart {...props} type="bar" />
);

export const MiniDonut: React.FC<Omit<MiniChartProps, 'type'>> = (props) => (
  <MiniChart {...props} type="donut" height={props.height || 80} />
);

// Quick stat with mini chart
export interface StatSparklineProps {
  value: number;
  change?: number;
  data: number[];
  label: string;
  color?: string;
  format?: string;
}

export const StatSparkline: React.FC<StatSparklineProps> = ({
  value,
  change,
  data,
  label,
  color = 'emerald',
  format = '%',
}) => {
  const isPositive = (change ?? 0) >= 0;

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-xl font-bold text-slate-900">
          {value}{format}
        </p>
        {change !== undefined && (
          <p className={`text-xs ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{change}% from last period
          </p>
        )}
      </div>
      <MiniChart 
        data={data} 
        type={isPositive ? 'area' : 'sparkline'} 
        color={isPositive ? color : 'red'}
        width={80}
        height={32}
      />
    </div>
  );
};

export default MiniChart;
