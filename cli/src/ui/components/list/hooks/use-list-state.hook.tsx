import { useState, useCallback, useMemo } from 'react';
import type { 
  ListState, 
  ListSort, 
  ListPagination, 
  SearchChangeHandler,
  SortChangeHandler,
  PaginationChangeHandler 
} from '../list.types.ts';
import type { Key } from 'react';

// ================================================
// List State Management Hook
// ================================================

/**
 * Hook for managing all list state including search, sort, pagination, and selection
 * Provides centralized state management with event handlers for the generic list
 */
export const useListState = <TData = any>(options: {
  /** Initial search query */
  initialSearch?: string;
  /** Initial sort state */
  initialSort?: ListSort | null;
  /** Initial pagination state */
  initialPagination?: ListPagination;
  /** Initial selection */
  initialSelection?: Set<Key>;
  /** Data array length for pagination calculations */
  dataLength?: number;
  /** Default page size */
  defaultPageSize?: number;
}): ListState<TData> & {
  // Event handlers for the generic list
  handleSearchChange: SearchChangeHandler;
  handleSortChange: SortChangeHandler;
  handlePaginationChange: PaginationChangeHandler;
  handleSelectionChange: (selection: Set<Key>) => void;
  handleHighlightChange: (index: number) => void;
} => {
  const {
    initialSearch = '',
    initialSort = null,
    initialPagination,
    initialSelection = new Set(),
    dataLength = 0,
    defaultPageSize = 10,
  } = options;

  // ================================================
  // State Management
  // ================================================

  // Search state
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Sort state
  const [sort, setSort] = useState<ListSort | null>(initialSort);

  // Pagination state
  const [pagination, setPagination] = useState<ListPagination>(() => {
    if (initialPagination) return initialPagination;
    
    const totalPages = Math.ceil(dataLength / defaultPageSize);
    return {
      page: 0,
      pageSize: defaultPageSize,
      totalItems: dataLength,
      totalPages,
      hasNextPage: totalPages > 1,
      hasPreviousPage: false,
    };
  });

  // Selection state
  const [selection, setSelection] = useState<Set<Key>>(initialSelection);

  // Highlighted row index
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // ================================================
  // Event Handlers
  // ================================================

  /**
   * Reset pagination to first page while preserving other pagination settings
   */
  const resetToFirstPage = useCallback((currentPagination: ListPagination): ListPagination => {
    return {
      ...currentPagination,
      page: 0,
      hasNextPage: currentPagination.totalPages > 1,
      hasPreviousPage: false,
    };
  }, []);

  /**
   * Handle search query changes
   */
  const handleSearchChange: SearchChangeHandler = useCallback((query: string, filters: Record<string, string[]>) => {
    setSearchQuery(query);
    // Reset to first page when search changes
    setPagination(resetToFirstPage);
  }, [resetToFirstPage]);

  /**
   * Handle sort changes
   */
  const handleSortChange: SortChangeHandler = useCallback((newSort: ListSort | null) => {
    setSort(newSort);
    // Reset to first page when sort changes
    setPagination(resetToFirstPage);
  }, [resetToFirstPage]);

  /**
   * Handle pagination changes
   */
  const handlePaginationChange: PaginationChangeHandler = useCallback((page: number, pageSize: number) => {
    setPagination((prev: ListPagination) => {
      const totalPages = Math.ceil(prev.totalItems / pageSize);
      const clampedPage = Math.max(0, Math.min(page, totalPages - 1));
      
      return {
        page: clampedPage,
        pageSize,
        totalItems: prev.totalItems,
        totalPages,
        hasNextPage: clampedPage < totalPages - 1,
        hasPreviousPage: clampedPage > 0,
      };
    });
    
    // Reset highlight to first item on page change
    setHighlightedIndex(0);
  }, []);

  /**
   * Handle selection changes
   */
  const handleSelectionChange = useCallback((newSelection: Set<Key>) => {
    setSelection(new Set(newSelection));
  }, []);

  /**
   * Handle highlight changes
   */
  const handleHighlightChange = useCallback((index: number) => {
    setHighlightedIndex(Math.max(0, index));
  }, []);

  // ================================================
  // Computed Properties
  // ================================================

  /**
   * Update pagination when data length changes
   */
  const updatedPagination = useMemo(() => {
    const totalPages = Math.ceil(dataLength / pagination.pageSize);
    const clampedPage = Math.max(0, Math.min(pagination.page, totalPages - 1));

    return {
      ...pagination,
      totalItems: dataLength,
      totalPages,
      page: clampedPage,
      hasNextPage: clampedPage < totalPages - 1,
      hasPreviousPage: clampedPage > 0,
    };
  }, [pagination.page, pagination.pageSize, dataLength]);

  // Update pagination state when computed values change
  useMemo(() => {
    if (updatedPagination.totalItems !== pagination.totalItems) {
      setPagination(updatedPagination);
    }
  }, [updatedPagination, pagination.totalItems]);

  // ================================================
  // Return State and Handlers
  // ================================================

  return {
    // State
    searchQuery,
    sort,
    pagination: updatedPagination,
    selection,
    highlightedIndex,
    
    // State setters
    setSearchQuery,
    setSort,
    setPagination,
    setSelection,
    setHighlightedIndex,
    
    // Event handlers
    handleSearchChange,
    handleSortChange,
    handlePaginationChange,
    handleSelectionChange,
    handleHighlightChange,
  };
};