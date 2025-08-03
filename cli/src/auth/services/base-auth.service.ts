import type { AuthService } from "../interfaces/auth-service.interface.ts";
import type { AuthSession } from "../interfaces/auth-session.interface.ts";
import type { AuthFlowStatusCallback } from "../interfaces/auth-flow-status.interface.ts";
import type { BackendTokenProvider } from "../interfaces/backend-token-provider.interface.ts";
import type { User } from "@taskman/backend";
import { config } from "../../config/index.ts";
import { InternalTokenService } from "./internal-token.service.ts";
import { TrpcClientFactory } from "../../trpc/factory/trpc-client.factory.ts";
import { userConverter } from "../../users/converters/user.converter.ts";

/**
 * Generic authentication service implementation
 * 
 * This service manages a single authentication session for CLI applications.
 * It provides persistence and basic session management while delegating
 * provider-specific login logic to concrete implementations.
 */
export abstract class BaseAuthService implements AuthService, BackendTokenProvider {
  private session: AuthSession | null = null;
  private internalTokenService = new InternalTokenService();

  // ================================================
  // Abstract Methods
  // ================================================

  /**
   * Abstract method for provider-specific login implementation
   * 
   * @param statusCallback Optional callback for authentication flow status updates
   * @returns Promise that resolves to the authentication session
   */
  abstract performLogin(statusCallback?: AuthFlowStatusCallback): Promise<AuthSession>;

  /**
   * Abstract method for provider-specific logout implementation
   * 
   * @returns Promise that resolves when provider logout is complete
   */
  abstract performLogout(): Promise<void>;

  /**
   * Abstract method for refreshing tokens
   * 
   * @param refreshToken The refresh token to use for obtaining new tokens
   * @returns Promise that resolves to the new authentication session
   */
  protected abstract performRefresh(refreshToken: string): Promise<AuthSession>;

  /**
   * Abstract method for determining which provider token to send to the backend
   * This is used as fallback when internal token is not available
   * 
   * @param session The current authentication session
   * @returns The provider token to use for backend authentication, or null if none available
   */
  abstract getProviderBackendToken(session: AuthSession): string | null;

  // ================================================
  // Public Methods
  // ================================================

  /**
   * Get the backend authentication token, preferring internal tokens over provider tokens
   * 
   * @param session The current authentication session
   * @returns The token to use for backend authentication, or null if none available
   */
  public getBackendToken(session: AuthSession): string | null {
    return session.internalToken ?? null;
  }

  /**
   * Initiate the login flow
   * 
   * @param statusCallback Optional callback for authentication flow status updates
   * @returns Promise that resolves to the authentication session
   */
  public async login(statusCallback?: AuthFlowStatusCallback): Promise<AuthSession> {
    this.session = await this.performLogin(statusCallback);
    await this.persistSession();
    return this.session;
  }

  /**
   * Log out the current user
   * 
   * @returns Promise that resolves when logout is complete
   */
  public async logout(): Promise<void> {
    if (this.session) {
      await this.performLogout();
      // Clean up internal token before nullifying session
      this.session = this.internalTokenService.removeInternalToken(this.session);
      this.session = null;
      await this.clearPersistedSession();
    }
  }

  /**
   * Get the current session
   * 
   * @returns Promise that resolves to the current session or null if not authenticated
   */
  public async getCurrentSession(): Promise<AuthSession | null> {
    if (!this.session) {
      await this.loadSession();
    }
    
    if (this.session && this.isSessionExpired(this.session)) {
      await this.refreshCurrentSession();
    }
    
    // Refresh internal token if needed
    if (this.session) {
      this.session = await this.internalTokenService.refreshInternalTokenIfNeeded(this.session);
      await this.persistSession();
    }
    
    return this.session;
  }

  /**
   * Check if user is authenticated
   * 
   * @returns Promise that resolves to true if authenticated, false otherwise
   */
  public async isAuthenticated(): Promise<boolean> {
    const session = await this.getCurrentSession();
    return session !== null && !this.isSessionExpired(session);
  }

  /**
   * Refresh the current session
   *
   * @returns Promise that resolves to the refreshed session or null if refresh fails
   */
  public async refreshCurrentSession(): Promise<AuthSession | null> {
    if (!this.session?.refreshToken) {
      return null;
    }

    try {
      this.session = await this.performRefresh(this.session.refreshToken);
      if (this.session) {
        await this.persistSession();
      }
      return this.session;
    } catch (_error) {
      this.session = null;
      await this.clearPersistedSession();
      return null;
    }
  }

