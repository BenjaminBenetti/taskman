import React, { useState } from 'react';
import { Text, Box, useInput } from 'ink';
import { AuthServiceFactory } from '../../../auth/factories/auth-service.factory.ts';
import { AuthProvider } from '../../../auth/enums/auth-provider.enum.ts';

const options = [
  { text: 'Sign in with Google', enabled: true },
  { text: 'Sign in with GitHub', enabled: false },
  { text: 'Sign in with Apple', enabled: false },
  { text: 'Exit', enabled: true }
];

/**
 * Main authentication page that displays login options
 */
export const AuthPage: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
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

  const handleSelection = async (optionText: string) => {
    console.log(`Selected: ${optionText}`);

    if (optionText === 'Exit') {
      Deno.exit(0);
    } else if (optionText === 'Sign in with Google') {
      console.log('\nInitializing Google authentication...');
      const authService = await AuthServiceFactory.createService(AuthProvider.Google);
      
      console.log('Starting authentication flow...');
      const session = await authService.login();
      
      console.log(`\nAuthentication successful!`);
      console.log(`Welcome, ${session.name || session.email}!`);
      
      // Exit the auth page and continue to main app
      Deno.exit(0);
    }
  };

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