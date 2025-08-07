import React, { useMemo, useEffect } from 'react';
import { Box, Text, useStdout } from 'ink';
import type { GenericListProps } from './list.types.ts';

// Import global footer help hook
import { useFooterHelp } from '../../hooks/use-global-footer-help.hook.tsx';

// Import sub-components
import { SearchBar } from './components/search-bar/search-bar.component.tsx';
import { TableHeader } from './components/table-header/table-header.component.tsx';
import { TableRow } from './components/table-row/table-row.component.tsx';
import { ListFooter } from './components/list-footer/list-footer.component.tsx';
import { GridLayout } from './components/grid-layout/grid-layout.component.tsx';

// Import utilities
import { SafeRender } from './utils/safe-render.util.tsx';

// Import hooks
import { useListState } from './hooks/use-list-state.hook.tsx';
import { useListKeyboard } from './hooks/use-list-keyboard.hook.tsx';
import { useColumnWidth } from './hooks/use-column-width.hook.tsx';

// ================================================
// Generic List Component
// ================================================

/**
 * Generic list component that orchestrates all sub-components
 * Provides a complete table-like interface with search, sort, pagination, and selection
 */
export function GenericList<TData = unknown>({
  data,
  columns,
  loading = false,
  error = null,
  
  // Search Configuration
  searchConfig,
  searchQuery: externalSearchQuery = '',
  onSearchChange,
  
  // Sorting Configuration
  sort: externalSort,
  onSortChange,
  
  // Pagination Configuration
  pagination: externalPagination,
  onPaginationChange,
  
  // Selection Configuration
  selection: selectionConfig,
  onSelectionChange,
  
  // Actions
  onItemAction,
  
  // Rendering Customization
  emptyComponent,
  loadingComponent,
  errorComponent,
  
  // Layout Configuration
  showSearch = true,
  showFooter = true,
  showHeaders = true,
  minHeight = 0,
  maxHeight,
}: GenericListProps<TData>) {
  // ================================================
  // Terminal Dimensions
  // ================================================
  
  const { stdout } = useStdout();
  const terminalWidth = stdout?.columns || 80;
  const terminalHeight = stdout?.rows || 24;

  // ================================================
  // State Management
  // ================================================
  
  const {
    searchQuery,
    sort,
    pagination,
    selection,
    highlightedIndex,
    handleSearchChange,
    handleSortChange,
    handlePaginationChange,
    handleSelectionChange,
    handleHighlightChange,
  } = useListState({
    initialSearch: externalSearchQuery,
    initialSort: externalSort,
    initialPagination: externalPagination,
    initialSelection: selectionConfig?.selectedKeys,
    dataLength: data.length,
    defaultPageSize: 10,
  });

  // ================================================
  // Column Width Calculation
  // ================================================
  
  const { columnWidths } = useColumnWidth(columns, terminalWidth, {
    reservedWidth: 6,
    columnGap: 1,
  });

  // ================================================
  // Keyboard Navigation
  // ================================================
  
  const keyboardHandlers = useListKeyboard({
    data,
    highlightedIndex,
    setHighlightedIndex: handleHighlightChange,
    pagination,
    onPaginationChange: handlePaginationChange,
    selection,
    onSelectionChange: handleSelectionChange,
    getItemKey: selectionConfig?.getItemKey || ((item: TData) => String(data.indexOf(item))),
    multiSelect: selectionConfig?.multiple,
    onItemAction,
    enabled: !loading && !error && data.length > 0,
  });

  // ================================================
  // Global Footer Help Text
  // ================================================
  
  // Set footer help text when list is focused and interactive
  useFooterHelp(
    "↑↓ Navigate • Space Select • Enter Action • ←→ Change page • Esc Exit",
    keyboardHandlers.hasFocus && !loading && !error && data.length > 0
  );

  // ================================================
  // Event Handler Integration
  // ================================================
  
  // Integrate external handlers with internal state
  useEffect(() => {
    if (onSearchChange && searchQuery !== externalSearchQuery) {
      onSearchChange(searchQuery, {});
    }
  }, [searchQuery, onSearchChange, externalSearchQuery]);

  useEffect(() => {
    if (onSortChange && sort !== externalSort) {
      onSortChange(sort);
    }
  }, [sort, onSortChange, externalSort]);

  useEffect(() => {
    if (onPaginationChange && pagination !== externalPagination) {
      onPaginationChange(pagination.page, pagination.pageSize);
    }
  }, [pagination, onPaginationChange, externalPagination]);

  useEffect(() => {
    if (onSelectionChange) {
      const selectedItems = Array.from(selection).map(key => {
        return data.find((item, index) => 
          selectionConfig?.getItemKey(item) === key || String(index) === String(key)
        );
      }).filter(Boolean) as TData[];
      
      onSelectionChange(selection, selectedItems);
    }
  }, [selection, onSelectionChange, data, selectionConfig]);

  // ================================================
  // Data Processing
  // ================================================
  
  // Calculate current page data
  const currentPageData = useMemo(() => {
    const startIndex = pagination.page * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, pagination.page, pagination.pageSize]);

  // ================================================
  // Render States
  // ================================================
  
  // Error State
  if (error) {
    return (
      <Box flexDirection="column" minHeight={minHeight}>
        <SafeRender
          render={() => errorComponent || (
            <Box justifyContent="center" alignItems="center" flexGrow={1}>
              <Text color="red">⚠ Error: {error}</Text>
            </Box>
          )}
          fallback={
            <Box justifyContent="center" alignItems="center" flexGrow={1}>
              <Text color="red">⚠ Error: {error}</Text>
            </Box>
          }
          errorContext="error component"
        />
      </Box>
    );
  }

  // Loading State
  if (loading) {
    return (
      <Box flexDirection="column" minHeight={minHeight}>
        <SafeRender
          render={() => loadingComponent || (
            <Box justifyContent="center" alignItems="center" flexGrow={1}>
              <Text color="yellow">⏳ Loading...</Text>
            </Box>
          )}
          fallback={
            <Box justifyContent="center" alignItems="center" flexGrow={1}>
              <Text color="yellow">⏳ Loading...</Text>
            </Box>
          }
          errorContext="loading component"
        />
      </Box>
    );
  }

  // Empty State
  if (data.length === 0) {
    return (
      <Box flexDirection="column" minHeight={minHeight}>
        {showSearch && searchConfig && (
          <SearchBar
            query={searchQuery}
            config={searchConfig}
            onChange={handleSearchChange}
            terminalWidth={terminalWidth}
          />
        )}
        
        <Box justifyContent="center" alignItems="center" flexGrow={1}>
          <SafeRender
            render={() => emptyComponent || (
              <Box flexDirection="column" alignItems="center">
                <Text color="gray">📭 No items to display</Text>
                {searchQuery && (
                  <Text color="gray" dimColor>
                    Try adjusting your search query
                  </Text>
                )}
              </Box>
            )}
            fallback={
              <Box flexDirection="column" alignItems="center">
                <Text color="gray">📭 No items to display</Text>
                {searchQuery && (
                  <Text color="gray" dimColor>
                    Try adjusting your search query
                  </Text>
                )}
              </Box>
            }
            errorContext="empty component"
          />
        </Box>
      </Box>
    );
  }

  // ================================================
  // Main Render
  // ================================================

  const containerHeight = maxHeight ? Math.min(maxHeight, terminalHeight - 4) : terminalHeight - 4;

  return (
    <Box flexDirection="column" minHeight={minHeight} maxHeight={containerHeight}>
      {/* Search Bar */}
      {showSearch && searchConfig && (
        <SearchBar
          query={searchQuery}
          config={searchConfig}
          onChange={handleSearchChange}
          terminalWidth={terminalWidth}
        />
      )}

      {/* Table Header */}
      {showHeaders && (
        <TableHeader
          columns={columns}
          sort={sort}
          onSortChange={handleSortChange}
          columnWidths={columnWidths}
          terminalWidth={terminalWidth}
        />
      )}

      {/* Table Body */}
      <Box flexDirection="column" flexGrow={1} flexShrink={1} overflow="hidden">
        <GridLayout
          columns={columns}
          terminalWidth={terminalWidth}
          minWidth={Math.min(terminalWidth - 4, 40)}
        >
          {currentPageData.map((item: TData, index: number) => {
            const absoluteIndex = pagination.page * pagination.pageSize + index;
            const itemKey = selectionConfig?.getItemKey(item) || String(absoluteIndex);
            const isSelected = selection.has(itemKey);
            const isHighlighted = index === highlightedIndex;

            return (
              <TableRow
                key={String(itemKey)}
                item={item}
                index={absoluteIndex}
                columns={columns}
                columnWidths={columnWidths}
                selected={isSelected}
                highlighted={isHighlighted}
                even={index % 2 === 0}
                onSelectionChange={(selected: boolean) => {
                  const newSelection = new Set(selection);
                  if (selected) {
                    if (!selectionConfig?.multiple) {
                      newSelection.clear();
                    }
                    newSelection.add(itemKey);
                  } else {
                    newSelection.delete(itemKey);
                  }
                  handleSelectionChange(newSelection);
                }}
                onItemAction={onItemAction}
              />
            );
          })}
        </GridLayout>
      </Box>

      {/* Footer with Pagination */}
      {showFooter && (
        <ListFooter
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          selectedCount={selection.size}
          terminalWidth={terminalWidth}
          paginationEnabled={pagination.totalPages > 1}
          showCounts
          showSelection={selectionConfig?.multiple && selection.size > 0}
        />
      )}

    </Box>
  );
}

// ================================================
// Default Export
// ================================================

export { GenericList as default };