  /**
   * Get the currently authenticated user's information from the backend
   *
   * @returns Promise that resolves to the user information with Date objects properly converted
   * @throws Error if not authenticated or if the request fails
   */
  public async getCurrentUserInfo(): Promise<User> {
    // Ensure we have an active authenticated session
    const session = await this.getCurrentSession();
    if (!session) {
      throw new Error("Not authenticated - please log in first");
    }

    try {
      // Create authenticated TRPC client
      const trpcClient = await TrpcClientFactory.create();

      // Query the users.me endpoint
      const serializedUserInfo = await trpcClient.users.me.query();

      if (!serializedUserInfo) {
        throw new Error("Failed to retrieve user information from backend");
      }

      // Use the established converter pattern to transform serialized data to domain model
      return userConverter.fromSerialized(serializedUserInfo);
    } catch (error) {
      // Handle different types of errors appropriately
      if (error instanceof Error) {
        // Check for authentication-related errors
        if (error.message.includes('UNAUTHORIZED') || error.message.includes('Authentication required')) {
          throw new Error("Authentication failed - please log in again");
        }

        // Check for network-related errors
        if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
          throw new Error("Network error - unable to connect to backend service");
        }

        // Re-throw the original error with context
        throw new Error(`Failed to get user information: ${error.message}`);
      }

      // Handle non-Error objects
      throw new Error("An unexpected error occurred while retrieving user information");
    }
  }

  // ================================================
  // Protected Methods
  // ================================================

  /**
   * Exchange session tokens for internal token
   * This is available to subclasses for use during login/refresh flows
   * 
   * @param session The authentication session to enhance with internal token
   * @returns Promise that resolves to updated session with internal token
   */
  protected async exchangeForInternalToken(session: AuthSession): Promise<AuthSession> {
    return await this.internalTokenService.exchangeForInternalToken(session);
  }

  // ================================================
  // Private Methods
  // ================================================

  /**
   * Get the session file path with home directory expansion
   * 
   * @returns The resolved session file path
   */
  private getSessionFilePath(): string {
    const filePath = config.session.filePath;
    if (filePath.startsWith('~')) {
      const homeDir = Deno.env.get('HOME') || Deno.env.get('USERPROFILE') || '/tmp';
      return filePath.replace('~', homeDir);
    }
    return filePath;
  }

  /**
   * Check if a session is expired
   * 
   * @param session The authentication session to check
   * @returns True if the session is expired, false otherwise
   */
  private isSessionExpired(session: AuthSession): boolean {
    if (!session.expiresAt) {
      return false;
    }
    return Date.now() / 1000 >= session.expiresAt;
  }

  /**
   * Persist session to disk
   * 
   * @returns Promise that resolves when the session is persisted
   */
  private async persistSession(): Promise<void> {
    if (!this.session) return;
    
    try {
      const sessionFilePath = this.getSessionFilePath();
      const sessionData = JSON.stringify(this.session, null, 2);
      
      // Ensure directory exists
      const dirPath = sessionFilePath.substring(0, sessionFilePath.lastIndexOf('/'));
      await Deno.mkdir(dirPath, { recursive: true });
      
      await Deno.writeTextFile(sessionFilePath, sessionData);
      await Deno.chmod(sessionFilePath, 0o600);
    } catch (error) {
      console.warn("Failed to persist session:", error);
    }
  }

  /**
   * Load session from disk
   * 
   * @returns Promise that resolves when the session is loaded
   */
  private async loadSession(): Promise<void> {
    try {
      const sessionFilePath = this.getSessionFilePath();
      const sessionData = await Deno.readTextFile(sessionFilePath);
      this.session = JSON.parse(sessionData) as AuthSession;
    } catch {
      this.session = null;
    }
  }

  /**
   * Clear persisted session from disk
   * 
   * @returns Promise that resolves when the session file is removed
   */
  private async clearPersistedSession(): Promise<void> {
    try {
      const sessionFilePath = this.getSessionFilePath();
      await Deno.remove(sessionFilePath);
    } catch {
      // File might not exist, ignore
    }
  }
}