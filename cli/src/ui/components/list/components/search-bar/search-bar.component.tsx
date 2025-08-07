import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Text, useInput, useFocus } from 'ink';
import type { SearchBarProps } from './search-bar.types.ts';
import { parseSearchQuery, getSearchSuggestions, validateSearchQuery } from '../../utils/search-parser.util.ts';

// ================================================
// Search Bar Component
// ================================================

/**
 * GitHub-style search bar component with filter shortcuts and suggestions
 * Supports real-time search parsing and validation
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  config,
  onChange,
  focused = false,
  loading = false,
  terminalWidth = 80,
  placeholder,
}: SearchBarProps) => {
  const [inputValue, setInputValue] = useState(query);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(query.length);

  // Focus management
  const { isFocused } = useFocus({ autoFocus: focused });

  // Sync input value with external query changes
  useEffect(() => {
    if (query !== inputValue) {
      setInputValue(query);
      setCursorPosition(query.length);
    }
  }, [query]);

  // Debounced search handling
  const debounceMs = config.debounceMs || 300;
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      const parsed = parseSearchQuery(value, config.shortcuts);
      onChange(value, parsed.filters);
    }, debounceMs);

    setSearchTimeout(timeout);
  }, [onChange, debounceMs, config.shortcuts, searchTimeout]);

  // Parse current query for validation and highlighting
  const parsedQuery = useMemo(() => {
    return parseSearchQuery(inputValue, config.shortcuts);
  }, [inputValue, config.shortcuts]);

  const validation = useMemo(() => {
    return validateSearchQuery(inputValue, config.shortcuts);
  }, [inputValue, config.shortcuts]);

  // Get suggestions for current cursor position
  const suggestions = useMemo(() => {
    if (!showSuggestions || !config.shortcuts) return [];
    return getSearchSuggestions(inputValue, cursorPosition, config.shortcuts);
  }, [inputValue, cursorPosition, showSuggestions, config.shortcuts]);

  // Handle keyboard input
  useInput((input, key) => {
    if (!isFocused) return;

    if (key.leftArrow) {
      setCursorPosition(Math.max(0, cursorPosition - 1));
    } else if (key.rightArrow) {
      setCursorPosition(Math.min(inputValue.length, cursorPosition + 1));
    } else if (key.backspace || key.delete) {
      if (cursorPosition > 0) {
        const newValue = inputValue.slice(0, cursorPosition - 1) + inputValue.slice(cursorPosition);
        setInputValue(newValue);
        setCursorPosition(cursorPosition - 1);
        handleSearchChange(newValue);
      }
    } else if (key.return) {
      setShowSuggestions(false);
      handleSearchChange(inputValue);
    } else if (key.escape) {
      setShowSuggestions(false);
      setInputValue('');
      setCursorPosition(0);
      handleSearchChange('');
    } else if (key.tab && suggestions.length > 0) {
      // Auto-complete with first suggestion
      const suggestion = suggestions[0];
      const newValue = suggestion;
      setInputValue(newValue);
      setCursorPosition(newValue.length);
      handleSearchChange(newValue);
      setShowSuggestions(false);
    } else if (key.ctrl && (key as any).space) {
      // Toggle suggestions
      setShowSuggestions(!showSuggestions);
    } else if (input && input.length === 1 && !key.ctrl && !key.meta) {
      // Regular character input
      const newValue = inputValue.slice(0, cursorPosition) + input + inputValue.slice(cursorPosition);
      setInputValue(newValue);
      setCursorPosition(cursorPosition + 1);
      setShowSuggestions(true);
      handleSearchChange(newValue);
    }
  });

  // Calculate available width for input
  const availableWidth = Math.max(20, terminalWidth - 10);
  const displayPlaceholder = placeholder || config.placeholder || 'Search...';

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <Box flexDirection="column" width={availableWidth}>
      {/* Search Input Box */}
      <Box
        borderStyle="single"
        borderColor={isFocused ? (validation.valid ? 'blue' : 'red') : 'gray'}
        paddingX={1}
        width={availableWidth}
      >
        <Box flexDirection="row" alignItems="center" width="100%">
          {/* Search Icon */}
          <Text color="gray" dimColor>
            🔍
          </Text>

          {/* Input Field */}
          <Box marginLeft={1} flexGrow={1}>
            {inputValue.length > 0 ? (
              <Text>
                {renderSearchText(inputValue, parsedQuery, isFocused, cursorPosition)}
              </Text>
            ) : (
              <Text color="gray" dimColor={!isFocused}>
                {displayPlaceholder}
              </Text>
            )}
          </Box>

          {/* Loading Indicator */}
          {loading && (
            <Text color="yellow" dimColor>
              ⏳
            </Text>
          )}
        </Box>
      </Box>

      {/* Validation Errors */}
      {!validation.valid && validation.errors.length > 0 && (
        <Box marginTop={1}>
          {validation.errors.map((error: string, index: number) => (
            <Box key={index}>
              <Text color="red">
                ⚠ {error}
              </Text>
            </Box>
          ))}
        </Box>
      )}

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && isFocused && (
        <Box
          marginTop={1}
          borderStyle="single"
          borderColor="gray"
          paddingX={1}
          maxHeight={5}
        >
          <Box flexDirection="column">
            <Text color="gray" dimColor>
              Suggestions:
            </Text>
            {suggestions.slice(0, 4).map((suggestion: string, index: number) => (
              <Box key={index}>
                <Text color="blue">
                  • {suggestion}
                </Text>
              </Box>
            ))}
            {suggestions.length > 4 && (
              <Text color="gray" dimColor>
                ... and {suggestions.length - 4} more
              </Text>
            )}
          </Box>
        </Box>
      )}

    </Box>
  );
};

// ================================================
// Helper Functions
// ================================================

/**
 * Render search text with syntax highlighting and cursor
 */
function renderSearchText(
  text: string,
  parsed: { text: string; filters: Record<string, string[]> },
  focused: boolean,
  cursorPosition: number
): string {
  if (!focused) {
    return highlightSearchSyntax(text, parsed);
  }

  // Add cursor indicator
  const beforeCursor = text.slice(0, cursorPosition);
  const afterCursor = text.slice(cursorPosition);
  const cursor = focused ? '|' : '';

  return highlightSearchSyntax(beforeCursor + cursor + afterCursor, parsed);
}

/**
 * Apply syntax highlighting to search text
 */
function highlightSearchSyntax(
  text: string,
  parsed: { filters: Record<string, string[]> }
): string {
  let highlighted = text;

  // Highlight filter syntax (simple approach for terminal)
  Object.keys(parsed.filters).forEach(key => {
    const filterRegex = new RegExp(`\\b${key}:`, 'g');
    highlighted = highlighted.replace(filterRegex, `${key}:`);
  });

  return highlighted;
}