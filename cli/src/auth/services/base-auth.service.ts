import type { AuthService } from "../interfaces/auth-service.interface.ts";
import type { AuthSession } from "../interfaces/auth-session.interface.ts";
import { config } from "../../config/index.ts";

/**
 * Generic authentication service implementation
 * 
 * This service manages a single authentication session for CLI applications.
 * It provides persistence and basic session management while delegating
 * provider-specific login logic to concrete implementations.
 */
export abstract class BaseAuthService implements AuthService {
  private session: AuthSession | null = null;

  // ================================================
  // Abstract Methods
  // ================================================

  /**
   * Abstract method for provider-specific login implementation
   * 
   * @returns Promise that resolves to the authentication session
   */
  abstract performLogin(): Promise<AuthSession>;

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

  // ================================================
  // Public Methods
  // ================================================

  /**
   * Initiate the login flow
   * 
   * @returns Promise that resolves to the authentication session
   */
  public async login(): Promise<AuthSession> {
    this.session = await this.performLogin();
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