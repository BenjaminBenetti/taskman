/**
 * Enumeration of authentication flow states
 * 
 * This enum represents the different states during the OAuth2 authentication flow,
 * allowing the UI to provide appropriate feedback to the user at each stage.
 */
export enum AuthFlowState {
  /** Initial state when starting authentication */
  Initializing = 'initializing',
  
  /** Opening browser for user authentication */
  BrowserOpening = 'browser_opening',
  
  /** Waiting for user to complete authentication in browser */
  WaitingForUser = 'waiting_for_user',
  
  /** Processing the authorization code and exchanging for tokens */
  ProcessingToken = 'processing_token',
  
  /** Authentication completed successfully */
  Success = 'success',
  
  /** Authentication failed or was cancelled */
  Error = 'error'
}

/**
 * Type guard to check if a string is a valid AuthFlowState
 * 
 * @param state String to check
 * @returns True if the string is a valid AuthFlowState
 */
export function isValidAuthFlowState(state: string): state is AuthFlowState {
  return Object.values(AuthFlowState).includes(state as AuthFlowState);
}