import type { ReactNode, Key } from 'react';
import type { ListColumn, ItemActionHandler } from '../../list.types.ts';

// ================================================
// Table Row Types
// ================================================

/**
 * Props for TableRow component
 */
export interface TableRowProps<TData = any> {
  /** Data item for this row */
  item: TData;
  /** Row index in the list */
  index: number;
  /** Column definitions */
  columns: ListColumn<TData>[];
  /** Calculated column widths */
  columnWidths: number[];
  /** Whether this row is selected */
  selected?: boolean;
  /** Whether this row is highlighted/focused */
  highlighted?: boolean;
  /** Whether this row is even (for alternating colors) */
  even?: boolean;
  /** Selection change handler */
  onSelectionChange?: (selected: boolean) => void;
  /** Item action handler (double-click, enter, etc.) */
  onItemAction?: ItemActionHandler<TData>;
  /** Column gap/padding */
  columnGap?: number;
  /** Custom row styling */
  rowStyle?: RowStyle;
}

/**
 * Props for individual table cells
 */
export interface TableCellProps<TData = any> {
  /** Column definition */
  column: ListColumn<TData>;
  /** Data item */
  item: TData;
  /** Cell value (extracted from item) */
  value: any;
  /** Row index */
  rowIndex: number;
  /** Column index */
  columnIndex: number;
  /** Cell width */
  width: number;
  /** Whether the parent row is selected */
  rowSelected?: boolean;
  /** Whether the parent row is highlighted */
  rowHighlighted?: boolean;
  /** Whether this cell has focus */
  cellFocused?: boolean;
}

/**
 * Row styling configuration
 */
export interface RowStyle {
  /** Background color for normal rows */
  normalBg?: string;
  /** Background color for selected rows */
  selectedBg?: string;
  /** Background color for highlighted rows */
  highlightedBg?: string;
  /** Text color for normal rows */
  normalColor?: string;
  /** Text color for selected rows */
  selectedColor?: string;
  /** Text color for highlighted rows */
  highlightedColor?: string;
  /** Border style for selected rows */
  selectedBorder?: 'single' | 'double' | 'round' | 'none';
  /** Border color for selected rows */
  selectedBorderColor?: string;
  /** Whether to use alternating row colors */
  alternateColors?: boolean;
  /** Background color for even rows (when alternating) */
  evenBg?: string;
  /** Background color for odd rows (when alternating) */
  oddBg?: string;
}

/**
 * Cell rendering context
 */
export interface CellRenderContext<TData = any> {
  /** Raw cell value */
  value: any;
  /** Complete data item */
  item: TData;
  /** Column definition */
  column: ListColumn<TData>;
  /** Row index */
  rowIndex: number;
  /** Column index */
  columnIndex: number;
  /** Row selection state */
  selected: boolean;
  /** Row highlight state */
  highlighted: boolean;
}

/**
 * Default row styling
 */
export const DEFAULT_ROW_STYLE: RowStyle = {
  normalBg: 'transparent',
  selectedBg: 'blue',
  highlightedBg: 'gray',
  normalColor: 'white',
  selectedColor: 'white',
  highlightedColor: 'white',
  selectedBorder: 'single',
  selectedBorderColor: 'blue',
  alternateColors: false,
  evenBg: 'transparent',
  oddBg: 'transparent',
};