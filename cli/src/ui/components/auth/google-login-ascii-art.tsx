import React from 'react';
import { Text, Box } from 'ink';

/**
 * Simple "Google Login" title component
 * 
 * Uses the TaskMan color scheme with clean, readable text to create
 * a visually appealing header for the Google authentication flow.
 */
export const GoogleLoginAsciiArt: React.FC = () => {
  return (
    <Box flexDirection="column" alignItems="center">
      {/* ASCII Art for "Google Login" on single line */}
      <Box flexDirection="column" alignItems="center" marginBottom={1}>
        <Text color="redBright">  ██████   ██████   ██████   ██████  ██      ███████       ██       ██████   ██████  ██ ███    ██ </Text>
        <Text color="yellowBright"> ██       ██    ██ ██    ██ ██       ██      ██            ██      ██    ██ ██       ██ ████   ██ </Text>
        <Text color="greenBright"> ██   ███ ██    ██ ██    ██ ██   ███ ██      █████         ██      ██    ██ ██   ███ ██ ██ ██  ██ </Text>
        <Text color="cyanBright"> ██    ██ ██    ██ ██    ██ ██    ██ ██      ██            ██      ██    ██ ██    ██ ██ ██  ██ ██ </Text>
        <Text color="blueBright">  ██████   ██████   ██████   ██████  ███████ ███████       ███████  ██████   ██████  ██ ██   ████ </Text>
      </Box>
      
      {/* Decorative underline */}
      <Box justifyContent="center">
        <Text color="magentaBright">{'═'.repeat(105)}</Text>
      </Box>
    </Box>
  );
};