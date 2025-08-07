import type { ParsedSearchFilters, SearchShortcut } from '../list.types.ts';

// ================================================
// Search Parser Utilities
// ================================================

/**
 * Parse a GitHub-style search query into text and filters
 * Supports filters like "is:open", "assignee:john", "created:>2023-01-01"
 */
export function parseSearchQuery(
  query: string,
  shortcuts: SearchShortcut[] = []
): ParsedSearchFilters {
  const filters: Record<string, string[]> = {};
  const textParts: string[] = [];

  // Create a map of available shortcuts for quick lookup
  const shortcutMap = new Map(shortcuts.map(s => [s.key, s]));

  // Split query into tokens while preserving quoted strings
  const tokens = tokenizeQuery(query);

  for (const token of tokens) {
    // Check if token is a filter (contains ':' and matches known shortcuts)
    const colonIndex = token.indexOf(':');
    
    if (colonIndex > 0 && colonIndex < token.length - 1) {
      const key = token.substring(0, colonIndex);
      const value = token.substring(colonIndex + 1);

      // Check if this is a known filter shortcut
      if (shortcutMap.has(key)) {
        if (!filters[key]) {
          filters[key] = [];
        }
        filters[key].push(value);
        continue;
      }
    }

    // Not a recognized filter, add to text parts
    textParts.push(token);
  }

  return {
    text: textParts.join(' ').trim(),
    filters,
  };
}

/**
 * Tokenize a search query, handling quoted strings properly
 */
function tokenizeQuery(query: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < query.length; i++) {
    const char = query[i];
    const prevChar = i > 0 ? query[i - 1] : '';

    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inQuotes) {
        // Start of quoted string
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        // End of quoted string
        inQuotes = false;
        quoteChar = '';
      } else {
        // Different quote character inside quotes
        current += char;
      }
    } else if (char === ' ' && !inQuotes) {
      // Space outside quotes - end current token
      if (current.trim()) {
        tokens.push(current.trim());
        current = '';
      }
    } else {
      // Regular character or space inside quotes
      current += char;
    }
  }

  // Add final token if any
  if (current.trim()) {
    tokens.push(current.trim());
  }

  return tokens;
}

/**
 * Build a search query from text and filters
 */
export function buildSearchQuery(
  text: string,
  filters: Record<string, string[]>
): string {
  const parts: string[] = [];

  // Add text part if present
  if (text.trim()) {
    parts.push(text.trim());
  }

  // Add filter parts
  Object.entries(filters).forEach(([key, values]) => {
    values.forEach(value => {
      // Quote value if it contains spaces
      const quotedValue = value.includes(' ') ? `"${value}"` : value;
      parts.push(`${key}:${quotedValue}`);
    });
  });

  return parts.join(' ');
}

/**
 * Get suggestions for search input based on current cursor position
 */
export function getSearchSuggestions(
  query: string,
  cursorPosition: number,
  shortcuts: SearchShortcut[] = []
): string[] {
  const suggestions: string[] = [];

  // Get the current token at cursor position
  const beforeCursor = query.substring(0, cursorPosition);
  const afterCursor = query.substring(cursorPosition);
  
  // Find the token currently being typed
  const tokens = tokenizeQuery(beforeCursor);
  const currentToken = tokens[tokens.length - 1] || '';

  // If current token contains ':', suggest values for that filter
  const colonIndex = currentToken.indexOf(':');
  if (colonIndex > 0) {
    const filterKey = currentToken.substring(0, colonIndex);
    const filterValue = currentToken.substring(colonIndex + 1);
    
    const shortcut = shortcuts.find(s => s.key === filterKey);
    if (shortcut && shortcut.values) {
      const matchingValues = shortcut.values.filter(value =>
        value.toLowerCase().startsWith(filterValue.toLowerCase())
      );
      
      suggestions.push(...matchingValues.map(value =>
        `${filterKey}:${value}`
      ));
    }
  } else {
    // Suggest filter keys
    const matchingShortcuts = shortcuts.filter(shortcut =>
      shortcut.key.toLowerCase().startsWith(currentToken.toLowerCase())
    );
    
    suggestions.push(...matchingShortcuts.map(shortcut =>
      `${shortcut.key}:`
    ));
  }

  return suggestions;
}

/**
 * Validate a search query against available shortcuts
 */
export function validateSearchQuery(
  query: string,
  shortcuts: SearchShortcut[] = []
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const shortcutKeys = new Set(shortcuts.map(s => s.key));

  try {
    const parsed = parseSearchQuery(query, shortcuts);
    
    // Check for unknown filter keys
    Object.keys(parsed.filters).forEach(key => {
      if (!shortcutKeys.has(key)) {
        errors.push(`Unknown filter: ${key}`);
      }
    });

    // Check for invalid filter values
    shortcuts.forEach(shortcut => {
      const filterValues = parsed.filters[shortcut.key];
      if (filterValues && shortcut.values) {
        filterValues.forEach(value => {
          if (!shortcut.values!.includes(value)) {
            errors.push(`Invalid value "${value}" for filter "${shortcut.key}"`);
          }
        });
      }
    });

  } catch (error) {
    errors.push('Invalid search syntax');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Extract filter keys from query for highlighting
 */
export function extractFilterKeys(query: string): string[] {
  const tokens = tokenizeQuery(query);
  const filterKeys: string[] = [];

  tokens.forEach(token => {
    const colonIndex = token.indexOf(':');
    if (colonIndex > 0 && colonIndex < token.length - 1) {
      filterKeys.push(token.substring(0, colonIndex));
    }
  });

  return filterKeys;
}

/**
 * Highlight search terms and filters in a text string
 */
export function highlightSearchTerms(
  text: string,
  searchText: string,
  filters: Record<string, string[]>,
  caseSensitive: boolean = false
): string {
  let highlighted = text;

  // Highlight search text
  if (searchText.trim()) {
    const searchRegex = new RegExp(
      escapeRegExp(searchText),
      caseSensitive ? 'g' : 'gi'
    );
    highlighted = highlighted.replace(searchRegex, '**$&**');
  }

  // Highlight filter values (if applicable to the text)
  Object.values(filters).flat().forEach(value => {
    if (value.trim()) {
      const valueRegex = new RegExp(
        escapeRegExp(value),
        caseSensitive ? 'g' : 'gi'
      );
      highlighted = highlighted.replace(valueRegex, '**$&**');
    }
  });

  return highlighted;
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}