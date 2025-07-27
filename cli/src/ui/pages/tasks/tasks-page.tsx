import React from 'react';
import { Text, Box } from 'ink';
import type { TasksPageProps } from '../../components/dashboard.types.ts';

// ================================================
// Tasks Page
// ================================================

/**
 * Tasks page component for managing user tasks
 * Provides interface for viewing, creating, editing, and organizing tasks
 */
export const TasksPage: React.FC<TasksPageProps> = ({ children }: TasksPageProps) => {
  return (
    <Box flexDirection="column" padding={1}>
      {/* Page Title */}
      <Text bold color="greenBright">
        Task Management
      </Text>
      
      {/* Placeholder Content */}
      <Box marginTop={2} flexDirection="column">
        <Text>
          Task management interface will provide:
        </Text>
        
        <Box marginTop={1} marginLeft={2} flexDirection="column">
          <Text color="cyan">• List view of all tasks with filtering</Text>
          <Text color="cyan">• Create, edit, and delete tasks</Text>
          <Text color="cyan">• Task prioritization and categorization</Text>
          <Text color="cyan">• Progress tracking and due dates</Text>
          <Text color="cyan">• Keyboard shortcuts for quick actions</Text>
        </Box>
        
        <Box marginTop={2}>
          <Text dimColor>
            Tasks page placeholder - Future home of comprehensive task management.
          </Text>
        </Box>
      </Box>
      
      {children}
    </Box>
  );
};