import type { ReactNode, Key } from 'react';

// ================================================
// Core Generic List Types
// ================================================

/**
 * Generic column definition for list components
 * Supports flexible rendering, sorting, and alignment
 */
export interface ListColumn<TData = any> {
  /** Unique key for the column */
  key: string;
  /** Display label for the column header */
  label: string;
  /** Column width specification - can be fixed number or 'flex' */
  width?: number | 'flex';
  /** Minimum width for the column when using flex layout */
  minWidth?: number;
  /** Maximum width for the column when using flex layout */
  maxWidth?: number;
  /** Text alignment within the column */
  align?: 'left' | 'center' | 'right';
  /** Whether this column can be sorted */
  sortable?: boolean;
  /** Custom render function for column data */
  render?: (value: any, item: TData, index: number) => ReactNode;
  /** Function to extract sortable value from item */
  getSortValue?: (item: TData) => string | number | Date;
}

/**
 * Sort configuration for list data
 */
export interface ListSort {
  /** Column key being sorted */
  column: string;
  /** Sort direction */
  direction: 'asc' | 'desc';
}

/**
 * Pagination configuration and state
 */
export interface ListPagination {
  /** Current page number (0-based) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of items available */
  totalItems: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPreviousPage: boolean;
}

/**
 * Search configuration for GitHub-style filtering
 */
export interface SearchConfig {
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Whether search is case sensitive */
  caseSensitive?: boolean;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Available filter shortcuts (e.g., 'is:open', 'assignee:john') */
  shortcuts?: SearchShortcut[];
}

/**
 * Search shortcut definition for GitHub-style filtering
 */
export interface SearchShortcut {
  /** Shortcut key (e.g., 'is', 'assignee', 'created') */
  key: string;
  /** Human-readable label for the shortcut */
  label: string;
  /** Available values for this shortcut */
  values?: string[];
}

/**
 * Selection state and configuration
 */
export interface ListSelection<TData = any> {
  /** Currently selected item keys */
  selectedKeys: Set<Key>;
  /** Whether multiple selection is enabled */
  multiple?: boolean;
  /** Function to get unique key from item */
  getItemKey: (item: TData) => Key;
}

// ================================================
// Event Handler Types
// ================================================

/**
 * Event handler for search changes
 */
export type SearchChangeHandler = (query: string, parsedFilters: Record<string, string[]>) => void;

/**
 * Event handler for sort changes
 */
export type SortChangeHandler = (sort: ListSort | null) => void;

/**
 * Event handler for pagination changes
 */
export type PaginationChangeHandler = (page: number, pageSize: number) => void;

/**
 * Event handler for selection changes
 */
export type SelectionChangeHandler<TData = any> = (
  selectedKeys: Set<Key>,
  selectedItems: TData[]
) => void;

/**
 * Event handler for item actions (double-click, enter, etc.)
 */
export type ItemActionHandler<TData = any> = (item: TData, index: number) => void;

// ================================================
// Main Generic List Props
// ================================================

/**
 * Props for the main GenericList component
 */
export interface GenericListProps<TData = any> {
  /** Array of data items to display */
  data: TData[];
  /** Column definitions */
  columns: ListColumn<TData>[];
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string | null;
  
  // Search Configuration
  /** Search configuration */
  searchConfig?: SearchConfig;
  /** Current search query */
  searchQuery?: string;
  /** Search change handler */
  onSearchChange?: SearchChangeHandler;
  
  // Sorting Configuration  
  /** Current sort state */
  sort?: ListSort | null;
  /** Sort change handler */
  onSortChange?: SortChangeHandler;
  
  // Pagination Configuration
  /** Pagination state */
  pagination?: ListPagination;
  /** Pagination change handler */
  onPaginationChange?: PaginationChangeHandler;
  
  // Selection Configuration
  /** Selection configuration */
  selection?: ListSelection<TData>;
  /** Selection change handler */
  onSelectionChange?: SelectionChangeHandler<TData>;
  
  // Actions
  /** Handler for item actions (double-click, enter) */
  onItemAction?: ItemActionHandler<TData>;
  
  // Rendering Customization
  /** Custom empty state component */
  emptyComponent?: ReactNode;
  /** Custom loading component */
  loadingComponent?: ReactNode;
  /** Custom error component */
  errorComponent?: ReactNode;
  
