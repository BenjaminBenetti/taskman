import React from 'react';
import { Text, Box } from 'ink';
import type { DashboardMainPageProps } from '../../components/dashboard.types.ts';

// ================================================
// Dashboard Main Page
// ================================================

/**
 * Main dashboard page component - entry point of the application
 * Displays overview and key metrics for the user's tasks and AI agent
 */
export const DashboardMainPage: React.FC<DashboardMainPageProps> = ({ children }: DashboardMainPageProps) => {
  return (
    <Box flexDirection="column" padding={1}>
      {/* Page Title */}
      <Text bold color="blueBright">
        Dashboard Overview
      </Text>
      
      {/* Placeholder Content */}
      <Box marginTop={2} flexDirection="column">
        <Text>
          Welcome to TaskMan! This is your main dashboard where you'll see:
        </Text>
        
        <Box marginTop={1} marginLeft={2} flexDirection="column">
          <Text color="green">• Task summary and recent activity</Text>
          <Text color="green">• AI agent status and recommendations</Text>
          <Text color="green">• Quick actions and shortcuts</Text>
          <Text color="green">• System notifications and updates</Text>
        </Box>
        
        <Box marginTop={2}>
          <Text dimColor>
            This is a placeholder page. Use Tab to navigate to other sections.
          </Text>
        </Box>
      </Box>
      
      {children}
    </Box>
  );
};