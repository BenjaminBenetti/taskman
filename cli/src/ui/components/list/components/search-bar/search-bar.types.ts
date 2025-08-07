import type { SearchConfig, SearchChangeHandler, ParsedSearchFilters } from '../../list.types.ts';

// ================================================
// Search Bar Types
// ================================================

/**
 * Props for SearchBar component
 */
export interface SearchBarProps {
  /** Current search query */
  query: string;
  /** Search configuration */
  config: SearchConfig;
  /** Search change handler */
  onChange: SearchChangeHandler;
  /** Whether the search bar has focus */
  focused?: boolean;
  /** Whether search is currently active */
  loading?: boolean;
  /** Terminal width for responsive layout */
  terminalWidth?: number;
  /** Placeholder text override */
  placeholder?: string;
}

/**
 * Internal search bar state
 */
export interface SearchBarState {
  /** Current input value */
  inputValue: string;
  /** Whether the input is focused */
  focused: boolean;
  /** Whether to show filter suggestions */
  showSuggestions: boolean;
  /** Current cursor position in input */
  cursorPosition: number;
}

/**
 * Search suggestion item
 */
export interface SearchSuggestion {
  /** Suggestion text to display */
  text: string;
  /** Full suggestion to insert */
  value: string;
  /** Type of suggestion */
  type: 'filter' | 'value' | 'text';
  /** Description for the suggestion */
  description?: string;
}

/**
 * Configuration for search parsing
 */
export interface SearchParserConfig {
  /** Whether to parse filter shortcuts */
  parseFilters?: boolean;
  /** Whether search is case sensitive */
  caseSensitive?: boolean;
  /** Available filter shortcuts */
  shortcuts?: Record<string, string[]>;
}