  // Layout Configuration
  /** Whether to show the search bar */
  showSearch?: boolean;
  /** Whether to show the footer with pagination */
  showFooter?: boolean;
  /** Whether to show column headers */
  showHeaders?: boolean;
  /** Minimum height for the list container */
  minHeight?: number;
  /** Maximum height for the list container */
  maxHeight?: number;
}

// ================================================
// Component-Specific Types
// ================================================

/**
 * Props for SearchBar component
 */
export interface SearchBarProps {
  /** Current search query */
  query: string;
  /** Search configuration */
  config: SearchConfig;
  /** Search change handler */
  onChange: SearchChangeHandler;
  /** Whether the search bar has focus */
  focused?: boolean;
  /** Terminal width for responsive layout */
  terminalWidth?: number;
}

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
}

/**
 * Props for TableRow component
 */
export interface TableRowProps<TData = any> {
  /** Data item for this row */
  item: TData;
  /** Row index */
  index: number;
  /** Column definitions */
  columns: ListColumn<TData>[];
  /** Calculated column widths */
  columnWidths: number[];
  /** Whether this row is selected */
  selected?: boolean;
  /** Whether this row is highlighted/focused */
  highlighted?: boolean;
  /** Selection change handler */
  onSelectionChange?: (selected: boolean) => void;
  /** Item action handler */
  onItemAction?: ItemActionHandler<TData>;
}

/**
 * Props for ListFooter component
 */
export interface ListFooterProps {
  /** Pagination state */
  pagination: ListPagination;
  /** Pagination change handler */
  onPaginationChange: PaginationChangeHandler;
  /** Number of selected items */
  selectedCount?: number;
  /** Terminal width for responsive layout */
  terminalWidth?: number;
}

/**
 * Props for GridLayout component
 */
export interface GridLayoutProps {
  /** Column definitions */
  columns: ListColumn[];
  /** Terminal width available */
  terminalWidth: number;
  /** Minimum total width required */
  minWidth?: number;
  /** Children to render within the grid */
  children: ReactNode;
}

// ================================================
// Hook Return Types
// ================================================

/**
 * Return type for useListState hook
 */
export interface ListState<TData = any> {
  /** Current search query */
  searchQuery: string;
  /** Current sort state */
  sort: ListSort | null;
  /** Current pagination state */
  pagination: ListPagination;
  /** Current selection state */
  selection: Set<Key>;
  /** Currently highlighted/focused row index */
  highlightedIndex: number;
  
  // State updaters
  setSearchQuery: (query: string) => void;
  setSort: (sort: ListSort | null) => void;
  setPagination: (pagination: ListPagination) => void;
  setSelection: (selection: Set<Key>) => void;
  setHighlightedIndex: (index: number) => void;
}

/**
 * Return type for useListKeyboard hook
 */
export interface ListKeyboardHandlers {
  /** Whether the list currently has focus */
  hasFocus: boolean;
  /** Set focus state */
  setFocus: (focused: boolean) => void;
  /** Move highlight up one row */
  moveUp: () => void;
  /** Move highlight down one row */
  moveDown: () => void;
  /** Toggle selection of current row */
  toggleSelection: () => void;
  /** Trigger action on current row */
  triggerAction: () => void;
  /** Go to next page */
  nextPage: () => void;
  /** Go to previous page */
  previousPage: () => void;
}

/**
 * Return type for useColumnWidth hook
 */
export interface ColumnWidthCalculation {
  /** Calculated widths for each column */
  columnWidths: number[];
  /** Total width used by all columns */
  totalWidth: number;
  /** Whether the layout fits within terminal width */
  fitsInTerminal: boolean;
}

// ================================================
// Utility Types
// ================================================

/**
 * Parsed search filters from GitHub-style query
 */
export interface ParsedSearchFilters {
  /** Raw search text (non-filter terms) */
  text: string;
  /** Parsed filter key-value pairs */
  filters: Record<string, string[]>;
}

/**
 * Column width specification
 */
export type ColumnWidth = number | 'flex';

/**
 * Grid alignment options
 */
export type GridAlignment = 'left' | 'center' | 'right' | 'justify';