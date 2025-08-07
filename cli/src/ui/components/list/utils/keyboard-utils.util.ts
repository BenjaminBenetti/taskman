// ================================================
// Keyboard Utility Functions
// ================================================

/**
 * Check if a key press matches any of the binding options
 * 
 * @param key - Ink key object containing key states
 * @param input - Raw input string
 * @param bindings - Array of key binding strings to match against
 * @returns True if the key press matches any binding
 * 
 * @example
 * ```typescript
 * const isUpArrow = matchesKey(key, input, ['upArrow', 'k']);
 * const isCtrlA = matchesKey(key, input, ['ctrl+a']);
 * ```
 */
export function matchesKey(key: any, input: string, bindings: string[]): boolean {
  return bindings.some(binding => {
    if (binding.includes('+')) {
      // Handle modifier combinations like 'ctrl+a', 'shift+tab', etc.
      const [modifier, keyName] = binding.split('+');
      return key[modifier] && key[keyName];
    } else if (key[binding]) {
      // Handle special keys like 'upArrow', 'downArrow', 'enter', etc.
      return true;
    } else if (input === binding) {
      // Handle regular character input like 'j', 'k', 'g', 'G', etc.
      return true;
    }
    return false;
  });
}

/**
 * Key binding configuration interface
 */
export interface KeyBindings {
  moveUp: string[];
  moveDown: string[];
  moveToTop: string[];
  moveToBottom: string[];
  pageUp: string[];
  pageDown: string[];
  selectCurrent: string[];
  selectAll: string[];
  deselectAll: string[];
  toggleSelect: string[];
  triggerAction: string[];
  nextPage: string[];
  previousPage: string[];
  firstPage: string[];
  lastPage: string[];
}

/**
 * Default key bindings for list navigation
 */
export const DEFAULT_KEY_BINDINGS: KeyBindings = {
  moveUp: ['upArrow', 'k'],
  moveDown: ['downArrow', 'j'],
  moveToTop: ['home', 'g'],
  moveToBottom: ['end', 'G'],
  pageUp: ['pageUp', 'ctrl+b'],
  pageDown: ['pageDown', 'ctrl+f'],
  selectCurrent: ['space'],
  selectAll: ['ctrl+a'],
  deselectAll: ['ctrl+d'],
  toggleSelect: ['space'],
  triggerAction: ['return', 'enter'],
  nextPage: ['ctrl+rightArrow', 'n'],
  previousPage: ['ctrl+leftArrow', 'p'],
  firstPage: ['ctrl+home'],
  lastPage: ['ctrl+end'],
};

/**
 * Merge custom key bindings with defaults
 * 
 * @param customBindings - Partial key bindings to override defaults
 * @returns Complete key bindings object
 */
export function mergeKeyBindings(customBindings: Partial<KeyBindings>): KeyBindings {
  return {
    ...DEFAULT_KEY_BINDINGS,
    ...customBindings,
  };
}