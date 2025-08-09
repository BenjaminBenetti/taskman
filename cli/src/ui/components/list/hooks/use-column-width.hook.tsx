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

  // Compute the minimum width needed to display a header label on a single line
  const headerMin = (col: ListColumn): number => {
    const labelLength = (col.label ?? '').length;
    const iconWidth = col.sortable ? 2 : 0; // width for sort icon + its left margin
    const paddingWidth = 2; // left + right padding used in header cells
    const borderWidth = 2; // Ink box border left + right
    return Math.max(1, labelLength + iconWidth + paddingWidth + borderWidth);
  };


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
      0,
      terminalWidth - reservedWidth - (columnGap * (columns.length - 1))
    );

    const columnWidths: number[] = [];
    let totalUsedWidth = 0;



    // Phase 1: Calculate fixed-width columns
    const fixedColumns: { index: number; width: number }[] = [];
    const flexColumns: { index: number; column: ListColumn }[] = [];

    columns.forEach((column, index) => {
      if (typeof column.width === 'number') {
        // Fixed width column - respect min/max constraints
        // Clamp requested width to global bounds first
        const upper = Math.min(maxColumnWidth, column.maxWidth ?? maxColumnWidth);
        const lower = Math.max(minColumnWidth, column.minWidth ?? minColumnWidth, headerMin(column));
        const requested = typeof column.width === 'number' ? column.width : lower;
        const finalWidth = Math.min(upper, Math.max(lower, requested));

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
      const extraWidth = remainingWidth % flexColumnCount;

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
          minColumnWidth,
          headerMin(column)
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