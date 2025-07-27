import React from 'react';
import { Text, Box } from 'ink';
import type { SettingsPageProps } from '../../components/dashboard/dashboard.types.ts';

// ================================================
// Settings Page
// ================================================

/**
 * Settings page component for application configuration
 * Provides interface for user preferences, account settings, and system configuration
 */
export const SettingsPage: React.FC<SettingsPageProps> = ({ children }: SettingsPageProps) => {
  return (
    <Box flexDirection="column" padding={1}>
      {/* Page Title */}
      <Text bold color="redBright">
        Application Settings
      </Text>
      
      {/* Placeholder Content */}
      <Box marginTop={2} flexDirection="column">
        <Text>
          Settings and configuration options will include:
        </Text>
        
        <Box marginTop={1} marginLeft={2} flexDirection="column">
          <Text color="red">• User account and profile management</Text>
          <Text color="red">• Authentication and security settings</Text>
          <Text color="red">• Application preferences and themes</Text>
          <Text color="red">• Keyboard shortcuts customization</Text>
          <Text color="red">• AI agent behavior configuration</Text>
          <Text color="red">• Data export and backup options</Text>
        </Box>
        
        <Box marginTop={2}>
          <Text dimColor>
            Settings page placeholder - Customize your TaskMan experience here.
          </Text>
        </Box>
      </Box>
      
      {children}
    </Box>
  );
};