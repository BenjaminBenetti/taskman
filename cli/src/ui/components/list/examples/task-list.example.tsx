import React, { useState, useMemo } from 'react';
import { Box, Text } from 'ink';
import { GenericList } from '../generic-list.component.tsx';
import type { ListColumn, SearchConfig, GenericListProps } from '../list.types.ts';

// Import types from backend (these would be imported from TRPC client)
interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  remindAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  creator?: { id: string; name: string; email: string };
  assignee?: { id: string; name: string; email: string; isActive: boolean };
}

// ================================================
// Task List Example Component
// ================================================

/**
 * Example implementation of GenericList component for displaying tasks
 * Demonstrates integration with TRPC patterns and custom rendering
 */
export const TaskListExample: React.FC<{
  tasks: Task[];
  loading?: boolean;
  error?: string;
  onTaskSelect?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
}> = ({
  tasks,
  loading = false,
  error,
  onTaskSelect,
  onTaskEdit,
}: {
  tasks: Task[];
  loading?: boolean;
  error?: string;
  onTaskSelect?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState<Record<string, string[]>>({});

  // ================================================
  // Column Definitions
  // ================================================

  const columns: ListColumn<Task>[] = useMemo(() => [
    {
      key: 'title',
      label: 'Task',
      width: 'flex',
      minWidth: 20,
      sortable: true,
      render: (value: any, task: Task) => (
        <Box flexDirection="column">
          <Text bold>{task.title}</Text>
          {task.description && (
            <Text dimColor wrap="truncate">
              {task.description.substring(0, 50)}
              {task.description.length > 50 ? '...' : ''}
            </Text>
          )}
        </Box>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: 12,
      align: 'center',
      sortable: true,
      render: (value: any, task: Task) => {
        const statusColors: Record<Task['status'], string> = {
          TODO: 'gray',
          IN_PROGRESS: 'yellow',
          DONE: 'green',
        };
        const statusIcons: Record<Task['status'], string> = {
          TODO: '◯',
          IN_PROGRESS: '◐',
          DONE: '●',
        };
        
        return (
          <Text color={statusColors[task.status]}>
            {statusIcons[task.status]} {task.status.replace('_', ' ')}
          </Text>
        );
      },
    },
    {
      key: 'priority',
      label: 'Priority',
      width: 10,
      align: 'center',
      sortable: true,
      render: (value: any, task: Task) => {
        const priorityColors: Record<Task['priority'], string> = {
          LOW: 'gray',
          MEDIUM: 'blue',
          HIGH: 'yellow',
          URGENT: 'red',
        };
        const priorityIcons: Record<Task['priority'], string> = {
          LOW: '↓',
          MEDIUM: '→',
          HIGH: '↑',
          URGENT: '‼',
        };
        
        return (
          <Text color={priorityColors[task.priority]}>
            {priorityIcons[task.priority]} {task.priority}
          </Text>
        );
      },
    },
    {
      key: 'assignee',
      label: 'Assignee',
      width: 15,
      sortable: true,
      render: (value: any, task: Task) => {
        if (!task.assignee) {
          return <Text dimColor>Unassigned</Text>;
        }
        
        return (
          <Box flexDirection="column">
            <Text>{task.assignee.name}</Text>
            <Text dimColor>{task.assignee.email}</Text>
          </Box>
        );
      },
      getSortValue: (task: Task) => task.assignee?.name || 'Unassigned',
    },
    {
      key: 'createdAt',
      label: 'Created',
      width: 12,
      align: 'right',
      sortable: true,
      render: (value: any, task: Task) => (
        <Text>{task.createdAt.toLocaleDateString()}</Text>
      ),
      getSortValue: (task: Task) => task.createdAt.getTime(),
    },
  ], []);

  // ================================================
  // Search Configuration
  // ================================================

  const searchConfig: SearchConfig = useMemo(() => ({
    placeholder: 'Search tasks... (e.g., status:done priority:high)',
    caseSensitive: false,
    debounceMs: 300,
    shortcuts: [
      {
        key: 'status',
        label: 'Status',
        values: ['todo', 'in_progress', 'done'],
      },
      {
        key: 'priority',
        label: 'Priority',
        values: ['low', 'medium', 'high', 'urgent'],
      },
      {
        key: 'is',
        label: 'Is',
        values: ['assigned', 'unassigned', 'overdue'],
      },
      {
        key: 'assignee',
        label: 'Assignee',
        values: [], // Would be populated from available users
      },
    ],
  }), []);

  // ================================================
  // Data Filtering
  // ================================================

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.assignee?.name.toLowerCase().includes(query)
      );
    }

    // Apply filter shortcuts
    if (searchFilters.status) {
      filtered = filtered.filter(task =>
        searchFilters.status.some((status: string) =>
          task.status.toLowerCase() === status.toLowerCase().replace(' ', '_')
        )
      );
    }

    if (searchFilters.priority) {
      filtered = filtered.filter(task =>
        searchFilters.priority.some((priority: string) =>
          task.priority.toLowerCase() === priority.toLowerCase()
        )
      );
    }

    if (searchFilters.is) {
      filtered = filtered.filter(task => {
        return searchFilters.is.some((condition: string) => {
          switch (condition.toLowerCase()) {
            case 'assigned':
              return task.assignee != null;
            case 'unassigned':
              return task.assignee == null;
            case 'overdue':
              return task.remindAt && task.remindAt < new Date();
            default:
              return false;
          }
        });
      });
    }

    return filtered;
  }, [tasks, searchQuery, searchFilters]);

  // ================================================
  // Event Handlers
  // ================================================

  const handleSearchChange = (query: string, filters: Record<string, string[]>) => {
    setSearchQuery(query);
    setSearchFilters(filters);
  };

  const handleTaskAction = (task: Task, index: number) => {
    if (onTaskSelect) {
      onTaskSelect(task);
    }
  };

  const handleSelectionChange = (selectedKeys: Set<React.Key>, selectedTasks: Task[]) => {
    // Handle multi-select if needed
    console.log('Selected tasks:', selectedTasks);
  };

  // ================================================
  // Render
  // ================================================

  return (
    <Box flexDirection="column" flexGrow={1}>
      <GenericList<Task>
        data={filteredTasks}
        columns={columns}
        loading={loading}
        error={error}
        
        // Search
        searchConfig={searchConfig}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        showSearch={true}
        
        // Actions
        onItemAction={handleTaskAction}
        
        // Selection (optional multi-select)
        selection={{
          selectedKeys: new Set(),
          multiple: true,
          getItemKey: (task) => task.id,
        }}
        onSelectionChange={handleSelectionChange}
        
        // Layout
        showHeaders={true}
        showFooter={true}
        minHeight={15}
        
        // Custom components
        emptyComponent={
          <Box flexDirection="column" alignItems="center">
            <Text color="gray">📝 No tasks found</Text>
            <Text dimColor>Create a new task to get started</Text>
          </Box>
        }
        
        loadingComponent={
          <Box justifyContent="center" alignItems="center" flexGrow={1}>
            <Text color="blue">🔄 Loading tasks...</Text>
          </Box>
        }
      />
    </Box>
  );
};

