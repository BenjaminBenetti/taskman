import React, { useState, useEffect } from 'react';
import { Box } from 'ink';
import { GoogleLoginAsciiArt } from '../../components/auth/google-login-ascii-art.tsx';
import { AuthStatusDisplay } from '../../components/auth/auth-status-display.tsx';
import { AuthServiceFactory } from '../../../auth/factories/auth-service.factory.ts';
import { AuthProvider } from '../../../auth/enums/auth-provider.enum.ts';
import { AuthFlowState } from '../../../auth/enums/auth-flow-state.enum.ts';
import type { AuthFlowStatus } from '../../../auth/interfaces/auth-flow-status.interface.ts';
import type { AuthSession } from '../../../auth/interfaces/auth-session.interface.ts';
import type { GoogleAuthService } from "../../../auth/services/google-auth.service.ts";

interface GoogleAuthPageProps {
  /** Callback when authentication is successful */
  onAuthSuccess?: (session: AuthSession) => void;
  /** Callback when authentication fails */
  onAuthError?: (error: Error) => void;
  /** Callback when user cancels authentication */
  onCancel?: () => void;
}

/**
 * Google OAuth2 authentication page with visual feedback
 * 
 * Provides a complete authentication interface with ASCII art title,
 * real-time status updates, and proper error handling. Replaces console.log
 * messages with proper TUI feedback during the OAuth2 flow.
 */
export const GoogleAuthPage: React.FC<GoogleAuthPageProps> = ({
  onAuthSuccess,
  onAuthError
}: GoogleAuthPageProps) => {
  const [authStatus, setAuthStatus] = useState<AuthFlowStatus>({
    state: AuthFlowState.Initializing,
    message: 'Starting Google authentication...'
  });


  // Start authentication flow on component mount
  useEffect(() => {
    const performAuthentication = async () => {
      try {
        // Update status to show initialization
        setAuthStatus({
          state: AuthFlowState.Initializing,
          message: 'Initializing Google authentication...'
        });

        // Create and initialize auth service
        const authService = await AuthServiceFactory.createService(AuthProvider.Google) as GoogleAuthService;
        
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
        
        setAuthStatus({
          state: AuthFlowState.Error,
          message: 'Authentication failed',
          error: {
            code: 'AUTH_FAILED',
            description: errorMessage
          }
        });

        onAuthError?.(error instanceof Error ? error : new Error(errorMessage));
      }
    };

    performAuthentication();
  }, [onAuthSuccess, onAuthError]);

  /**
   * Perform login with status updates throughout the flow
   */
  const performLoginWithStatusUpdates = async (authService: GoogleAuthService): Promise<AuthSession> => {
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
        <GoogleLoginAsciiArt />
      </Box>

      {/* Status Display */}
      <AuthStatusDisplay status={authStatus} />
    </Box>
  );
};