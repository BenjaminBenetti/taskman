import type { ReactNode } from 'react';
import type { ListPagination, PaginationChangeHandler } from '../../list.types.ts';

// ================================================
// List Footer Types
// ================================================

/**
 * Props for ListFooter component
 */
export interface ListFooterProps {
  /** Pagination state and configuration */
  pagination: ListPagination;
  /** Pagination change handler */
  onPaginationChange: PaginationChangeHandler;
  /** Number of selected items */
  selectedCount?: number;
  /** Total number of filtered items (may differ from pagination total) */
  filteredCount?: number;
  /** Terminal width for responsive layout */
  terminalWidth?: number;
  /** Whether pagination controls are enabled */
  paginationEnabled?: boolean;
  /** Whether to show item counts */
  showCounts?: boolean;
  /** Whether to show selection info */
  showSelection?: boolean;
  /** Custom footer content */
  customContent?: ReactNode;
}

/**
 * Pagination controls configuration
 */
export interface PaginationControls {
  /** Show first page button */
  showFirst?: boolean;
  /** Show last page button */
  showLast?: boolean;
  /** Show previous page button */
  showPrevious?: boolean;
  /** Show next page button */
  showNext?: boolean;
  /** Show page number input */
  showPageInput?: boolean;
  /** Show page size selector */
  showPageSize?: boolean;
  /** Available page sizes */
  pageSizes?: number[];
}

/**
 * Footer layout configuration
 */
export interface FooterLayout {
  /** How to distribute footer content */
  distribution: 'left' | 'center' | 'right' | 'space-between' | 'space-around';
  /** Whether to stack content vertically on narrow screens */
  stackOnNarrow?: boolean;
  /** Narrow screen threshold in characters */
  narrowThreshold?: number;
  /** Padding around footer content */
  padding?: number;
}

/**
 * Footer section information
 */
export interface FooterSection {
  /** Section identifier */
  id: string;
  /** Section content */
  content: ReactNode;
  /** Section width preference */
  width?: 'auto' | 'flex' | number;
  /** Section alignment */
  align?: 'left' | 'center' | 'right';
  /** Whether section should be visible */
  visible?: boolean;
}