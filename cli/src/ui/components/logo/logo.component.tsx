import React from 'react';
import { Text, Box } from 'ink';
import type { LogoProps } from '../dashboard/dashboard.types.ts';

// ================================================
// Logo Component
// ================================================

/**
 * TaskMan ASCII logo component
 * Extracted from auth page for reuse across the application
 */
export const Logo: React.FC<LogoProps> = ({ size = 'medium' }) => {
  const logoLines = [
    '▓▓▓▓▓▓▓▓  ▒▒▒▒▒  ███▓▓▓▓ ▒▒  ▓▓ ▓██    ███ ▒▒▒▒▒  ███    ▒▒',
    '   ▓▓    ██   ▒▒ ▓▓      ██  ▓▓  ████  ████ ██   ▒▒ ████   ▓▓',
    '   ▓▓    ▓██▒▒▒▒ ▒▒▓▓███ ▓▓▒▒▒   ▒▒ ▓▓▓▓ ▒▒ ▓██▒▒▒▒ ▒▒ ██  ▓▓',
    '   ▓▓    ██   ▒▒      ▓▓ ▓▓  ██  ▒▒  ██  ▒▒ ██   ▒▒ ▒▒  ██ ▓▓',
    '   ▓▓    ██   ▒▒ ▓██▓▓▓▒ ▓▓   ██ ▒▒      ▒▒ ██   ▒▒ ▒▒   ████',
  ];

  const colors = ['redBright', 'yellowBright', 'greenBright', 'cyanBright', 'blueBright'] as const;

  // Adjust spacing based on size
  const marginTop = size === 'small' ? 0 : size === 'medium' ? 1 : 2;
  const marginBottom = size === 'small' ? 0 : size === 'medium' ? 1 : 2;

  return (
    <Box flexDirection="column" marginTop={marginTop} marginBottom={marginBottom}>
      {logoLines.map((line, index) => (
        <Box key={`logo-line-${index}`}>
          <Text bold color={colors[index]}>
            {line}
          </Text>
        </Box>
      ))}
    </Box>
  );
};