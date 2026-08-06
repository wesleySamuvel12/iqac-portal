'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, MoreHorizontal, Home, type LucideIcon } from 'lucide-react';

export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Navigation href (if not provided, item is not clickable) */
  href?: string;
  /** Optional icon */
  icon?: LucideIcon;
  /** Current page indicator */
  current?: boolean;
}

export interface BreadcrumbNavProps {
  /** Array of breadcrumb items */
  items: BreadcrumbItem[];
  /** Maximum visible items before overflow */
  maxItems?: number;
  /** Show home icon as first item */
  showHome?: boolean;
  /** Home link URL */
  homeHref?: string;
  /** Separator component or icon */
  separator?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Callback when item is clicked */
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
  items,
  maxItems = 5,
  showHome = true,
  homeHref = '/',
  separator,
  className = '',
  onItemClick,
  size = 'md',
}) => {
  const [overflowIndex, setOverflowIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Check if we need to truncate
  const needsTruncation = items.length > maxItems;

  // Get visible items
  const getVisibleItems = () => {
    if (!needsTruncation) return items;
    
    // Always show first and last items
    return [
      items[0],
      { label: '...', icon: MoreHorizontal } as BreadcrumbItem,
      ...items.slice(-2),
    ];
  };

  const visibleItems = getVisibleItems();

  const handleItemClick = (item: BreadcrumbItem, index: number) => {
    if (onItemClick && item.href) {
      onItemClick(item, index);
    }
  };

  const defaultSeparator = (
    <ChevronRight className={`${iconSizes[size]} text-slate-400 flex-shrink-0`} />
  );

  return (
    <nav 
      aria-label="Breadcrumb"
      className={`flex items-center flex-wrap gap-1 ${className}`}
      ref={containerRef}
    >
      {/* Home Icon */}
      {showHome && (
        <>
          <Link
            href={homeHref}
            className={`inline-flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 transition-colors ${sizeClasses[size]}`}
          >
            <Home className={iconSizes[size]} />
            <span className="sr-only">Home</span>
          </Link>
          {separator || defaultSeparator}
        </>
      )}

      {/* Breadcrumb Items */}
      {visibleItems.map((item, index) => {
        const isLast = index === visibleItems.length - 1;
        const isEllipsis = item.label === '...';
        const Icon = item.icon;

        if (isEllipsis) {
          return (
            <span
              key={`ellipsis-${index}`}
              className={`inline-flex items-center text-slate-400 ${sizeClasses[size]}`}
            >
              {Icon && <Icon className={iconSizes[size]} />}
            </span>
          );
        }

        const content = (
          <span className="inline-flex items-center gap-1.5 min-w-0">
            {Icon && <Icon className={`${iconSizes[size]} flex-shrink-0`} />}
            <span className={`truncate ${item.current ? 'font-semibold text-slate-900' : ''}`}>
              {item.label}
            </span>
          </span>
        );

        return (
          <React.Fragment key={index}>
            {item.current || isLast || !item.href ? (
              <span
                aria-current={item.current ? 'page' : undefined}
                className={`inline-flex items-center min-w-0 ${
                  item.current || isLast
                    ? `text-slate-900 font-medium ${sizeClasses[size]}`
                    : `text-slate-500 ${sizeClasses[size]}`
                }`}
              >
                {content}
              </span>
            ) : (
              <Link
                href={item.href!}
                onClick={() => handleItemClick(item, index)}
                className={`inline-flex items-center min-w-0 text-slate-500 hover:text-emerald-600 transition-colors ${sizeClasses[size]}`}
              >
                {content}
              </Link>
            )}
            
            {!isLast && !isEllipsis && (separator || defaultSeparator)}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

// Page Header with Breadcrumb
export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs: BreadcrumbItem[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  children,
  className = '',
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <BreadcrumbNav items={breadcrumbs} />
      
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>

      {children}
    </div>
  );
};

// Compact mobile-friendly breadcrumb
export const BreadcrumbMobile: React.FC<BreadcrumbNavProps> = ({
  items,
  className = '',
  ...props
}) => {
  const currentItem = items.find(item => item.current) || items[items.length - 1];
  const previousItem = items[items.length - 2];

  return (
    <div className={`sm:hidden ${className}`}>
      {/* Mobile: Show only current with back option */}
      <div className="flex items-center gap-2">
        {previousItem?.href && (
          <Link
            href={previousItem.href}
            className="p-1 -ml-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-slate-400 rotate-180" />
          </Link>
        )}
        <span className="text-sm font-medium text-slate-900 truncate">
          {currentItem?.label}
        </span>
      </div>
      
      {/* Desktop: Full breadcrumb hidden on mobile */}
      <div className="hidden sm:block">
        <BreadcrumbNav {...props} items={items} />
      </div>
    </div>
  );
};

export default BreadcrumbNav;
