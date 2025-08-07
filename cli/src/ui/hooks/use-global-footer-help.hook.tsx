import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ================================================
// Types
// ================================================

interface GlobalFooterHelpState {
  helpText: string | null;
  setHelpText: (text: string | null) => void;
  clearHelpText: () => void;
}

interface GlobalFooterHelpProviderProps {
  children: ReactNode;
}

// ================================================
// Context
// ================================================

const GlobalFooterHelpContext = createContext<GlobalFooterHelpState | null>(null);

// ================================================
// Provider Component
// ================================================

/**
 * Global footer help provider that manages help text state across the entire application
 * Allows any component to set/clear the footer help text
 */
export const GlobalFooterHelpProvider: React.FC<GlobalFooterHelpProviderProps> = ({ children }) => {
  const [helpText, setHelpTextState] = useState<string | null>(null);

  const setHelpText = useCallback((text: string | null) => {
    setHelpTextState(text);
  }, []);

  const clearHelpText = useCallback(() => {
    setHelpTextState(null);
  }, []);

  const contextValue: GlobalFooterHelpState = {
    helpText,
    setHelpText,
    clearHelpText,
  };

  return (
    <GlobalFooterHelpContext.Provider value={contextValue}>
      {children}
    </GlobalFooterHelpContext.Provider>
  );
};

// ================================================
// Hook
// ================================================

/**
 * Hook to manage global footer help text
 * 
 * Usage:
 * ```tsx
 * const { helpText, setHelpText, clearHelpText } = useGlobalFooterHelp();
 * 
 * // Set help text when component gains focus
 * useEffect(() => {
 *   if (isFocused) {
 *     setHelpText("↑↓ Navigate • Space Select • Enter Action");
 *   } else {
 *     clearHelpText();
 *   }
 * }, [isFocused, setHelpText, clearHelpText]);
 * ```
 */
export const useGlobalFooterHelp = (): GlobalFooterHelpState => {
  const context = useContext(GlobalFooterHelpContext);
  
  if (!context) {
    throw new Error('useGlobalFooterHelp must be used within a GlobalFooterHelpProvider');
  }
  
  return context;
};

// ================================================
// Convenience Hook for Components
// ================================================

/**
 * Convenience hook that automatically manages help text based on focus state
 * 
 * Usage:
 * ```tsx
 * const { isFocused } = useFocus();
 * useFooterHelp("↑↓ Navigate • Space Select", isFocused);
 * ```
 */
export const useFooterHelp = (helpText: string, isActive: boolean = true) => {
  const { setHelpText, clearHelpText } = useGlobalFooterHelp();

  React.useEffect(() => {
    if (isActive) {
      setHelpText(helpText);
    } else {
      clearHelpText();
    }

    // Cleanup on unmount
    return () => {
      clearHelpText();
    };
  }, [helpText, isActive, setHelpText, clearHelpText]);
};