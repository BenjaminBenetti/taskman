// ================================================
// Generic List Component - Main Exports
// ================================================

// Main Component
export { GenericList, GenericList as default } from './generic-list.component.tsx';

// Types
export type * from './list.types.ts';

// Sub-Components (for advanced usage)
export { SearchBar } from './components/search-bar/search-bar.component.tsx';
export { TableHeader } from './components/table-header/table-header.component.tsx';
export { TableRow } from './components/table-row/table-row.component.tsx';
export { ListFooter } from './components/list-footer/list-footer.component.tsx';
export { GridLayout } from './components/grid-layout/grid-layout.component.tsx';

// Hooks (for custom implementations)
export { useListState } from './hooks/use-list-state.hook.tsx';
export { useListKeyboard } from './hooks/use-list-keyboard.hook.tsx';
export { useColumnWidth } from './hooks/use-column-width.hook.tsx';

// Utilities (for advanced use cases)
export * from './utils/search-parser.util.ts';
export * from './utils/column-calculator.util.ts';

// Component Types (for sub-components)
export type * from './components/search-bar/search-bar.types.ts';
export type * from './components/table-header/table-header.types.ts';
export type * from './components/table-row/table-row.types.ts';
export type * from './components/list-footer/list-footer.types.ts';
export type * from './components/grid-layout/grid-layout.types.ts';