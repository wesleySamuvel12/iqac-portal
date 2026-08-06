'use client';

import React, { useState, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown,
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal,
  Loader2,
  AlertCircle
} from 'lucide-react';

// Types
export interface Column<T = Record<string, unknown>> {
  /** Unique key for the column */
  key: string;
  /** Header label */
  header: string;
  /** Render function for cell */
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  /** Is this column sortable? */
  sortable?: boolean;
  /** Column width class */
  width?: string;
  /** Align text */
  align?: 'left' | 'center' | 'right';
  /** Hide on mobile */
  hideOnMobile?: boolean;
}

export interface Action<T = Record<string, unknown>> {
  /** Action label */
  label: string;
  /** Icon component (optional) */
  icon?: React.ReactNode;
  /** Click handler */
  onClick: (row: T, index: number) => void;
  /** Variant style */
  variant?: 'default' | 'primary' | 'danger' | 'warning';
  /** Show confirmation dialog? */
  confirm?: string;
}

export interface DataTableProps<T extends Record<string, unknown> = Record<string, unknown>> {
  /** Column definitions */
  columns: Column<T>[];
  /** Data array */
  data: T[];
  /** Unique key extractor */
  rowKey?: string | ((row: T, index: number) => string);
  /** Enable row selection */
  selectable?: boolean;
  /** Selected rows callback */
  onSelectionChange?: (selectedRows: T[]) => void;
  /** Enable sorting */
  sortable?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state icon */
  emptyIcon?: React.ReactNode;
  /** Actions column */
  actions?: Action<T>[];
  /** Pagination config */
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
  /** Striped rows */
  striped?: boolean;
  /** Hover effect on rows */
  hoverable?: boolean;
  /** Compact density */
  compact?: boolean;
  /** Row click handler */
  onRowClick?: (row: T, index: number) => void;
  /** Additional CSS classes */
  className?: string;
  /** Error state */
  error?: string | null;
  /** Max height with scroll */
  maxHeight?: string;
}

type SortDirection = 'asc' | 'desc' | null;

