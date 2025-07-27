import React from 'react';
import { Text, Box } from 'ink';
import type { HeaderProps } from '../dashboard/dashboard.types.ts';
import { Logo } from '../logo/logo.component.tsx';

// ================================================
// Header Component
// ================================================

/**
 * Dashboard header component displaying logo and optional title
 * Provides consistent branding across all dashboard pages
 */
export const Header: React.FC<HeaderProps> = ({ 
  terminalWidth = 80
}) => {
  return (
    <Box flexDirection="column"  paddingBottom={0}>
      <Box flexDirection="row" justifyContent="flex-end" paddingRight={4}>
        <Box>
          {/* Status area */}
        </Box>
        <Logo size="small" />
      </Box>
      
      {/* Separator Line */}
      <Box marginTop={0}>
        <Text color="gray">
          {'─'.repeat(Math.max(terminalWidth - 2, 20))}
        </Text>
      </Box>
    </Box>
  );
};