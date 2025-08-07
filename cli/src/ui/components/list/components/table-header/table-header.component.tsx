import React, { useState } from 'react';
import { Box, Text, useInput, useFocus } from 'ink';
import type { TableHeaderProps, HeaderCellProps, SortIndicator } from './table-header.types.ts';
import type { ListSort } from '../../list.types.ts';

// ================================================
// Table Header Component
// ================================================

/**
 * Table header component with sortable columns and visual indicators
 * Supports keyboard navigation and click-to-sort functionality
 */
export const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  sort,
  onSortChange,
  columnWidths,
  terminalWidth = 80,
  interactive = true,
  columnGap = 1,
}: TableHeaderProps) => {
  const [focusedColumnIndex, setFocusedColumnIndex] = useState(0);
  const { isFocused } = useFocus({ autoFocus: false });

  // Handle keyboard navigation
  useInput((input, key) => {
    if (!isFocused || !interactive) return;

    if (key.leftArrow) {
      setFocusedColumnIndex(Math.max(0, focusedColumnIndex - 1));
    } else if (key.rightArrow) {
      setFocusedColumnIndex(Math.min(columns.length - 1, focusedColumnIndex + 1));
    } else if (key.return || input === ' ') {
      const column = columns[focusedColumnIndex];
      if (column?.sortable && onSortChange) {
        handleSort(column.key);
      }
    }
  });

  // Handle sort logic
  const handleSort = (columnKey: string) => {
    if (!onSortChange) return;

    const currentSort = sort?.column === columnKey ? sort.direction : null;
    let newDirection: 'asc' | 'desc';

    if (currentSort === 'asc') {
      newDirection = 'desc';
    } else if (currentSort === 'desc') {
      // Toggle back to no sort (or could cycle back to 'asc')
      onSortChange(null);
      return;
    } else {
      newDirection = 'asc';
    }

    onSortChange({ column: columnKey, direction: newDirection });
  };

  // Sort indicator configuration
  const sortIndicator: SortIndicator = {
    ascIcon: '↑',
    descIcon: '↓',
    neutralIcon: '↕',
    activeColor: 'blue',
    inactiveColor: 'gray',
  };

  return (
    <Box flexDirection="column">
      {/* Header Row */}
      <Box flexDirection="row">
        {columns.map((column, index) => {
          const width = columnWidths[index] || 10;
          const sortState = sort?.column === column.key ? sort.direction : null;
          const focused = interactive && isFocused && focusedColumnIndex === index;

          return (
            <HeaderCell
              key={column.key}
              column={column}
              width={width}
              sortState={sortState}
              sortable={column.sortable}
              focused={focused}
              onSort={(direction: 'asc' | 'desc') => onSortChange?.({ column: column.key, direction })}
            />
          );
        })}
      </Box>

      {/* Header Separator */}
      <Box>
        <Text color="gray">
          {renderHeaderSeparator(columnWidths, columnGap, terminalWidth)}
        </Text>
      </Box>

      {/* Keyboard Help (when focused and interactive) */}
      {interactive && isFocused && (
        <Box marginTop={1}>
          <Text color="gray" dimColor>
            ← → Navigate columns • Enter/Space to sort • Esc to exit
          </Text>
        </Box>
      )}
    </Box>
  );
};

// ================================================
// Header Cell Component
// ================================================

/**
 * Individual header cell component with sorting capabilities
 */
const HeaderCell: React.FC<HeaderCellProps> = ({
  column,
  width,
  sortState,
  sortable = false,
  focused = false,
  onSort,
}: HeaderCellProps) => {
  // Determine sort indicator
  let sortIcon = '';
  let sortColor = 'gray';

  if (sortable) {
    if (sortState === 'asc') {
      sortIcon = '↑';
      sortColor = 'blue';
    } else if (sortState === 'desc') {
      sortIcon = '↓';
      sortColor = 'blue';
    } else {
      sortIcon = '↕';
      sortColor = focused ? 'white' : 'gray';
    }
  }

  // Calculate text width (accounting for sort indicator and padding)
  const iconWidth = sortable ? 2 : 0; // Space for sort icon
  const paddingWidth = 2; // Left and right padding
  const textWidth = Math.max(1, width - iconWidth - paddingWidth);

  // Truncate text if necessary
  const displayText = truncateText(column.label, textWidth);

  return (
    <Box
      width={width}
      borderStyle={focused ? 'double' : 'single'}
      borderColor={focused ? 'blue' : 'gray'}
      paddingX={1}
      justifyContent="space-between"
    >
      <Box flexDirection="row" alignItems="center" width="100%">
        {/* Column Label */}
        <Text
          bold={focused}
          color={focused ? 'blueBright' : 'white'}
          wrap="truncate"
        >
          {displayText}
        </Text>

        {/* Sort Indicator */}
        {sortable && (
          <Box marginLeft={1}>
            <Text color={sortColor}>
              {sortIcon}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// ================================================
// Helper Functions
// ================================================

/**
 * Render header separator line
 */
function renderHeaderSeparator(
  columnWidths: number[],
  columnGap: number,
  terminalWidth: number
): string {
  if (columnWidths.length === 0) {
    return '─'.repeat(Math.max(0, terminalWidth - 4));
  }

  const parts: string[] = [];
  
  columnWidths.forEach((width, index) => {
    // Add column separator
    parts.push('─'.repeat(Math.max(0, width)));
    
    // Add gap separator (except for last column)
    if (index < columnWidths.length - 1) {
      parts.push('─'.repeat(columnGap));
    }
  });

  return parts.join('');
}

/**
 * Truncate text to fit within specified width
 */
function truncateText(text: string, maxWidth: number): string {
  if (text.length <= maxWidth) {
    return text;
  }

  if (maxWidth <= 3) {
    return text.substring(0, maxWidth);
  }

  return text.substring(0, maxWidth - 3) + '...';
}