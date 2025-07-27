import type { AuthFlowState } from "../enums/auth-flow-state.enum.ts";

/**
 * Interface representing the status of an authentication flow
 * 
 * This interface is used to communicate authentication state changes
 * from the auth service to the UI components, enabling proper user feedback.
 */
export interface AuthFlowStatus {
  /** Current state of the authentication flow */
  state: AuthFlowState;
  
  /** Optional message providing additional context */
  message?: string;
  
  /** Optional authentication URL to display if browser fails to open */
  authUrl?: string;
  
  /** Optional error details when state is AuthFlowState.Error */
  error?: {
    /** Error code or type */
    code: string;
    /** Human-readable error description */
    description: string;
  };
}

/**
 * Type for authentication flow status update callback
 * 
 * @param status The current authentication flow status
 */
export type AuthFlowStatusCallback = (status: AuthFlowStatus) => void;