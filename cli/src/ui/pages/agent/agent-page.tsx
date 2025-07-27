import React from 'react';
import { Text, Box } from 'ink';
import type { AgentPageProps } from '../../components/dashboard.types.ts';

// ================================================
// Agent Page
// ================================================

/**
 * AI Agent page component for interacting with the TaskMan AI assistant
 * Provides chat interface and AI-powered task management features
 */
export const AgentPage: React.FC<AgentPageProps> = ({ children }: AgentPageProps) => {
  return (
    <Box flexDirection="column" padding={1}>
      {/* Page Title */}
      <Text bold color="yellowBright">
        AI Agent Assistant
      </Text>
      
      {/* Placeholder Content */}
      <Box marginTop={2} flexDirection="column">
        <Text>
          The AI Agent will provide intelligent assistance with:
        </Text>
        
        <Box marginTop={1} marginLeft={2} flexDirection="column">
          <Text color="magenta">• Natural language task creation and management</Text>
          <Text color="magenta">• Smart task prioritization and scheduling</Text>
          <Text color="magenta">• Automated task breakdown and planning</Text>
          <Text color="magenta">• Context-aware suggestions and reminders</Text>
          <Text color="magenta">• Chat interface for conversational task management</Text>
        </Box>
        
        <Box marginTop={2}>
          <Text dimColor>
            Agent page placeholder - Your AI-powered productivity companion coming soon.
          </Text>
        </Box>
      </Box>
      
      {children}
    </Box>
  );
};