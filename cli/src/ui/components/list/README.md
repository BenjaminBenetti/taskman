# Generic List Component

A powerful, fully-featured generic list component for the TaskMan CLI built with React Ink. Provides GitHub-style search filtering, sortable columns, pagination, keyboard navigation, and customizable rendering.

## Features

- 🔍 **GitHub-style Search**: Advanced filtering with shortcuts like `status:open`, `assignee:john`
- 📊 **Sortable Columns**: Click or keyboard navigation to sort by any column
- 📖 **Pagination**: Efficient handling of large datasets with customizable page sizes
- ⌨️ **Keyboard Navigation**: Full keyboard support for accessibility and speed
- 🎨 **Customizable Rendering**: Flexible cell rendering with render props
- 📱 **Responsive Layout**: Adapts to terminal width with intelligent column sizing
- ✅ **Selection Support**: Single or multi-select with visual feedback
- 🎯 **TypeScript First**: Fully typed with generics for type safety

## Quick Start

```tsx
import { GenericList, ListColumn } from '../../components/list';

// Define your data type
interface Task {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assignee?: string;
  createdAt: Date;
}

// Define columns
const columns: ListColumn<Task>[] = [
  {
    key: 'title',
    label: 'Task',
    width: 'flex',
    sortable: true,
  },
  {
    key: 'status',
    label: 'Status',
    width: 12,
    align: 'center',
    render: (value, task) => (
      <Text color={task.status === 'DONE' ? 'green' : 'yellow'}>
        {task.status}
      </Text>
    ),
  },
  {
    key: 'assignee',
    label: 'Assignee',
    width: 15,
    render: (value) => value || 'Unassigned',
  },
  {
    key: 'createdAt',
    label: 'Created',
    width: 12,
    render: (value) => value.toLocaleDateString(),
    getSortValue: (task) => task.createdAt.getTime(),
  },
];

// Use the component
export const TaskList: React.FC<{ tasks: Task[] }> = ({ tasks }) => (
  <GenericList
    data={tasks}
    columns={columns}
    searchConfig={{
      placeholder: 'Search tasks... (e.g., status:done)',
      shortcuts: [
        { key: 'status', label: 'Status', values: ['todo', 'in_progress', 'done'] },
        { key: 'assignee', label: 'Assignee', values: [] },
      ],
    }}
    selection={{
      selectedKeys: new Set(),
      multiple: true,
      getItemKey: (task) => task.id,
    }}
    onItemAction={(task) => console.log('Selected:', task)}
  />
);
```

## Component Architecture

```
GenericList (Main Orchestrator)
├── SearchBar (GitHub-style filtering)
├── TableHeader (Sortable column headers)
├── GridLayout (Responsive column sizing)
│   └── TableRow[] (Data rows with custom rendering)
└── ListFooter (Pagination and status)
```

## Props API

### GenericListProps<TData>

| Prop | Type | Description |
|------|------|-------------|
| `data` | `TData[]` | Array of data items to display |
| `columns` | `ListColumn<TData>[]` | Column definitions |
| `loading?` | `boolean` | Loading state |
| `error?` | `string \| null` | Error message |

#### Search Configuration
| Prop | Type | Description |
|------|------|-------------|
| `searchConfig?` | `SearchConfig` | Search bar configuration |
| `searchQuery?` | `string` | Current search query |
| `onSearchChange?` | `SearchChangeHandler` | Search change callback |

#### Sorting Configuration  
| Prop | Type | Description |
|------|------|-------------|
| `sort?` | `ListSort \| null` | Current sort state |
| `onSortChange?` | `SortChangeHandler` | Sort change callback |

#### Pagination Configuration
| Prop | Type | Description |
|------|------|-------------|
| `pagination?` | `ListPagination` | Pagination state |
| `onPaginationChange?` | `PaginationChangeHandler` | Pagination change callback |

#### Selection Configuration
| Prop | Type | Description |
|------|------|-------------|
| `selection?` | `ListSelection<TData>` | Selection configuration |
| `onSelectionChange?` | `SelectionChangeHandler<TData>` | Selection change callback |

#### Actions & Customization
| Prop | Type | Description |
|------|------|-------------|
| `onItemAction?` | `ItemActionHandler<TData>` | Item action callback (Enter, double-click) |
| `emptyComponent?` | `ReactNode` | Custom empty state |
| `loadingComponent?` | `ReactNode` | Custom loading state |
| `errorComponent?` | `ReactNode` | Custom error state |

