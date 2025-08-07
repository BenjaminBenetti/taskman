import React from 'react';
import { Text, Box } from 'ink';
import type { TasksPageProps } from '../../components/dashboard/dashboard.types.ts';
import { TaskListUsageExample } from '../../components/list/examples/task-list.example.tsx';

// ================================================
// Tasks Page
// ================================================

/**
 * Tasks page component for managing user tasks
 * Now features the new GenericList component with full functionality
 */
export const TasksPage: React.FC<TasksPageProps> = ({ children }: TasksPageProps) => {
  return (
    <Box flexDirection="column" padding={1} flexGrow={1}>      
      {/* Task List with GenericList Component */}
      <TaskListUsageExample />
      
      {children}
    </Box>
  );
};