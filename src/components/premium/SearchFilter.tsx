'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  Filter,
  Calendar,
  ChevronDown,
  Loader2
} from 'lucide-react';

export interface FilterOption {
  /** Unique identifier */
  value: string;
  /** Display label */
  label: string;
  /** Optional count */
  count?: number;
  /** Is this option selected? */
  selected?: boolean;
}

export interface FilterConfig {
  /** Filter key/field name */
  key: string;
  /** Display label */
  label: string;
  /** Available options */
  options: FilterOption[];
  /** Allow multiple selection */
  multi?: boolean;
  /** Currently selected value(s) */
  selected?: string | string[];
}

export interface SearchFilterProps {
  /** Placeholder text for search input */
  placeholder?: string;
  /** Callback when search query changes (debounced) */
  onSearch?: (query: string) => void;
  /** Callback when filter changes */
  onFilter?: (key: string, value: string | string[]) => void;
  /** Array of filter configurations */
  filters?: FilterConfig[];
  /** Show date range picker placeholder */
  showDateRange?: boolean;
  /** Callback for date range change */
  onDateRangeChange?: (range: { start: Date; end: Date }) => void;
  /** Debounce delay in ms */
  debounceMs?: number;
  /** Initial search value */
  defaultValue?: string;
  /** Loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Compact variant */
  compact?: boolean;
  /** Show clear all button */
  showClearAll?: boolean;
  /** Callback for clear all */
  onClearAll?: () => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  placeholder = 'Search...',
  onSearch,
  onFilter,
  filters = [],
  showDateRange = false,
  onDateRangeChange,
  debounceMs = 300,
  defaultValue = '',
  loading = false,
  className = '',
  compact = false,
  showClearAll = true,
  onClearAll,
}) => {
  const [searchValue, setSearchValue] = useState(defaultValue);
  const [activeFilterKey, setActiveFilterKey] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Debounced search handler
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onSearch?.(value);
    }, debounceMs);
  }, [onSearch, debounceMs]);

  // Clear search
  const handleClearSearch = () => {
    setSearchValue('');
    onSearch?.('');
  };

  // Handle filter selection
  const handleFilterSelect = (filterKey: string, optionValue: string) => {
    const filter = filters.find(f => f.key === filterKey);
    if (!filter) return;

    if (filter.multi) {
      const currentSelected = (filter.selected as string[]) || [];
      const newSelected = currentSelected.includes(optionValue)
        ? currentSelected.filter(v => v !== optionValue)
        : [...currentSelected, optionValue];
      onFilter?.(filterKey, newSelected);
    } else {
      onFilter?.(filterKey, optionValue);
      setActiveFilterKey(null);
    }
  };

  // Check if any filters are active
  const hasActiveFilters = filters.some(f => {
    if (f.multi) {
      return (f.selected as string[])?.length > 0;
    }
    return f.selected !== undefined && f.selected !== '';
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setActiveFilterKey(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={placeholder}
            className={`
              w-full pl-9 pr-8 py-2 rounded-lg
              bg-white border border-slate-200
              text-sm text-slate-900 placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
              transition-all duration-200
            `}
          />
          {searchValue && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-slate-100 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>

        {/* Quick Filters */}
        {filters.map((filter) => (
          <select
            key={filter.key}
            onChange={(e) => onFilter?.(filter.key, e.target.value)}
            value={(filter.selected as string) || ''}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">{filter.label}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
                {option.count !== undefined ? ` (${option.count})` : ''}
              </option>
            ))}
          </select>
        ))}

        {/* Clear All */}
        {(hasActiveFilters || searchValue) && showClearAll && (
          <button
            onClick={() => {
              setSearchValue('');
              onClearAll?.();
            }}
            className="px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`} ref={filterRef}>
      <div className="p-4 flex flex-col lg:flex-row gap-4">
        {/* Search Section */}
        <div className="relative flex-1 min-w-0">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            {loading ? (
              <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-slate-400" />
            )}
          </div>
          
          <input
            type="text"
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={placeholder}
            className={`
              w-full pl-12 pr-10 py-3 rounded-xl
              bg-slate-50 border border-slate-200
              text-sm text-slate-900 placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white
              transition-all duration-200
            `}
          />

          {searchValue && (
            <button
              onClick={handleClearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}

          {/* Keyboard shortcut hint */}
          <kbd className="hidden sm:block absolute right-12 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-medium text-slate-400 bg-slate-100 rounded border border-slate-200">
            ⌘K
          </kbd>
        </div>

        {/* Filters Section */}
        {filters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 hidden lg:block" />
            
            {filters.map((filter) => {
              const isActive = activeFilterKey === filter.key;
              const hasSelection = filter.multi
                ? (filter.selected as string[])?.length > 0
                : filter.selected !== undefined && filter.selected !== '';

              return (
                <div key={filter.key} className="relative">
                  <button
                    onClick={() => setActiveFilterKey(isActive ? null : filter.key)}
                    className={`
                      inline-flex items-center gap-2 px-4 py-2.5 rounded-lg
                      text-sm font-medium transition-all duration-200
                      ${isActive || hasSelection
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }
                    `}
                  >
                    <Filter className="w-4 h-4" />
                    <span>{filter.label}</span>
                    {hasSelection && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500 text-white rounded-full">
                        {filter.multi ? (filter.selected as string[])?.length : 1}
                      </span>
                    )}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isActive ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown */}
                  {isActive && (
                    <div className="
                      absolute top-full mt-2 left-0 z-50
                      w-56 py-2
                      bg-white rounded-xl shadow-xl border border-slate-200
                      animate-in fade-in slide-in-from-top-2 duration-200
                    ">
                      {filter.options.map((option) => {
                        const isSelected = filter.multi
                          ? (filter.selected as string[])?.includes(option.value)
                          : filter.selected === option.value;

                        return (
                          <button
                            key={option.value}
                            onClick={() => handleFilterSelect(filter.key, option.value)}
                            className={`
                              w-full px-4 py-2.5 text-left text-sm
                              flex items-center justify-between
                              transition-colors duration-150
                              ${isSelected
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'text-slate-600 hover:bg-slate-50'
                              }
                            `}
                          >
                            <span>{option.label}</span>
                            <div className="flex items-center gap-2">
                              {option.count !== undefined && (
                                <span className="text-xs text-slate-400">{option.count}</span>
                              )}
                              {isSelected && (
                                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Date Range Picker Placeholder */}
        {showDateRange && (
          <button className="
            inline-flex items-center gap-2 px-4 py-2.5 rounded-lg
            bg-slate-50 text-slate-600 border border-slate-200
            text-sm font-medium
            hover:bg-slate-100 transition-colors duration-200
          ">
            <Calendar className="w-4 h-4" />
            <span>Date Range</span>
          </button>
        )}

        {/* Clear All Button */}
        {(hasActiveFilters || searchValue) && showClearAll && (
          <button
            onClick={() => {
              setSearchValue('');
              onClearAll?.();
            }}
            className="
              inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg
              text-sm font-medium text-red-600
              bg-red-50 border border-red-200
              hover:bg-red-100 transition-colors duration-200
            "
          >
            <X className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Active Filters Tags */}
      {hasActiveFilters && (
        <div className="px-4 pb-4 flex flex-wrap gap-2">
          {filters.filter(f => {
            if (f.multi) return (f.selected as string[])?.length > 0;
            return f.selected !== undefined && f.selected !== '';
          }).map(filter => {
            const getLabels = () => {
              if (filter.multi) {
                return (filter.selected as string[]).map(val => 
                  filter.options.find(o => o.value === val)?.label || val
                );
              }
              return [filter.options.find(o => o.value === filter.selected)?.label || filter.selected as string];
            };

            return getLabels().map(label => (
              <span
                key={`${filter.key}-${label}`}
                className="
                  inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                  bg-emerald-50 text-emerald-700 text-xs font-medium
                  border border-emerald-200
                "
              >
                {filter.label}: {label}
                <button
                  onClick={() => {
                    if (filter.multi) {
                      const newSelected = (filter.selected as string[]).filter(
                        val => filter.options.find(o => o.value === val)?.label !== label
                      );
                      onFilter?.(filter.key, newSelected);
                    } else {
                      onFilter?.(filter.key, '');
                    }
                  }}
                  className="hover:text-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ));
          })}
        </div>
      )}
    </div>
  );
};

// Search Command Palette Hook (for future implementation)
export function useKeyboardShortcut(callback: () => void, keys: string[] = ['Meta', 'k']) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (keys.includes(e.key) && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [callback, keys]);
}

export default SearchFilter;
