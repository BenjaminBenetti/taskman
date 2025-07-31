import type { AuthSession } from "./auth-session.interface.ts";

/**
 * Interface for determining which token to send to the backend for authentication
 * 
 * Different auth providers may use different tokens for backend authentication:
 * - Google: Uses ID token (JWT) for backend authentication
 * - GitHub: Uses access token for backend authentication
 * - etc.
 */
export interface BackendTokenProvider {
  /**
   * Get the token that should be sent to the backend for authentication
   * 
   * @param session The current authentication session
   * @returns The token to use for backend authentication, or null if none available
   */
  getBackendToken(session: AuthSession): string | null;
}