import React, { useState, useMemo } from 'react';
import { Box, Text, useInput, useFocus } from 'ink';
import type { 
  ListFooterProps, 
  PaginationControls, 
  FooterLayout,
  FooterSection 
} from './list-footer.types.ts';
import type { ListPagination, PaginationChangeHandler } from '../../list.types.ts';

// ================================================
// List Footer Component
// ================================================

/**
 * List footer component with pagination controls and summary information
 * Provides responsive layout and keyboard navigation for pagination
 */
export const ListFooter: React.FC<ListFooterProps> = ({
  pagination,
  onPaginationChange,
  selectedCount = 0,
  filteredCount,
  terminalWidth = 80,
  paginationEnabled = true,
  showCounts = true,
  showSelection = true,
  customContent,
}: ListFooterProps) => {
  const [focusedControl, setFocusedControl] = useState<string | null>(null);
  const { isFocused } = useFocus({ autoFocus: false });

  // Calculate layout based on available width
  const layout: FooterLayout = useMemo(() => ({
    distribution: 'space-between',
    stackOnNarrow: true,
    narrowThreshold: 60,
    padding: 1,
  }), []);

  const isNarrowScreen = terminalWidth < layout.narrowThreshold!;

  // Handle keyboard navigation
  useInput((input, key) => {
    if (!isFocused || !paginationEnabled) return;

    if (key.leftArrow && pagination.hasPreviousPage) {
      onPaginationChange(pagination.page - 1, pagination.pageSize);
    } else if (key.rightArrow && pagination.hasNextPage) {
      onPaginationChange(pagination.page + 1, pagination.pageSize);
    } else if (key.upArrow) {
      // Increase page size
      const newPageSize = Math.min(100, pagination.pageSize + 10);
      onPaginationChange(pagination.page, newPageSize);
    } else if (key.downArrow) {
      // Decrease page size
      const newPageSize = Math.max(5, pagination.pageSize - 10);
      onPaginationChange(pagination.page, newPageSize);
    } else if ((key as any).home) {
      // Go to first page
      onPaginationChange(0, pagination.pageSize);
    } else if ((key as any).end) {
      // Go to last page
      onPaginationChange(pagination.totalPages - 1, pagination.pageSize);
    }
  });

  // Build footer sections
  const sections = useMemo(() => {
    const footerSections: FooterSection[] = [];

    // Selection and count info (left side)
    if (showCounts || showSelection) {
      footerSections.push({
        id: 'info',
        content: (
          <InfoSection
            totalItems={pagination.totalItems}
            filteredCount={filteredCount}
            selectedCount={selectedCount}
            showCounts={showCounts}
            showSelection={showSelection}
          />
        ),
        align: 'left',
        visible: true,
      });
    }

    // Custom content (center)
    if (customContent) {
      footerSections.push({
        id: 'custom',
        content: customContent,
        align: 'center',
        visible: true,
      });
    }

    // Pagination controls (right side)
    if (paginationEnabled && pagination.totalPages > 1) {
      footerSections.push({
        id: 'pagination',
        content: (
          <PaginationSection
            pagination={pagination}
            onPaginationChange={onPaginationChange}
            focused={isFocused}
          />
        ),
        align: 'right',
        visible: true,
      });
    }

    return footerSections.filter(s => s.visible);
  }, [
    pagination,
    selectedCount,
    filteredCount,
    showCounts,
    showSelection,
    customContent,
    paginationEnabled,
    isFocused,
    onPaginationChange,
  ]);

  if (sections.length === 0) {
    return null;
  }

  return (
    <Box flexDirection="column" marginTop={1}>
      {/* Separator Line */}
      <Box>
        <Text color="gray">
          {'─'.repeat(Math.max(0, terminalWidth - 2))}
        </Text>
      </Box>

      {/* Footer Content */}
      <Box
        paddingY={layout.padding}
        flexDirection={isNarrowScreen ? 'column' : 'row'}
        justifyContent={isNarrowScreen ? 'flex-start' : 'space-between'}
        width={terminalWidth}
      >
        {sections.map((section: FooterSection, index: number) => (
          <Box
            key={section.id}
            justifyContent={getJustifyContent(section.align)}
            marginBottom={isNarrowScreen && index < sections.length - 1 ? 1 : 0}
          >
            {section.content}
          </Box>
        ))}
      </Box>

      {/* Keyboard Help */}
      {isFocused && paginationEnabled && (
        <Box justifyContent="center" marginTop={1}>
          <Text color="gray" dimColor>
            ← → Navigate pages • ↑ ↓ Change page size • Home/End First/Last page
          </Text>
        </Box>
      )}
    </Box>
  );
};

// ================================================
// Info Section Component
// ================================================

/**
 * Information section showing counts and selection status
 */
const InfoSection: React.FC<{
  totalItems: number;
  filteredCount?: number;
  selectedCount: number;
  showCounts: boolean;
  showSelection: boolean;
}> = ({ totalItems, filteredCount, selectedCount, showCounts, showSelection }: {
  totalItems: number;
  filteredCount?: number;
  selectedCount: number;
  showCounts: boolean;
  showSelection: boolean;
}) => {
  const parts: string[] = [];

  if (showCounts) {
    if (filteredCount !== undefined && filteredCount !== totalItems) {
      parts.push(`${filteredCount} of ${totalItems} items`);
    } else {
      parts.push(`${totalItems} items`);
    }
  }

  if (showSelection && selectedCount > 0) {
    parts.push(`${selectedCount} selected`);
  }

  if (parts.length === 0) return null;

  return (
    <Text color="gray">
      {parts.join(' • ')}
    </Text>
  );
};

// ================================================
// Pagination Section Component
// ================================================

/**
 * Pagination controls section
 */
const PaginationSection: React.FC<{
  pagination: ListPagination;
  onPaginationChange: PaginationChangeHandler;
  focused: boolean;
}> = ({ pagination, onPaginationChange, focused }: {
  pagination: ListPagination;
  onPaginationChange: PaginationChangeHandler;
  focused: boolean;
}) => {
  const { page, totalPages, pageSize, hasNextPage, hasPreviousPage } = pagination;
  const currentPage = page + 1; // Convert from 0-based to 1-based

  return (
    <Box flexDirection="row" alignItems="center">
      {/* Previous Page Button */}
      <Text color={hasPreviousPage ? (focused ? 'blueBright' : 'blue') : 'gray'}>
        {hasPreviousPage ? '◀' : '◁'}
      </Text>

      <Box marginLeft={1} marginRight={1}>
        <Text color="gray">
          Page {currentPage} of {totalPages}
        </Text>
      </Box>

      {/* Next Page Button */}
      <Text color={hasNextPage ? (focused ? 'blueBright' : 'blue') : 'gray'}>
        {hasNextPage ? '▶' : '▷'}
      </Text>

      {/* Page Size Info */}
      <Box marginLeft={2}>
        <Text color="gray">
          ({pageSize}/page)
        </Text>
      </Box>
    </Box>
  );
};

// ================================================
// Helper Functions
// ================================================

/**
 * Convert alignment to Ink justifyContent value
 */
function getJustifyContent(align?: string): 'flex-start' | 'center' | 'flex-end' {
  switch (align) {
    case 'center':
      return 'center';
    case 'right':
      return 'flex-end';
    default:
      return 'flex-start';
  }
}