function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey = 'id',
  selectable = false,
  onSelectionChange,
  sortable = true,
  loading = false,
  emptyMessage = 'No data available',
  emptyIcon,
  actions,
  pagination,
  striped = true,
  hoverable = true,
  compact = false,
  onRowClick,
  className = '',
  error = null,
  maxHeight,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: SortDirection }>({
    key: '',
    direction: null,
  });
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [openActionMenu, setOpenActionMenu] = useState<number | null>(null);

  // Get row key value
  const getRowKey = (row: T, index: number): string => {
    if (typeof rowKey === 'function') return rowKey(row, index);
    return String(row[rowKey] ?? index);
  };

  // Handle sort
  const handleSort = (key: string) => {
    if (!sortable) return;

    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === 'asc'
          ? 'desc'
          : prev.key === key && prev.direction === 'desc'
          ? null
          : 'asc',
    }));
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      let comparison = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  // Handle selection
  const handleSelectAll = () => {
    if (selectedRows.size === sortedData.length) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    } else {
      const allKeys = new Set(sortedData.map((row, i) => getRowKey(row, i)));
      setSelectedRows(allKeys);
      onSelectionChange?.(sortedData);
    }
  };

  const handleSelectRow = (row: T, index: number) => {
    const key = getRowKey(row, index);
    const newSelected = new Set(selectedRows);

    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }

    setSelectedRows(newSelected);
    onSelectionChange?.(
      sortedData.filter((r, i) => newSelected.has(getRowKey(r, i)))
    );
  };

  // Render skeleton loader
  const renderSkeleton = () => (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={`skeleton-${i}`} className="animate-pulse">
          {selectable && (
            <td className="px-4 py-3">
              <div className="w-4 h-4 rounded bg-slate-200" />
            </td>
          )}
          {columns.map((col) => (
            <td key={col.key} className={`px-4 py-3 ${col.hideOnMobile ? 'hidden sm:table-cell' : ''}`}>
              <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto" />
            </td>
          ))}
          {actions && (
            <td className="px-4 py-3">
              <div className="h-6 w-6 bg-slate-200 rounded mx-auto" />
            </td>
          )}
        </tr>
      ))}
    </>
  );

  // Render empty state
  const renderEmpty = () => (
    <tr>
      <td
        colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
        className="px-4 py-12 text-center"
      >
        <div className="flex flex-col items-center gap-3 text-slate-400">
          {emptyIcon || (
            <div className="p-3 rounded-full bg-slate-100">
              <AlertCircle className="w-8 h-8" />
            </div>
          )}
          <p className="text-sm font-medium">{emptyMessage}</p>
        </div>
      </td>
    </tr>
  );

  // Render error state
  const renderError = () => (
    <tr>
      <td
        colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
        className="px-4 py-12 text-center"
      >
        <div className="flex flex-col items-center gap-3 text-red-500">
          <AlertCircle className="w-8 h-8" />
          <p className="text-sm font-medium">{error || 'Something went wrong'}</p>
        </div>
      </td>
    </tr>
  );

  // Get sort icon
  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronsUpDown className="w-4 h-4 text-slate-300" />;
    }
    if (sortConfig.direction === 'asc') {
      return <ChevronUp className="w-4 h-4 text-emerald-600" />;
    }
    if (sortConfig.direction === 'desc') {
      return <ChevronDown className="w-4 h-4 text-emerald-600" />;
    }
    return <ChevronsUpDown className="w-4 h-4 text-slate-300" />;
  };

  const sizeClasses = compact
    ? { cell: 'px-3 py-2', text: 'text-xs', icon: 'w-3.5 h-3.5' }
    : { cell: 'px-4 py-3.5', text: 'text-sm', icon: 'w-4 h-4' };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      {/* Table Container */}
      <div className={maxHeight ? `overflow-auto max-h-[${maxHeight}]` : 'overflow-x-auto'}>
        <table className="w-full min-w-full">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200">
              {/* Select All Checkbox */}
              {selectable && (
                <th className={`${sizeClasses.cell} w-12`}>
                  <input
                    type="checkbox"
                    checked={sortedData.length > 0 && selectedRows.size === sortedData.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
              )}

              {/* Column Headers */}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    ${sizeClasses.cell} font-semibold text-slate-700 ${sizeClasses.text}
                    ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                    ${column.width || ''}
                    ${column.hideOnMobile ? 'hidden sm:table-cell' : ''}
                    ${column.sortable !== false && sortable ? 'cursor-pointer select-none hover:bg-slate-100 transition-colors' : ''}
                  `}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className={`inline-flex items-center gap-1 ${column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : ''}`}>
                    {column.header}
                    {column.sortable !== false && sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}

              {/* Actions Header */}
              {actions && (
                <th className={`${sizeClasses.cell} w-20 text-right`}>
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>

          <tbody className={`divide-y divide-slate-100 ${striped ? '[&>*:nth-child(even)]:bg-slate-50/30' : ''}`}>
            {loading ? (
              renderSkeleton()
            ) : error ? (
              renderError()
            ) : sortedData.length === 0 ? (
              renderEmpty()
            ) : (
              sortedData.map((row, rowIndex) => {
                const isSelected = selectedRows.has(getRowKey(row, rowIndex));
                
                return (
                  <tr
                    key={getRowKey(row, rowIndex)}
                    className={`
                      group transition-colors duration-150
                      ${isSelected ? 'bg-emerald-50/50' : ''}
                      ${hoverable ? 'hover:bg-slate-50 cursor-pointer' : ''}
                      ${onRowClick ? 'cursor-pointer' : ''}
                    `}
                    onClick={() => onRowClick?.(row, rowIndex)}
                  >
                    {/* Row Selection */}
                    {selectable && (
                      <td className={sizeClasses.cell}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectRow(row, rowIndex);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>
                    )}

                    {/* Cells */}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`
                          ${sizeClasses.cell} ${sizeClasses.text}
                          ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''}
                          ${column.hideOnMobile ? 'hidden sm:table-cell' : ''}
                          ${column.align === 'center' ? '' : column.align === 'right' ? '' : 'max-w-[200px] truncate'}
                          text-slate-700
                        `}
                      >
                        {column.render
                          ? column.render(row[column.key], row, rowIndex)
                          : row[column.key] as React.ReactNode}
                      </td>
                    ))}

                    {/* Actions */}
                    {actions && (
                      <td className={`${sizeClasses.cell} text-right relative`}>
                        <div className="relative inline-block">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionMenu(openActionMenu === rowIndex ? null : rowIndex);
                            }}
                            className="
                              p-1.5 rounded-lg opacity-0 group-hover:opacity-100
                              hover:bg-slate-100 transition-all duration-200
                              focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20
                            "
                          >
                            <MoreHorizontal className="w-4 h-4 text-slate-500" />
                          </button>

                          {/* Dropdown Menu */}
                          {openActionMenu === rowIndex && (
                            <div className="
                              absolute right-0 top-full mt-1 z-50
                              w-40 py-1.5
                              bg-white rounded-xl shadow-xl border border-slate-200
                              animate-in fade-in slide-in-from-top-1 duration-150
                            ">
                              {actions.map((action, actionIndex) => {
                                const variantClasses = {
                                  default: 'text-slate-700 hover:bg-slate-50',
                                  primary: 'text-emerald-700 hover:bg-emerald-50',
                                  danger: 'text-red-600 hover:bg-red-50',
                                  warning: 'text-amber-600 hover:bg-amber-50',
                                };

                                return (
                                  <button
                                    key={actionIndex}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenActionMenu(null);
                                      if (action.confirm) {
                                        if (window.confirm(action.confirm)) {
                                          action.onClick(row, rowIndex);
                                        }
                                      } else {
                                        action.onClick(row, rowIndex);
                                      }
                                    }}
                                    className={`
                                      w-full px-3 py-2 text-left text-sm
                                      flex items-center gap-2
                                      transition-colors duration-150
                                      ${variantClasses[action.variant || 'default']}
                                    `}
                                  >
                                    {action.icon}
                                    {action.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && !loading && (
        <div className="px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="text-sm text-slate-500">
            Showing{' '}
            <span className="font-medium text-slate-700">
              {(pagination.currentPage - 1) * pagination.pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium text-slate-700">
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)}
            </span>{' '}
            of{' '}
            <span className="font-medium text-slate-700">{pagination.totalItems}</span>{' '}
            results
          </div>

          <div className="flex items-center gap-2">
            {/* Page Size Selector */}
            {pagination.onPageSizeChange && (
              <select
                value={pagination.pageSize}
                onChange={(e) => pagination.onPageSizeChange!(Number(e.target.value))}
                className="px-2 py-1 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>{size}/page</option>
                ))}
              </select>
            )}

            {/* Page Navigation */}
            <nav className="flex items-center gap-1">
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="
                  p-1.5 rounded-lg border border-slate-200 bg-white
                  disabled:opacity-50 disabled:cursor-not-allowed
                  hover:bg-slate-50 transition-colors
                "
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>

              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => pagination.onPageChange(pageNum)}
                    className={`
                      min-w-[32px] px-2 py-1.5 rounded-lg text-sm font-medium
                      transition-colors duration-150
                      ${pageNum === pagination.currentPage
                        ? 'bg-emerald-500 text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }
                    `}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="
                  p-1.5 rounded-lg border border-slate-200 bg-white
                  disabled:opacity-50 disabled:cursor-not-allowed
                  hover:bg-slate-50 transition-colors
                "
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      )}
    </div>
  );
}

// Preset column configurations
export const presetColumns = {
  student: [
    { key: 'registerNo', header: 'Reg. No.', width: 'w-32' },
    { key: 'name', header: 'Student Name' },
    { key: 'department', header: 'Department', hideOnMobile: true },
    { key: 'year', header: 'Year', width: 'w-24', align: 'center' as const },
    { key: 'cgpa', header: 'CGPA', width: 'w-20', align: 'center' as const },
  ] as Column[],
  
  faculty: [
    { key: 'id', header: 'ID', width: 'w-28' },
    { key: 'name', header: 'Faculty Name' },
    { key: 'department', header: 'Department' },
    { key: 'designation', header: 'Designation', hideOnMobile: true },
    { key: 'status', header: 'Status', width: 'w-24', align: 'center' as const },
  ] as Column[],
};

export default DataTable;
