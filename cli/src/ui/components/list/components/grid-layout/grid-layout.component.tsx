import React from 'react';
import { Box } from 'ink';
import type { GridLayoutProps } from './grid-layout.types.ts';
import { useColumnWidth } from '../../hooks/use-column-width.hook.tsx';

// ================================================
// Grid Layout Component
// ================================================

/**
 * Grid layout component that provides column-based layout for list items
 * Handles responsive column sizing and alignment within terminal constraints
 */
export const GridLayout: React.FC<GridLayoutProps> = ({
  columns,
  terminalWidth,
  minWidth,
  maxWidth,
  columnGap = 1,
  children,
}: GridLayoutProps) => {
  // Calculate optimal column widths
  const { columnWidths, fitsInTerminal } = useColumnWidth(
    columns,
    terminalWidth,
    {
      columnGap,
      reservedWidth: 4,
    }
  );

  // Apply width constraints if specified
  const constrainedWidth = Math.min(
    maxWidth || terminalWidth,
    Math.max(minWidth || 0, terminalWidth)
  );

  return (
    <Box
      flexDirection="column"
      width={constrainedWidth}
      minWidth={minWidth}
      maxWidth={maxWidth}
    >
      {/* Pass column widths to children via context or props */}
      {React.Children.map(children, (child: React.ReactNode) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            columnWidths,
            fitsInTerminal,
            ...child.props,
          });
        }
        return child;
      })}
    </Box>
  );
};