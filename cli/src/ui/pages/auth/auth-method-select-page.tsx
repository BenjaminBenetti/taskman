import React, { useState } from 'react';
import { Text, Box, useInput } from 'ink';
import { GoogleAuthPage } from './google-auth-page.tsx';
import type { AuthSession } from '../../../auth/interfaces/auth-session.interface.ts';

const options = [
  { text: 'Sign in with Google', enabled: true },
  { text: 'Sign in with GitHub', enabled: false },
  { text: 'Sign in with Apple', enabled: false },
  { text: 'Exit', enabled: true }
];

export interface AuthPageProps {
  onAuthSuccess?: () => void;
}

/**
 * Main authentication page that displays login options
 */
export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState<'select' | 'google'>('select');

  useInput((input, key) => {
    // Only handle input on the select page
    if (currentPage !== 'select') return;
    
    if (key.downArrow || input === 'j' || key.tab) {
      setSelectedIndex((prev: number) => (prev + 1) % options.length);
    } else if (key.upArrow || input === 'k') {
      setSelectedIndex((prev: number) => (prev - 1 + options.length) % options.length);
    } else if (key.return || input === ' ') {
      const selectedOption = options[selectedIndex];
      if (selectedOption.enabled) {
        handleSelection(selectedOption.text);
      }
    }
  });

  const handleSelection = (optionText: string) => {
    if (optionText === 'Exit') {
      Deno.exit(0);
    } else if (optionText === 'Sign in with Google') {
      setCurrentPage('google');
    }
  };

  const handleAuthSuccess = (_session: AuthSession) => {
    // Authentication successful - transition to dashboard
    if (onAuthSuccess) {
      onAuthSuccess();
    }
  };

  const handleAuthError = (_error: Error) => {
    // Return to selection page on error
    setCurrentPage('select');
  };

  const handleAuthCancel = () => {
    // Return to selection page on cancel
    setCurrentPage('select');
  };

  // Render Google auth page if selected
  if (currentPage === 'google') {
    return (
      <GoogleAuthPage
        onAuthSuccess={handleAuthSuccess}
        onAuthError={handleAuthError}
        onCancel={handleAuthCancel}
      />
    );
  }

  // Render auth method selection page
  return (
    <Box flexDirection="column" padding={1}>
      <Box flexDirection="column">
        <Text bold color="redBright">
{`▓▓▓▓▓▓▓▓  ▒▒▒▒▒  ███▓▓▓▓ ▒▒  ▓▓ ▓██    ███ ▒▒▒▒▒  ███    ▒▒`}
        </Text>
        <Text bold color="yellowBright">
{`   ▓▓    ██   ▒▒ ▓▓      ██  ▓▓  ████  ████ ██   ▒▒ ████   ▓▓`}
        </Text>
        <Text bold color="greenBright">
{`   ▓▓    ▓██▒▒▒▒ ▒▒▓▓███ ▓▓▒▒▒   ▒▒ ▓▓▓▓ ▒▒ ▓██▒▒▒▒ ▒▒ ██  ▓▓`}
        </Text>
        <Text bold color="cyanBright">
{`   ▓▓    ██   ▒▒      ▓▓ ▓▓  ██  ▒▒  ██  ▒▒ ██   ▒▒ ▒▒  ██ ▓▓`}
        </Text>
        <Text bold color="blueBright">
{`   ▓▓    ██   ▒▒ ▓██▓▓▓▒ ▓▓   ██ ▒▒      ▒▒ ██   ▒▒ ▒▒   ████`}
        </Text>
        <Box marginTop={1}>
        </Box>
      </Box>
      <Text>Please select an authentication option:</Text>
      <Box flexDirection="column" marginTop={1}>
        {options.map((option, index) => {
          const isSelected = index === selectedIndex;
          const prefix = isSelected ? '> ' : '  ';
          const color = option.enabled 
            ? (isSelected ? 'blue' : 'white')
            : 'gray';
          const suffix = option.enabled ? '' : ' (disabled)';
          
          return (
            <React.Fragment key={index}>
              <Text color={color}>
                {prefix}{option.text}{suffix}
              </Text>
            </React.Fragment>
          );
        })}
      </Box>
      <Box marginTop={1}>
        <Text dimColor>Use ↑/↓, j/k, or Tab to navigate • Enter/Space to select</Text>
      </Box>
    </Box>
  );
};