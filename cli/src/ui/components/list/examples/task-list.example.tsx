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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10; // Set to 10 for testing

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
  // Data Filtering and Pagination
  // ================================================

  const { filteredTasks, paginatedTasks, pagination } = useMemo(() => {
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

    // Calculate pagination
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTasks = filtered.slice(startIndex, endIndex);

    const paginationInfo = {
      page: currentPage,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: currentPage < totalPages - 1,
      hasPreviousPage: currentPage > 0,
    };

    return {
      filteredTasks: filtered,
      paginatedTasks,
      pagination: paginationInfo,
    };
  }, [tasks, searchQuery, searchFilters, currentPage, pageSize]);

  // ================================================
  // Event Handlers
  // ================================================

  const handleSearchChange = (query: string, filters: Record<string, string[]>) => {
    setSearchQuery(query);
    setSearchFilters(filters);
    // Reset to first page when search changes
    setCurrentPage(0);
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // ================================================
  // Render
  // ================================================

  return (
    <Box flexDirection="column" flexGrow={1}>
      <GenericList<Task>
        data={paginatedTasks}
        columns={columns}
        loading={loading}
        error={error}
        
        // Search
        searchConfig={searchConfig}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        showSearch={true}
        
        // Pagination
        pagination={pagination}
        onPaginationChange={handlePageChange}
        
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
  {
    id: '5',
    title: 'Refactor user service',
    description: 'Clean up user service code and improve performance',
    status: 'TODO',
    priority: 'MEDIUM',
    remindAt: new Date('2024-02-05'),
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19'),
    creator: { id: '4', name: 'Alice Cooper', email: 'alice@example.com' },
    assignee: { id: '4', name: 'Alice Cooper', email: 'alice@example.com', isActive: true },
  },
  {
    id: '6',
    title: 'Write API documentation',
    description: 'Document all REST endpoints with examples and schemas',
    status: 'IN_PROGRESS',
    priority: 'LOW',
    remindAt: null,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-21'),
    creator: { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    assignee: { id: '5', name: 'Charlie Brown', email: 'charlie@example.com', isActive: true },
  },
  {
    id: '7',
    title: 'Fix search pagination bug',
    description: 'Search results pagination not working correctly on mobile',
    status: 'TODO',
    priority: 'HIGH',
    remindAt: new Date('2024-01-30'),
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    creator: { id: '3', name: 'Bob Wilson', email: 'bob@example.com' },
    assignee: { id: '2', name: 'Jane Smith', email: 'jane@example.com', isActive: true },
  },
  {
    id: '8',
    title: 'Implement dark mode',
    description: 'Add dark theme option to user preferences',
    status: 'DONE',
    priority: 'LOW',
    remindAt: null,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-22'),
    creator: { id: '1', name: 'John Doe', email: 'john@example.com' },
    assignee: { id: '1', name: 'John Doe', email: 'john@example.com', isActive: true },
  },
  {
    id: '9',
    title: 'Optimize database queries',
    description: 'Identify and fix slow queries in the analytics module',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    remindAt: new Date('2024-01-28'),
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-23'),
    creator: { id: '4', name: 'Alice Cooper', email: 'alice@example.com' },
    assignee: { id: '3', name: 'Bob Wilson', email: 'bob@example.com', isActive: true },
  },
  {
    id: '10',
    title: 'Create user onboarding flow',
    description: 'Design and implement step-by-step user onboarding',
    status: 'TODO',
    priority: 'MEDIUM',
    remindAt: null,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    creator: { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    assignee: undefined,
  },
  {
    id: '11',
    title: 'Setup monitoring alerts',
    description: 'Configure alerts for system health and performance metrics',
    status: 'DONE',
    priority: 'HIGH',
    remindAt: null,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-24'),
    creator: { id: '3', name: 'Bob Wilson', email: 'bob@example.com' },
    assignee: { id: '3', name: 'Bob Wilson', email: 'bob@example.com', isActive: true },
  },
  {
    id: '12',
    title: 'Implement file upload feature',
    description: 'Allow users to upload and manage documents',
    status: 'TODO',
    priority: 'MEDIUM',
    remindAt: new Date('2024-02-10'),
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21'),
    creator: { id: '1', name: 'John Doe', email: 'john@example.com' },
    assignee: { id: '5', name: 'Charlie Brown', email: 'charlie@example.com', isActive: true },
  },
  {
    id: '13',
    title: 'Security audit',
    description: 'Conduct comprehensive security review of the application',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    remindAt: new Date('2024-01-29'),
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-25'),
    creator: { id: '4', name: 'Alice Cooper', email: 'alice@example.com' },
    assignee: { id: '4', name: 'Alice Cooper', email: 'alice@example.com', isActive: true },
  },
  {
    id: '14',
    title: 'Mobile app prototype',
    description: 'Create initial prototype for mobile companion app',
    status: 'TODO',
    priority: 'LOW',
    remindAt: null,
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
    creator: { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    assignee: undefined,
  },
  {
    id: '15',
    title: 'Upgrade dependencies',
    description: 'Update all npm packages to latest stable versions',
    status: 'DONE',
    priority: 'MEDIUM',
    remindAt: null,
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-26'),
    creator: { id: '3', name: 'Bob Wilson', email: 'bob@example.com' },
    assignee: { id: '1', name: 'John Doe', email: 'john@example.com', isActive: true },
  },
  {
    id: '16',
    title: 'Implement caching layer',
    description: 'Add Redis caching to improve API response times',
    status: 'TODO',
    priority: 'HIGH',
    remindAt: new Date('2024-02-03'),
    createdAt: new Date('2024-01-23'),
    updatedAt: new Date('2024-01-23'),
    creator: { id: '1', name: 'John Doe', email: 'john@example.com' },
    assignee: { id: '3', name: 'Bob Wilson', email: 'bob@example.com', isActive: true },
  },
  {
    id: '17',
    title: 'User feedback system',
    description: 'Build in-app feedback collection and management system',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    remindAt: null,
    createdAt: new Date('2024-01-24'),
    updatedAt: new Date('2024-01-27'),
    creator: { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    assignee: { id: '2', name: 'Jane Smith', email: 'jane@example.com', isActive: true },
  },
  {
    id: '18',
    title: 'Performance testing',
    description: 'Run load tests and identify bottlenecks',
    status: 'TODO',
    priority: 'LOW',
    remindAt: new Date('2024-02-15'),
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
    creator: { id: '4', name: 'Alice Cooper', email: 'alice@example.com' },
    assignee: { id: '5', name: 'Charlie Brown', email: 'charlie@example.com', isActive: true },
  },
  {
    id: '19',
    title: 'Email notification system',
    description: 'Implement email notifications for task updates and reminders',
    status: 'DONE',
    priority: 'MEDIUM',
    remindAt: null,
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date('2024-01-28'),
    creator: { id: '3', name: 'Bob Wilson', email: 'bob@example.com' },
    assignee: { id: '4', name: 'Alice Cooper', email: 'alice@example.com', isActive: true },
  },
  {
    id: '20',
    title: 'Backup and recovery plan',
    description: 'Implement automated backup system and disaster recovery procedures',
    status: 'TODO',
    priority: 'URGENT',
    remindAt: new Date('2024-02-01'),
    createdAt: new Date('2024-01-26'),
    updatedAt: new Date('2024-01-26'),
    creator: { id: '1', name: 'John Doe', email: 'john@example.com' },
    assignee: { id: '3', name: 'Bob Wilson', email: 'bob@example.com', isActive: true },
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