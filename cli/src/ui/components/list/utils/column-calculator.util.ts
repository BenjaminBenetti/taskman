import type { ListColumn } from '../list.types.ts';

// ================================================
// Column Width Calculator Utilities
// ================================================

/**
 * Configuration for column width calculation
 */
export interface ColumnCalculatorConfig {
  /** Available terminal width */
  terminalWidth: number;
  /** Gap between columns */
  columnGap: number;
  /** Reserved width for borders and padding */
  reservedWidth: number;
  /** Minimum width for any column */
  minColumnWidth: number;
  /** Maximum width for any column */
  maxColumnWidth: number;
}

/**
 * Result of column width calculation
 */
export interface CalculatedColumn {
  /** Original column definition */
  column: ListColumn;
  /** Calculated width */
  width: number;
  /** Whether the column was truncated */
  truncated: boolean;
  /** Type of width calculation applied */
  type: 'fixed' | 'flex' | 'constrained';
}

/**
 * Complete calculation result
 */
export interface ColumnCalculationResult {
  /** Calculated column information */
  columns: CalculatedColumn[];
  /** Final column widths array */
  widths: number[];
  /** Total width used */
  totalWidth: number;
  /** Whether layout fits in terminal */
  fits: boolean;
  /** Unused width available */
  remaining: number;
}

/**
 * Calculate optimal column widths based on terminal constraints and column definitions
 */
export function calculateColumnWidths(
  columns: ListColumn[],
  config: ColumnCalculatorConfig
): ColumnCalculationResult {
  if (columns.length === 0) {
    return {
      columns: [],
      widths: [],
      totalWidth: 0,
      fits: true,
      remaining: config.terminalWidth,
    };
  }

  const {
    terminalWidth,
    columnGap,
    reservedWidth,
    minColumnWidth,
    maxColumnWidth,
  } = config;

  // Calculate available width
  const gapWidth = columnGap * (columns.length - 1);
  const availableWidth = Math.max(
    0,
    terminalWidth - reservedWidth - gapWidth
  );

  const result: CalculatedColumn[] = [];
  const widths: number[] = [];
  let totalUsedWidth = 0;

  // Phase 1: Process fixed-width columns
  const fixedIndices: number[] = [];
  const flexIndices: number[] = [];

  columns.forEach((column, index) => {
    if (typeof column.width === 'number') {
      fixedIndices.push(index);
    } else {
      flexIndices.push(index);
    }
  });

  // Calculate fixed columns
  fixedIndices.forEach((index) => {
    const column = columns[index];
    const requestedWidth = column.width as number;
    
    // Apply global constraints
    let width = Math.max(minColumnWidth, Math.min(maxColumnWidth, requestedWidth));
    
    // Apply column-specific constraints
    if (column.minWidth !== undefined) {
      width = Math.max(width, column.minWidth);
    }
    if (column.maxWidth !== undefined) {
      width = Math.min(width, column.maxWidth);
    }

    const truncated = width !== requestedWidth;
    const type = truncated ? 'constrained' : 'fixed';

    result[index] = { column, width, truncated, type };
    widths[index] = width;
    totalUsedWidth += width;
  });

  // Phase 2: Calculate flexible columns
  const remainingWidth = Math.max(0, availableWidth - totalUsedWidth);
  const flexCount = flexIndices.length;

  if (flexCount > 0) {
    const baseFlexWidth = Math.floor(remainingWidth / flexCount);
    let extraWidth = remainingWidth % flexCount;

    flexIndices.forEach((index, flexIndex) => {
      const column = columns[index];
      
      // Calculate base width with extra pixel distribution
      let width = baseFlexWidth + (flexIndex < extraWidth ? 1 : 0);
      
      // Apply minimum width
      const minWidth = Math.max(
        column.minWidth || minColumnWidth,
        minColumnWidth
      );
      width = Math.max(width, minWidth);
      
      // Apply maximum width
      const maxWidth = Math.min(
        column.maxWidth || maxColumnWidth,
        maxColumnWidth
      );
      width = Math.min(width, maxWidth);

      const truncated = width < baseFlexWidth || 
                       (column.minWidth && width > column.minWidth) ||
                       (column.maxWidth && width < column.maxWidth);

      result[index] = { column, width, truncated, type: 'flex' };
      widths[index] = width;
      totalUsedWidth += width;
    });
  }

  // Calculate final metrics
  const totalWidth = totalUsedWidth + gapWidth;
  const fits = totalWidth <= (terminalWidth - reservedWidth);
  const remaining = Math.max(0, terminalWidth - reservedWidth - totalWidth);

  return {
    columns: result,
    widths,
    totalWidth,
    fits,
    remaining,
  };
}

/**
 * Get default column calculator configuration
 */
export function getDefaultColumnConfig(terminalWidth: number): ColumnCalculatorConfig {
  return {
    terminalWidth,
    columnGap: 1,
    reservedWidth: 4,
    minColumnWidth: 8,
    maxColumnWidth: 50,
  };
}

/**
 * Calculate minimum required width for all columns
 */
export function calculateMinimumWidth(
  columns: ListColumn[],
  config: Partial<ColumnCalculatorConfig> = {}
): number {
  const {
    columnGap = 1,
    reservedWidth = 4,
    minColumnWidth = 8,
  } = config;

  if (columns.length === 0) return reservedWidth;

  const minWidths = columns.map((column) => {
    if (typeof column.width === 'number') {
      return Math.max(column.minWidth || minColumnWidth, minColumnWidth);
    }
    return column.minWidth || minColumnWidth;
  });

  const totalMinWidth = minWidths.reduce((sum, width) => sum + width, 0);
  const gapWidth = columnGap * (columns.length - 1);

  return totalMinWidth + gapWidth + reservedWidth;
}

/**
 * Check if columns can fit within given terminal width
 */
export function canFitColumns(
  columns: ListColumn[],
  terminalWidth: number,
  config: Partial<ColumnCalculatorConfig> = {}
): boolean {
  const minRequiredWidth = calculateMinimumWidth(columns, config);
  return terminalWidth >= minRequiredWidth;
}