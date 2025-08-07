import React, { useMemo } from 'react';
import { Box, Text } from 'ink';
import type { 
  TableRowProps, 
  TableCellProps, 
  RowStyle, 
  CellRenderContext 
} from './table-row.types.ts';
import { DEFAULT_ROW_STYLE } from './table-row.types.ts';

// ================================================
// Table Row Component
// ================================================

/**
 * Generic table row component with customizable cell rendering
 * Supports selection, highlighting, and flexible data presentation
 */
export const TableRow: React.FC<TableRowProps> = ({
  item,
  index,
  columns,
  columnWidths,
  selected = false,
  highlighted = false,
  even = false,
  onSelectionChange,
  onItemAction,
  columnGap = 1,
  rowStyle = DEFAULT_ROW_STYLE,
}: TableRowProps) => {
  // Determine row styling based on state
  const finalRowStyle = useMemo(() => ({
    ...DEFAULT_ROW_STYLE,
    ...rowStyle,
  }), [rowStyle]);

  const backgroundColor = useMemo(() => {
    if (selected) return finalRowStyle.selectedBg;
    if (highlighted) return finalRowStyle.highlightedBg;
    if (finalRowStyle.alternateColors) {
      return even ? finalRowStyle.evenBg : finalRowStyle.oddBg;
    }
    return finalRowStyle.normalBg;
  }, [selected, highlighted, even, finalRowStyle]);

  const textColor = useMemo(() => {
    if (selected) return finalRowStyle.selectedColor;
    if (highlighted) return finalRowStyle.highlightedColor;
    return finalRowStyle.normalColor;
  }, [selected, highlighted, finalRowStyle]);

  const borderStyle = selected ? finalRowStyle.selectedBorder : 'none';
  const borderColor = selected ? finalRowStyle.selectedBorderColor : 'gray';

  // Handle row actions
  const handleRowAction = () => {
    if (onItemAction) {
      onItemAction(item, index);
    }
  };

  const handleSelectionToggle = () => {
    if (onSelectionChange) {
      onSelectionChange(!selected);
    }
  };

  return (
    <Box
      flexDirection="row"
      backgroundColor={backgroundColor}
      borderStyle={borderStyle}
      borderColor={borderColor}
      paddingX={selected ? 1 : 0}
    >
      {columns.map((column, columnIndex) => {
        const width = columnWidths[columnIndex] || 10;
        const value = getColumnValue(item, column);

        return (
          <TableCell
            key={column.key}
            column={column}
            item={item}
            value={value}
            rowIndex={index}
            columnIndex={columnIndex}
            width={width}
            rowSelected={selected}
            rowHighlighted={highlighted}
          />
        );
      })}
    </Box>
  );
};

// ================================================
// Table Cell Component
// ================================================

/**
 * Individual table cell component with custom rendering support
 */
const TableCell: React.FC<TableCellProps> = ({
  column,
  item,
  value,
  rowIndex,
  columnIndex,
  width,
  rowSelected = false,
  rowHighlighted = false,
  cellFocused = false,
}: TableCellProps) => {
  // Create render context
  const renderContext: CellRenderContext = {
    value,
    item,
    column,
    rowIndex,
    columnIndex,
    selected: rowSelected,
    highlighted: rowHighlighted,
  };

  // Determine cell content
  const cellContent = useMemo(() => {
    try {
      // Use custom render function if provided
      if (column.render) {
        return column.render(value, item, rowIndex);
      }

      // Default rendering based on value type
      return formatDefaultValue(value);
    } catch (error) {
      console.error(`Cell render function failed for column ${column.key}:`, error);
      return formatDefaultValue(value);
    }
  }, [column.render, value, item, rowIndex]);

  // Calculate padding and alignment
  const alignment = column.align || 'left';
  const paddingX = 1;
  const availableWidth = Math.max(1, width - (paddingX * 2));

  return (
    <Box
      width={width}
      paddingX={paddingX}
      justifyContent={getJustifyContent(alignment)}
      alignItems="center"
      minHeight={1}
    >
      {typeof cellContent === 'string' || typeof cellContent === 'number' ? (
        <Text wrap="truncate">
          {truncateCellText(String(cellContent), availableWidth)}
        </Text>
      ) : (
        // Render custom React elements
        <Box width={availableWidth}>
          {cellContent}
        </Box>
      )}
    </Box>
  );
};

// ================================================
// Helper Functions
// ================================================

/**
 * Extract column value from data item with proper type safety and error handling
 */
function getColumnValue<TData>(item: TData, column: any): any {
  try {
    if (column.getSortValue) {
      return column.getSortValue(item);
    }

    // Use column key to extract value from item
    const keys = column.key.split('.');
    let value: any = item;

    for (const key of keys) {
      if (value == null || typeof value !== 'object') {
        return undefined;
      }
      value = value[key];
    }

    return value;
  } catch (error) {
    console.warn(`Failed to extract value for column ${column.key}:`, error);
    return undefined;
  }
}

/**
 * Format value for default display
 */
function formatDefaultValue(value: any): string {
  if (value == null) {
    return '';
  }

  if (typeof value === 'boolean') {
    return value ? '✓' : '✗';
  }

  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  if (Array.isArray(value)) {
    return `[${value.length} items]`;
  }

  if (typeof value === 'object') {
    return '[Object]';
  }

  return String(value);
}

/**
 * Truncate cell text to fit within available width
 */
function truncateCellText(text: string, maxWidth: number): string {
  if (text.length <= maxWidth) {
    return text;
  }

  if (maxWidth <= 3) {
    return text.substring(0, maxWidth);
  }

  return text.substring(0, maxWidth - 3) + '...';
}

/**
 * Convert alignment to Ink justifyContent value
 */
function getJustifyContent(align: string): 'flex-start' | 'center' | 'flex-end' {
  switch (align) {
    case 'center':
      return 'center';
    case 'right':
      return 'flex-end';
    default:
      return 'flex-start';
  }
}