#### Layout Options
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showSearch?` | `boolean` | `true` | Show search bar |
| `showFooter?` | `boolean` | `true` | Show pagination footer |
| `showHeaders?` | `boolean` | `true` | Show column headers |
| `minHeight?` | `number` | `10` | Minimum component height |
| `maxHeight?` | `number` | - | Maximum component height |

## Column Configuration

### ListColumn<TData>

| Property | Type | Description |
|----------|------|-------------|
| `key` | `string` | Unique column identifier |
| `label` | `string` | Column header label |
| `width?` | `number \| 'flex'` | Column width (fixed or flexible) |
| `minWidth?` | `number` | Minimum column width |
| `maxWidth?` | `number` | Maximum column width |
| `align?` | `'left' \| 'center' \| 'right'` | Text alignment |
| `sortable?` | `boolean` | Enable sorting |
| `render?` | `(value, item, index) => ReactNode` | Custom cell renderer |
| `getSortValue?` | `(item) => string \| number \| Date` | Custom sort value extractor |

### Column Width System

The component uses an intelligent width calculation system:

- **Fixed Width**: `width: 20` sets exact column width
- **Flexible Width**: `width: 'flex'` distributes remaining space
- **Constraints**: `minWidth` and `maxWidth` provide bounds
- **Responsive**: Automatically adjusts to terminal width changes

## Search Configuration

### GitHub-style Filtering

The search system supports advanced filtering similar to GitHub:

```tsx
const searchConfig: SearchConfig = {
  placeholder: 'Search... (e.g., status:open assignee:john)',
  shortcuts: [
    {
      key: 'status',
      label: 'Status',
      values: ['open', 'closed', 'in_progress'],
    },
    {
      key: 'assignee',
      label: 'Assignee', 
      values: ['john', 'jane', 'bob'],
    },
    {
      key: 'is',
      label: 'Is',
      values: ['assigned', 'unassigned', 'overdue'],
    },
  ],
};
```

### Search Query Examples

- `authentication` - Text search
- `status:open` - Filter by status
- `assignee:john priority:high` - Multiple filters
- `"user interface" status:in_progress` - Quoted text + filter

## Keyboard Navigation

### List Navigation
- `↑/↓` or `j/k` - Navigate up/down
- `Home/End` or `g/G` - Go to first/last item
- `Page Up/Page Down` - Scroll by page

### Pagination
- `Ctrl+←/→` or `n/p` - Previous/next page  
- `Ctrl+Home/End` - First/last page

### Selection
- `Space` - Toggle selection
- `Ctrl+A` - Select all (multi-select mode)
- `Ctrl+D` - Deselect all

### Actions
- `Enter` - Trigger item action
- `Esc` - Clear selection/exit

## Advanced Usage

### Custom Cell Rendering

```tsx
const columns: ListColumn<Task>[] = [
  {
    key: 'status',
    label: 'Status',
    width: 15,
    render: (value, task) => (
      <Box>
        <Text color={getStatusColor(task.status)}>
          {getStatusIcon(task.status)} {task.status}
        </Text>
      </Box>
    ),
  },
  {
    key: 'priority',
    label: 'Priority',
    width: 10,
    render: (value, task) => (
      <Text backgroundColor={getPriorityBg(task.priority)}>
        {task.priority}
      </Text>
    ),
  },
];
```

### Multi-Column Sorting

```tsx
const handleSortChange = (sort: ListSort | null) => {
  if (sort) {
    // Sort data by column and direction
    const sorted = [...data].sort((a, b) => {
      const aValue = getColumnValue(a, sort.column);
      const bValue = getColumnValue(b, sort.column);
      
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sort.direction === 'desc' ? -comparison : comparison;
    });
    
    setData(sorted);
  }
};
```

### Custom Empty/Loading States

```tsx
<GenericList
  data={data}
  columns={columns}
  loading={isLoading}
  emptyComponent={
    <Box flexDirection="column" alignItems="center">
      <Text color="blue">🎯 Ready to get started?</Text>
      <Text dimColor>Create your first task to begin</Text>
    </Box>
  }
  loadingComponent={
    <Box justifyContent="center" alignItems="center">
      <Text color="yellow">🔄 Fetching latest data...</Text>
    </Box>
  }
/>
```

## TRPC Integration

The component integrates seamlessly with TRPC patterns:

```tsx
import { trpc } from '../../../trpc/factory/trpc-client.factory.ts';

export const TaskListPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<ListSort | null>(null);
  const [pagination, setPagination] = useState({ page: 0, pageSize: 20 });

  // TRPC query with reactive parameters
  const tasksQuery = trpc.tasks.list.useQuery({
    search: searchQuery,
    sortBy: sort?.column,
    sortDirection: sort?.direction,
    page: pagination.page,
    limit: pagination.pageSize,
  });

  const handleSearchChange = (query: string, filters: Record<string, string[]>) => {
    setSearchQuery(query);
    // Reset to first page on search
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  return (
    <GenericList
      data={tasksQuery.data?.items || []}
      loading={tasksQuery.isLoading}
      error={tasksQuery.error?.message}
      columns={taskColumns}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      sort={sort}
      onSortChange={setSort}
      pagination={{
        ...pagination,
        totalItems: tasksQuery.data?.total || 0,
        totalPages: Math.ceil((tasksQuery.data?.total || 0) / pagination.pageSize),
        hasNextPage: pagination.page < Math.ceil((tasksQuery.data?.total || 0) / pagination.pageSize) - 1,
        hasPreviousPage: pagination.page > 0,
      }}
      onPaginationChange={(page, pageSize) => setPagination({ page, pageSize })}
    />
  );
};
```

## Performance Considerations

- **Virtualization**: For very large datasets (>1000 items), consider implementing virtual scrolling
- **Debounced Search**: Search is automatically debounced (300ms default)
- **Memoization**: Component uses React.memo and useMemo extensively
- **Efficient Rendering**: Only visible rows are rendered

## Accessibility

- Full keyboard navigation support
- Screen reader compatible
- High contrast mode support
- Focus indicators on all interactive elements

## Contributing

When extending the component:

1. Follow existing TypeScript patterns
2. Maintain backward compatibility
3. Add comprehensive JSDoc comments
4. Update type definitions
5. Test with various data types

## Examples

See the `examples/` directory for complete implementations:

- `task-list.example.tsx` - Task management interface
- More examples coming soon...

## Troubleshooting

### Common Issues

**Q: Columns not displaying correctly**
A: Check that `terminalWidth` is being calculated properly and columns have valid width specifications.

**Q: Search not working**
A: Ensure `searchConfig.shortcuts` matches your data structure and filter keys are correctly mapped.

**Q: Keyboard navigation unresponsive**
A: Verify the component has focus and no parent components are intercepting key events.

**Q: Performance issues with large datasets**
A: Implement server-side pagination or consider virtual scrolling for >1000 items.

## License

Part of the TaskMan project. See project LICENSE for details.