// ================================================
// Mock Data for Testing
// ================================================

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Implement user authentication',
    description: 'Add OAuth login with Google and GitHub providers',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    remindAt: null,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
    creator: { id: '1', name: 'John Doe', email: 'john@example.com' },
    assignee: { id: '2', name: 'Jane Smith', email: 'jane@example.com', isActive: true },
  },
  {
    id: '2',
    title: 'Design dashboard UI',
    description: 'Create wireframes and mockups for the main dashboard',
    status: 'TODO',
    priority: 'MEDIUM',
    remindAt: new Date('2024-02-01'),
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
    creator: { id: '1', name: 'John Doe', email: 'john@example.com' },
    assignee: undefined,
  },
  {
    id: '3',
    title: 'Setup CI/CD pipeline',
    description: 'Configure automated testing and deployment',
    status: 'DONE',
    priority: 'LOW',
    remindAt: null,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20'),
    creator: { id: '3', name: 'Bob Wilson', email: 'bob@example.com' },
    assignee: { id: '3', name: 'Bob Wilson', email: 'bob@example.com', isActive: true },
  },
  {
    id: '4',
    title: 'Database migration',
    description: 'Update database schema for new features',
    status: 'TODO',
    priority: 'URGENT',
    remindAt: new Date('2024-01-25'),
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    creator: { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    assignee: { id: '1', name: 'John Doe', email: 'john@example.com', isActive: true },
  },
];

// ================================================
// Usage Example Component
// ================================================

/**
 * Example of how to use TaskListExample in a page
 */
export const TaskListUsageExample: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTaskSelect = (task: Task) => {
    console.log('Task selected:', task);
    // Here you would navigate to task detail or open edit modal
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="greenBright">
          Task Management
        </Text>
      </Box>
      
      <TaskListExample
        tasks={mockTasks}
        loading={loading}
        error={error}
        onTaskSelect={handleTaskSelect}
      />
    </Box>
  );
};