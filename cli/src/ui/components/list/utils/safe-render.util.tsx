import React from 'react';
import { Text } from 'ink';
import type { ReactNode } from 'react';

/**
 * Props for the SafeRender component
 */
export interface SafeRenderProps {
  render: () => ReactNode;
  fallback?: ReactNode;
  errorContext?: string;
}

/**
 * Safe wrapper for custom render functions that provides error boundaries
 * 
 * Prevents custom render functions from crashing the entire component by
 * wrapping them in try-catch blocks and providing fallback UI.
 * 
 * @param render - The render function that might throw errors
 * @param fallback - Optional fallback component to show on error
 * @param errorContext - Optional context string for error logging
 * 
 * @example
 * ```tsx
 * <SafeRender
 *   render={() => customComponent()}
 *   fallback={<Text>Failed to render</Text>}
 *   errorContext="custom header"
 * />
 * ```
 */
export const SafeRender: React.FC<SafeRenderProps> = ({ 
  render, 
  fallback, 
  errorContext 
}) => {
  try {
    return <>{render()}</>;
  } catch (error) {
    console.error(`Render function failed${errorContext ? ` in ${errorContext}` : ''}:`, error);
    return <>{fallback || <Text color="red">Render Error</Text>}</>;
  }
};

/**
 * Higher-order function to create a safe render wrapper
 * 
 * @param errorContext - Context for error messages
 * @param fallback - Default fallback component
 * @returns SafeRender component with pre-configured context and fallback
 * 
 * @example
 * ```tsx
 * const SafeCustomRender = createSafeRender('custom component', <Text>Default fallback</Text>);
 * <SafeCustomRender render={() => customComponent()} />
 * ```
 */
export const createSafeRender = (errorContext?: string, fallback?: ReactNode) => {
  return ({ render, ...props }: Omit<SafeRenderProps, 'errorContext' | 'fallback'> & {
    errorContext?: string;
    fallback?: ReactNode;
  }) => (
    <SafeRender
      render={render}
      errorContext={props.errorContext || errorContext}
      fallback={props.fallback || fallback}
    />
  );
};