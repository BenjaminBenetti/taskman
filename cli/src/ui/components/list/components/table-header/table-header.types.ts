import type { ListColumn, ListSort, SortChangeHandler } from '../../list.types.ts';

// ================================================
// Table Header Types
// ================================================

/**
 * Props for TableHeader component
 */
export interface TableHeaderProps<TData = any> {
  /** Column definitions */
  columns: ListColumn<TData>[];
  /** Current sort state */
  sort?: ListSort | null;
  /** Sort change handler */
  onSortChange?: SortChangeHandler;
  /** Calculated column widths */
  columnWidths: number[];
  /** Terminal width for responsive layout */
  terminalWidth?: number;
  /** Whether header is interactive (clickable) */
  interactive?: boolean;
  /** Column gap/padding */
  columnGap?: number;
}

/**
 * Props for individual header cells
 */
export interface HeaderCellProps {
  /** Column definition */
  column: ListColumn;
  /** Column width */
  width: number;
  /** Current sort state for this column */
  sortState?: 'asc' | 'desc' | null;
  /** Whether this column can be sorted */
  sortable?: boolean;
  /** Click handler for sorting */
  onSort?: (direction: 'asc' | 'desc') => void;
  /** Whether this cell is currently focused */
  focused?: boolean;
}

/**
 * Sort indicator configuration
 */
export interface SortIndicator {
  /** Icon for ascending sort */
  ascIcon: string;
  /** Icon for descending sort */
  descIcon: string;
  /** Icon for unsorted state */
  neutralIcon: string;
  /** Color for active sort indicator */
  activeColor: string;
  /** Color for inactive sort indicator */
  inactiveColor: string;
}