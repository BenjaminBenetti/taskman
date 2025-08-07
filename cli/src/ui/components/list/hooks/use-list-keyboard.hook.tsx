import { useState, useCallback, useEffect } from 'react';
import { useInput, useFocus } from 'ink';
import type { ListKeyboardHandlers, ListPagination, ItemActionHandler } from '../list.types.ts';
import type { Key } from 'react';
import { matchesKey, mergeKeyBindings, type KeyBindings } from '../utils/keyboard-utils.util.ts';

// ================================================
// List Keyboard Navigation Hook
// ================================================

/**
 * Hook for managing keyboard navigation within the list component
 * Provides keyboard shortcuts for navigation, selection, pagination, and actions
 */
export const useListKeyboard = <TData = any>(options: {
  /** Current list data */
  data: TData[];
  /** Current highlighted index */
  highlightedIndex: number;
  /** Set highlighted index callback */
  setHighlightedIndex: (index: number) => void;
  /** Current pagination state */
  pagination: ListPagination;
  /** Pagination change handler */
  onPaginationChange: (page: number, pageSize: number) => void;
  /** Current selection set */
  selection: Set<Key>;
  /** Selection change handler */
  onSelectionChange: (selection: Set<Key>) => void;
  /** Function to get unique key from item */
  getItemKey: (item: TData) => Key;
  /** Whether multiple selection is enabled */
  multiSelect?: boolean;
  /** Item action handler */
  onItemAction?: ItemActionHandler<TData>;
  /** Whether keyboard navigation is enabled */
  enabled?: boolean;
  /** Custom key bindings */
  keyBindings?: Partial<KeyBindings>;
}): ListKeyboardHandlers => {
  const {
    data,
    highlightedIndex,
    setHighlightedIndex,
    pagination,
    onPaginationChange,
    selection,
    onSelectionChange,
    getItemKey,
    multiSelect = false,
    onItemAction,
    enabled = true,
    keyBindings = {},
  } = options;

  const [hasFocus, setHasFocus] = useState(false);
  const { isFocused } = useFocus({ autoFocus: false });

  // Merge with default key bindings
  const finalKeyBindings: KeyBindings = mergeKeyBindings(keyBindings);

  // Sync focus state with Ink's focus
  useEffect(() => {
    setHasFocus(isFocused);
  }, [isFocused]);

  // Calculate current page bounds
  const currentPageStart = pagination.page * pagination.pageSize;
  const currentPageEnd = Math.min(currentPageStart + pagination.pageSize, data.length);
  const pageItemCount = currentPageEnd - currentPageStart;

  // ================================================
  // Navigation Functions
  // ================================================

  const moveUp = useCallback(() => {
    if (!enabled || data.length === 0) return;
    
    if (highlightedIndex > 0) {
      setHighlightedIndex(highlightedIndex - 1);
    } else if (pagination.hasPreviousPage) {
      // Move to previous page, last item
      onPaginationChange(pagination.page - 1, pagination.pageSize);
      setHighlightedIndex(pagination.pageSize - 1);
    }
  }, [
    enabled,
    data.length,
    highlightedIndex,
    pagination.hasPreviousPage,
    pagination.page,
    pagination.pageSize,
    setHighlightedIndex,
    onPaginationChange,
  ]);

  const moveDown = useCallback(() => {
    if (!enabled || data.length === 0) return;
    
    if (highlightedIndex < pageItemCount - 1) {
      setHighlightedIndex(highlightedIndex + 1);
    } else if (pagination.hasNextPage) {
      // Move to next page, first item
      onPaginationChange(pagination.page + 1, pagination.pageSize);
      setHighlightedIndex(0);
    }
  }, [
    enabled,
    data.length,
    highlightedIndex,
    pageItemCount,
    pagination.hasNextPage,
    pagination.page,
    pagination.pageSize,
    setHighlightedIndex,
    onPaginationChange,
  ]);

  const moveToTop = useCallback(() => {
    if (!enabled || data.length === 0) return;
    setHighlightedIndex(0);
  }, [enabled, data.length, setHighlightedIndex]);

  const moveToBottom = useCallback(() => {
    if (!enabled || data.length === 0) return;
    setHighlightedIndex(Math.max(0, pageItemCount - 1));
  }, [enabled, data.length, pageItemCount, setHighlightedIndex]);

  const nextPage = useCallback(() => {
    if (!enabled || !pagination.hasNextPage) return;
    onPaginationChange(pagination.page + 1, pagination.pageSize);
    setHighlightedIndex(0);
  }, [enabled, pagination.hasNextPage, pagination.page, pagination.pageSize, onPaginationChange, setHighlightedIndex]);

  const previousPage = useCallback(() => {
    if (!enabled || !pagination.hasPreviousPage) return;
    onPaginationChange(pagination.page - 1, pagination.pageSize);
    setHighlightedIndex(0);
  }, [enabled, pagination.hasPreviousPage, pagination.page, pagination.pageSize, onPaginationChange, setHighlightedIndex]);

  const firstPage = useCallback(() => {
    if (!enabled || pagination.page === 0) return;
    onPaginationChange(0, pagination.pageSize);
    setHighlightedIndex(0);
  }, [enabled, pagination.page, pagination.pageSize, onPaginationChange, setHighlightedIndex]);

  const lastPage = useCallback(() => {
    if (!enabled || pagination.page === pagination.totalPages - 1) return;
    onPaginationChange(pagination.totalPages - 1, pagination.pageSize);
    setHighlightedIndex(0);
  }, [enabled, pagination.page, pagination.totalPages, pagination.pageSize, onPaginationChange, setHighlightedIndex]);

  // ================================================
  // Selection Functions
  // ================================================

  const toggleSelection = useCallback(() => {
    if (!enabled || data.length === 0 || highlightedIndex >= data.length) return;
    
    const currentPageItemIndex = currentPageStart + highlightedIndex;
    const item = data[currentPageItemIndex];
    const itemKey = getItemKey(item);
    
    const newSelection = new Set(selection);
    
    if (selection.has(itemKey)) {
      newSelection.delete(itemKey);
    } else {
      if (!multiSelect) {
        newSelection.clear();
      }
      newSelection.add(itemKey);
    }
    
    onSelectionChange(newSelection);
  }, [
    enabled,
    data,
    highlightedIndex,
    currentPageStart,
    getItemKey,
    selection,
    multiSelect,
    onSelectionChange,
  ]);

  const selectAll = useCallback(() => {
    if (!enabled || !multiSelect || data.length === 0) return;
    
    const newSelection = new Set<Key>();
    data.forEach(item => {
      newSelection.add(getItemKey(item));
    });
    
    onSelectionChange(newSelection);
  }, [enabled, multiSelect, data, getItemKey, onSelectionChange]);

  const deselectAll = useCallback(() => {
    if (!enabled || selection.size === 0) return;
    onSelectionChange(new Set());
  }, [enabled, selection.size, onSelectionChange]);

  const triggerAction = useCallback(() => {
    if (!enabled || !onItemAction || data.length === 0 || highlightedIndex >= pageItemCount) return;
    
    const currentPageItemIndex = currentPageStart + highlightedIndex;
    const item = data[currentPageItemIndex];
    
    onItemAction(item, currentPageItemIndex);
  }, [
    enabled,
    onItemAction,
    data,
    highlightedIndex,
    pageItemCount,
    currentPageStart,
  ]);

  // ================================================
  // Keyboard Input Handler
  // ================================================

  useInput((input, key) => {
    if (!enabled || !hasFocus) return;

    // Navigation
    if (matchesKey(key, input, finalKeyBindings.moveUp)) {
      moveUp();
    } else if (matchesKey(key, input, finalKeyBindings.moveDown)) {
      moveDown();
    } else if (matchesKey(key, input, finalKeyBindings.moveToTop)) {
      moveToTop();
    } else if (matchesKey(key, input, finalKeyBindings.moveToBottom)) {
      moveToBottom();
    } else if (matchesKey(key, input, finalKeyBindings.pageUp)) {
      moveToTop();
    } else if (matchesKey(key, input, finalKeyBindings.pageDown)) {
      moveToBottom();
    }
    
    // Pagination
    else if (matchesKey(key, input, finalKeyBindings.nextPage)) {
      nextPage();
    } else if (matchesKey(key, input, finalKeyBindings.previousPage)) {
      previousPage();
    } else if (matchesKey(key, input, finalKeyBindings.firstPage)) {
      firstPage();
    } else if (matchesKey(key, input, finalKeyBindings.lastPage)) {
      lastPage();
    }
    
    // Selection
    else if (matchesKey(key, input, finalKeyBindings.toggleSelect)) {
      toggleSelection();
    } else if (matchesKey(key, input, finalKeyBindings.selectAll)) {
      selectAll();
    } else if (matchesKey(key, input, finalKeyBindings.deselectAll)) {
      deselectAll();
    }
    
    // Actions
    else if (matchesKey(key, input, finalKeyBindings.triggerAction)) {
      triggerAction();
    }
  });

  // ================================================
  // Return Interface
  // ================================================

  return {
    hasFocus,
    setFocus: setHasFocus,
    moveUp,
    moveDown,
    toggleSelection,
    triggerAction,
    nextPage,
    previousPage,
  };
};

// ================================================
// Types moved to keyboard-utils.util.ts
// ================================================