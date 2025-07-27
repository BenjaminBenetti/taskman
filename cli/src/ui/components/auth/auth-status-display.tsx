import React from 'react';
import { Text, Box } from 'ink';
import Link from 'ink-link';
import { AuthFlowState } from '../../../auth/enums/auth-flow-state.enum.ts';
import type { AuthFlowStatus } from '../../../auth/interfaces/auth-flow-status.interface.ts';

interface AuthStatusDisplayProps {
  /** Current authentication flow status */
  status: AuthFlowStatus;
}

/**
 * Component that displays authentication status messages in a centered message box
 * 
 * Provides visual feedback to users during the OAuth2 authentication flow,
 * including status messages, auth URLs when browser fails to open, and error details.
 */
export const AuthStatusDisplay: React.FC<AuthStatusDisplayProps> = ({ status }: AuthStatusDisplayProps) => {
  const getStatusMessage = (): string => {
    if (status.message) {
      return status.message;
    }

    switch (status.state) {
      case AuthFlowState.Initializing:
        return 'Initializing authentication...';
      case AuthFlowState.BrowserOpening:
        return 'Opening browser for authentication...';
      case AuthFlowState.WaitingForUser:
        return 'Waiting for authentication in browser...';
      case AuthFlowState.ProcessingToken:
        return 'Processing authentication token...';
      case AuthFlowState.Success:
        return 'Authentication successful!';
      case AuthFlowState.Error:
        return 'Authentication failed';
      default:
        return 'Processing...';
    }
  };

  const getStatusColor = () => {
    switch (status.state) {
      case AuthFlowState.Initializing:
      case AuthFlowState.BrowserOpening:
      case AuthFlowState.ProcessingToken:
        return 'yellow';
      case AuthFlowState.WaitingForUser:
        return 'cyan';
      case AuthFlowState.Success:
        return 'green';
      case AuthFlowState.Error:
        return 'red';
      default:
        return 'white';
    }
  };

  const getSpinner = (): string => {
    const isLoading = [
      AuthFlowState.Initializing,
      AuthFlowState.BrowserOpening,
      AuthFlowState.ProcessingToken
    ].includes(status.state);

    return isLoading ? '⏳ ' : '';
  };

  return (
    <Box flexDirection="column" alignItems="center" paddingX={2}>
      {/* Main status message box */}
      <Box
        borderStyle="round"
        borderColor={getStatusColor()}
        paddingX={2}
        paddingY={1}
        minWidth={60}
        justifyContent="center"
      >
        <Text color={getStatusColor()}>
          {getSpinner()}{getStatusMessage()}
        </Text>
      </Box>

      {/* Error details */}
      {status.state === AuthFlowState.Error && status.error && (
        <Box marginTop={1} paddingX={2}>
          <Box flexDirection="column" alignItems="center">
            <Text color="red" bold>
              Error: {status.error.code}
            </Text>
            <Text color="red" wrap="wrap">
              {status.error.description}
            </Text>
          </Box>
        </Box>
      )}

      {/* Authentication URL display */}
      {status.authUrl && status.state === AuthFlowState.WaitingForUser && (
        <Box marginTop={1} flexDirection="column" alignItems="center">
          <Text color="yellow" bold>
            If your browser doesn't open automatically, click the link below:
          </Text>
          <Box
            borderStyle="single"
            borderColor="yellow"
            paddingX={1}
            marginTop={1}
            maxWidth={80}
          >
            <Link url={status.authUrl}>
              <Text color="cyan" underline wrap="wrap">
                {status.authUrl}
              </Text>
            </Link>
          </Box>
          <Box marginTop={1}>
            <Text color="gray" dimColor>
              💡 Ctrl+Click (Cmd+Click on Mac) to open the link in your browser
            </Text>
          </Box>
        </Box>
      )}

      {/* Instructions */}
      {status.state !== AuthFlowState.Success && status.state !== AuthFlowState.Error && (
        <Box marginTop={2}>
          <Text dimColor>
            Press Ctrl+C to cancel
          </Text>
        </Box>
      )}

      {/* Success instructions */}
      {status.state === AuthFlowState.Success && (
        <Box marginTop={1}>
          <Text color="green">
            Authentication Complete.
          </Text>
        </Box>
      )}
    </Box>
  );
};