import { useMemo } from 'react';
import type { ListColumn, ColumnWidthCalculation } from '../list.types.ts';

// ================================================
// Column Width Calculation Hook
// ================================================

/**
 * Hook for calculating column widths based on terminal size and column definitions
 * Handles flexible columns, minimum/maximum widths, and overflow scenarios
 */
export const useColumnWidth = (
  columns: ListColumn[],
  terminalWidth: number,
  options: {
    /** Padding between columns */
    columnGap?: number;
    /** Minimum width for any column */
    minColumnWidth?: number;
    /** Maximum width for any column */
    maxColumnWidth?: number;
    /** Reserved width for borders and padding */
    reservedWidth?: number;
  } = {}
): ColumnWidthCalculation => {
  const {
    columnGap = 1,
    minColumnWidth = 8,
    maxColumnWidth = 50,
    reservedWidth = 4,
  } = options;

  return useMemo(() => {
    if (columns.length === 0) {
      return {
        columnWidths: [],
        totalWidth: 0,
        fitsInTerminal: true,
      };
    }

    // Available width after accounting for gaps and reserved space
    const availableWidth = Math.max(
      terminalWidth - reservedWidth - (columnGap * (columns.length - 1)),
      columns.length * minColumnWidth
    );

    const columnWidths: number[] = [];
    let totalUsedWidth = 0;

    // Phase 1: Calculate fixed-width columns
    const fixedColumns: { index: number; width: number }[] = [];
    const flexColumns: { index: number; column: ListColumn }[] = [];

    columns.forEach((column, index) => {
      if (typeof column.width === 'number') {
        // Fixed width column - respect min/max constraints
        const constrainedWidth = Math.max(
          minColumnWidth,
          Math.min(maxColumnWidth, column.width)
        );
        
        // Further constrain by column-specific min/max
        const finalWidth = Math.max(
          column.minWidth || minColumnWidth,
          Math.min(column.maxWidth || maxColumnWidth, constrainedWidth)
        );

        fixedColumns.push({ index, width: finalWidth });
        columnWidths[index] = finalWidth;
        totalUsedWidth += finalWidth;
      } else {
        // Flexible column
        flexColumns.push({ index, column });
        columnWidths[index] = 0; // Will be calculated later
      }
    });

    // Phase 2: Calculate flexible columns
    const remainingWidth = availableWidth - totalUsedWidth;
    const flexColumnCount = flexColumns.length;

    if (flexColumnCount > 0) {
      const baseFlexWidth = Math.floor(remainingWidth / flexColumnCount);
      let extraWidth = remainingWidth % flexColumnCount;

      flexColumns.forEach(({ index, column }, flexIndex) => {
        // Base width for this flex column
        let flexWidth = baseFlexWidth;
        
        // Distribute extra width to first few columns
        if (flexIndex < extraWidth) {
          flexWidth += 1;
        }

        // Apply column-specific constraints
        const minWidth = Math.max(
          column.minWidth || minColumnWidth,
          minColumnWidth
        );
        const maxWidth = Math.min(
          column.maxWidth || maxColumnWidth,
          maxColumnWidth
        );

        // Constrain the flex width
        flexWidth = Math.max(minWidth, Math.min(maxWidth, flexWidth));

        columnWidths[index] = flexWidth;
        totalUsedWidth += flexWidth;
      });
    }

    // Calculate final metrics
    const totalWidth = totalUsedWidth + (columnGap * (columns.length - 1));
    const fitsInTerminal = totalWidth <= (terminalWidth - reservedWidth);

    return {
      columnWidths,
      totalWidth,
      fitsInTerminal,
    };
  }, [columns, terminalWidth, columnGap, minColumnWidth, maxColumnWidth, reservedWidth]);
};