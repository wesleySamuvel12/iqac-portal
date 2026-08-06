/**
 * Premium UI Component Library for IQAC Portal
 * 
 * Enterprise-grade React components with modern design system.
 * Built with Tailwind CSS v4 and TypeScript.
 * 
 * @module premium
 */

// Glass Card Components
export { 
  GlassCard, 
  GlassCardGradient, 
  GlassCardDark,
  type GlassCardProps,
  type GlassCardGradientProps
} from './GlassCard';

// Animated Counter Components
export {
  AnimatedCounter,
  CounterBadge,
  useAnimatedCounter,
  type AnimatedCounterProps,
  type CounterBadgeProps
} from './AnimatedCounter';

// Progress Ring Components
export {
  ProgressRing,
  ProgressRingMini,
  ProgressRingWithCounter,
  StatusDot,
  type ProgressRingProps,
  type ProgressRingMiniProps,
  type StatusDotProps
} from './ProgressRing';

// Stat Card Components
export {
  StatCard,
  InlineStat,
  StatsGrid,
  type StatCardProps,
  type InlineStatProps,
  type StatsGridProps,
  type ColorVariant
} from './StatCard';

// Breadcrumb Navigation Components
export {
  BreadcrumbNav,
  PageHeader,
  BreadcrumbMobile,
  type BreadcrumbNavProps,
  type BreadcrumbItem,
  type PageHeaderProps
} from './BreadcrumbNav';

// Hierarchy Navigation Components
export {
  HierarchyNav,
  AcademicHierarchy,
  type HierarchyNavProps,
  type HierarchyStep,
  type AcademicHierarchyProps
} from './HierarchyNav';

// Search & Filter Components
export {
  SearchFilter,
  useKeyboardShortcut,
  type SearchFilterProps,
  type FilterConfig,
  type FilterOption
} from './SearchFilter';

// Data Table Components
export {
  DataTable,
  presetColumns,
  type DataTableProps,
  type Column,
  type Action
} from './DataTable';

// Profile Card Components
export {
  ProfileCard,
  ProfileListItem,
  type ProfileCardProps,
  type StudentProfile,
  type ProfileListItemProps
} from './ProfileCard';

// Mini Chart Components
export {
  MiniChart,
  Sparkline,
  MiniBar,
  MiniDonut,
  StatSparkline,
  type MiniChartProps,
  type SparklineProps,
  type StatSparklineProps,
  type ChartDataPoint,
  type ChartType
} from './MiniChart';

// Re-export types for convenience
export type {
  // GlassCard
  GlassCardProps as PremiumCardProps,
  
  // Common patterns
  ColorVariant as ThemeColor,
};

/**
 * Quick import example:
 * 
 * ```tsx
 * import {
 *   GlassCard,
 *   StatCard,
 *   DataTable,
 *   ProfileCard,
 *   BreadcrumbNav,
 *   SearchFilter,
 *   AnimatedCounter,
 *   ProgressRing,
 *   MiniChart,
 * } from '@/components/premium';
 * ```
 */
