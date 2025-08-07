import type { ReactNode } from 'react';
import type { ListColumn } from '../../list.types.ts';

// ================================================
// Grid Layout Types
// ================================================

/**
 * Props for GridLayout component
 */
export interface GridLayoutProps {
  /** Column definitions with width specifications */
  columns: ListColumn[];
  /** Available terminal width */
  terminalWidth: number;
  /** Minimum total width required (optional) */
  minWidth?: number;
  /** Maximum total width allowed (optional) */
  maxWidth?: number;
  /** Padding between columns */
  columnGap?: number;
  /** Children to render within the grid */
  children: ReactNode;
}

/**
 * Column width calculation result
 */
export interface ColumnCalculation {
  /** Final calculated width for the column */
  width: number;
  /** Whether this column was truncated from its desired width */
  truncated: boolean;
  /** Original width specification */
  originalWidth: number | 'flex';
}

/**
 * Complete grid calculation result
 */
export interface GridCalculation {
  /** Individual column calculations */
  columns: ColumnCalculation[];
  /** Total width used by all columns */
  totalWidth: number;
  /** Whether the grid fits within available width */
  fitsInTerminal: boolean;
  /** Amount of unused width (if any) */
  remainingWidth: number;
}