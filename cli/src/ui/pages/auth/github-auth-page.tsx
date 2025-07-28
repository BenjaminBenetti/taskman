import React, { useState, useEffect } from 'react';
import { Box } from 'ink';
import { GitHubLoginAsciiArt } from '../../components/auth/github-login-ascii-art.tsx';
import { AuthStatusDisplay } from '../../components/auth/auth-status-display.tsx';
import { AuthServiceFactory } from '../../../auth/factories/auth-service.factory.ts';
import { AuthProvider } from '../../../auth/enums/auth-provider.enum.ts';
import { AuthFlowState } from '../../../auth/enums/auth-flow-state.enum.ts';
import type { AuthFlowStatus } from '../../../auth/interfaces/auth-flow-status.interface.ts';
import type { AuthSession } from '../../../auth/interfaces/auth-session.interface.ts';
import type { GitHubAuthService } from "../../../auth/services/github-auth.service.ts";

interface GitHubAuthPageProps {
  /** Callback when authentication is successful */
  onAuthSuccess?: (session: AuthSession) => void;
  /** Callback when authentication fails */
  onAuthError?: (error: Error) => void;
  /** Callback when user cancels authentication */
  onCancel?: () => void;
}

/**
 * GitHub OAuth2 authentication page with visual feedback
 * 
 * Provides a complete authentication interface with ASCII art title,
 * real-time status updates, and proper error handling. Replaces console.log
 * messages with proper TUI feedback during the OAuth2 flow.
 */
export const GitHubAuthPage: React.FC<GitHubAuthPageProps> = ({
  onAuthSuccess,
  onAuthError
}: GitHubAuthPageProps) => {
  const [authStatus, setAuthStatus] = useState<AuthFlowStatus>({
    state: AuthFlowState.Initializing,
    message: 'Starting GitHub authentication...'
  });
  const [isDisplayingError, setIsDisplayingError] = useState(false);


  // Start authentication flow on component mount
  useEffect(() => {
    const performAuthentication = async () => {
      try {
        // Update status to show initialization
        setAuthStatus({
          state: AuthFlowState.Initializing,
          message: 'Initializing GitHub authentication...'
        });

        // Create and initialize auth service
        const authService = await AuthServiceFactory.createService(AuthProvider.GitHub) as GitHubAuthService;
        
        // Update status to show browser opening
        setAuthStatus({
          state: AuthFlowState.BrowserOpening,
          message: 'Opening browser for authentication...'
        });

        // Small delay to show the browser opening message
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Start the authentication flow with status updates
        const session = await performLoginWithStatusUpdates(authService);

        // Update status to show success
        setAuthStatus({
          state: AuthFlowState.Success,
          message: `Welcome, ${session.name || session.email}!`
        });


        onAuthSuccess?.(session);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        // Set flag to indicate we're in error display mode
        setIsDisplayingError(true);
        
        // Update status to show error with countdown message
        setAuthStatus({
          state: AuthFlowState.Error,
          message: 'Authentication failed - Reading error message in browser...',
          error: {
            code: 'AUTH_FAILED',
            description: `${errorMessage} (Page will close automatically in 10 seconds)`
          }
        });

        // Wait for the error display period to complete before calling onAuthError
        // This ensures the CLI stays on this page while the browser shows the error
        setTimeout(() => {
          setIsDisplayingError(false);
          onAuthError?.(error instanceof Error ? error : new Error(errorMessage));
        }, 10500); // Slightly longer than the auth service delay to ensure coordination
      }
    };

    performAuthentication();
  }, [onAuthSuccess, onAuthError]);

  // Update the status message during error display to show countdown
  React.useEffect(() => {
    if (!isDisplayingError) return;
    
    let countdown = 10;
    const updateCountdown = () => {
      if (countdown > 0) {
        setAuthStatus((prev: AuthFlowStatus) => ({
          ...prev,
          message: `Authentication failed - Reading error message in browser... (${countdown}s remaining)`,
          error: {
            ...prev.error!,
            description: `${prev.error?.description?.split(' (Page')[0]} (Page will close automatically in ${countdown} seconds)`
          }
        }));
        countdown--;
        setTimeout(updateCountdown, 1000);
      } else {
        setAuthStatus((prev: AuthFlowStatus) => ({
          ...prev,
          message: 'Authentication failed - Returning to authentication options...',
          error: {
            ...prev.error!,
            description: prev.error?.description?.split(' (Page')[0] || ''
          }
        }));
      }
    };
    
    // Start countdown after a brief delay
    const timeoutId = setTimeout(updateCountdown, 500);
    return () => clearTimeout(timeoutId);
  }, [isDisplayingError]);

  /**
   * Perform login with status updates throughout the flow
   */
  const performLoginWithStatusUpdates = async (authService: GitHubAuthService): Promise<AuthSession> => {
    // Call the login method with status callback to use proper inheritance chain
    return await authService.login((status: AuthFlowStatus) => {
      setAuthStatus(status);
    });
  };

  return (
    <Box 
      flexDirection="column" 
      height="100%" 
      justifyContent="center" 
      alignItems="center"
      paddingX={2}
      paddingY={1}
    >
      {/* ASCII Art Title */}
      <Box marginBottom={3}>
        <GitHubLoginAsciiArt />
      </Box>

      {/* Status Display */}
      <AuthStatusDisplay status={authStatus} />
    </Box>
  );
};