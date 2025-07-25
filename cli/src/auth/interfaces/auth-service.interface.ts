import { AuthSession } from "./auth-session.interface.ts";

/**
 * Authentication service interface for CLI applications
 * 
 * This service manages a single user session and provides login capabilities.
 * Since this is a CLI application, there is only ever exactly one session.
 */
export interface AuthService {
  /**
   * Initiate the login flow for this authentication provider
   * 
   * @returns Promise that resolves to the authentication session
   */
  login(): Promise<AuthSession>;
  
  /**
   * Log out the current user and clear the session
   * 
   * @returns Promise that resolves when logout is complete
   */
  logout(): Promise<void>;
  
  /**
   * Get the current authenticated session
   * 
   * @returns Promise that resolves to the current session or null if not authenticated
   */
  getCurrentSession(): Promise<AuthSession | null>;
  
  /**
   * Check if user is currently authenticated
   * 
   * @returns Promise that resolves to true if authenticated, false otherwise
   */
  isAuthenticated(): Promise<boolean>;
  
  /**
   * Refresh the current session if it has expired
   * 
   * @returns Promise that resolves to the refreshed session or null if refresh fails
   */
  refreshCurrentSession(): Promise<AuthSession | null>;
}