import React from 'react';
import { Box, Text } from 'ink';

/**
 * GitHub login ASCII art component
 * 
 * Displays stylized GitHub branding for the authentication flow.
 * Uses colors that complement the GitHub brand identity.
 */
export const GitHubLoginAsciiArt: React.FC = () => {
  return (
    <Box flexDirection="column" alignItems="center">
      {/* GitHub Icon ASCII Art */}
      <Box flexDirection="column" alignItems="center" marginBottom={1}>
        <Text bold color="white">
          {`    ████████████████████████    `}
        </Text>
        <Text bold color="white">
          {`  ██                      ██  `}
        </Text>
        <Text bold color="white">
          {`██    ████████████████    ██`}
        </Text>
        <Text bold color="white">
          {`██  ██                ██  ██`}
        </Text>
        <Text bold color="white">
          {`██    ██████    ██████    ██`}
        </Text>
        <Text bold color="white">
          {`██                        ██`}
        </Text>
        <Text bold color="white">
          {`██  ████    ████    ████  ██`}
        </Text>
        <Text bold color="white">
          {`  ██    ████    ████    ██  `}
        </Text>
        <Text bold color="white">
          {`    ████████████████████    `}
        </Text>
      </Box>

      {/* GitHub Branding */}
      <Box flexDirection="column" alignItems="center">
        <Text bold color="white" fontSize={18}>
          Sign in with GitHub
        </Text>
        <Text color="gray" dimColor>
          Authenticate with your GitHub account
        </Text>
      </Box>
    </Box>
  );
};