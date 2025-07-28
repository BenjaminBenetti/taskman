import type { AuthService } from "../interfaces/auth-service.interface.ts";
import type { AuthSession } from "../interfaces/auth-session.interface.ts";
import { AuthProvider, toAuthProvider } from "../enums/auth-provider.enum.ts";
import { GoogleAuthService } from "../services/google-auth.service.ts";
import { GitHubAuthService } from "../services/github-auth.service.ts";
import { config } from "../../config/index.ts";
import { exists } from "jsr:@std/fs/exists";

/**
 * Factory for creating and managing authentication service instances
 * 
 * This factory abstracts the underlying authentication provider and maintains
 * a singleton instance based on the current session or user selection.
 * It handles provider detection from persisted sessions and initialization.
 */
export class AuthServiceFactory {
  private static instance: AuthService | null = null;
  private static currentProvider: AuthProvider | null = null;

  // ================================================
  // Public Static Methods
  // ================================================

  /**
   * Get the current authentication service instance
   * 
   * If no instance exists, it will attempt to create one based on the
   * persisted session. If no session exists, returns null.
   * 
   * @returns Promise that resolves to the current auth service or null
   */
  public static async getCurrentService(): Promise<AuthService | null> {
    if (!this.instance) {
      await this.initializeFromSession();
    }
    return this.instance;
  }

  /**
   * Create and set an authentication service for the specified provider
   * 
   * @param provider The authentication provider
   * @returns Promise that resolves to the created auth service
   */
  public static async createService(provider: AuthProvider): Promise<AuthService> {
    const service = await this.createServiceForProvider(provider);
    this.instance = service;
    this.currentProvider = provider;
    return service;
  }

  /**
   * Check if a user is currently authenticated
   * 
   * @returns Promise that resolves to true if authenticated, false otherwise
   */
  public static async isAuthenticated(): Promise<boolean> {
    const service = await this.getCurrentService();
    if (!service) {
      return false;
    }
    return await service.isAuthenticated();
  }

  /**
   * Get the current authentication session
   * 
   * @returns Promise that resolves to the current session or null
   */
  public static async getCurrentSession(): Promise<AuthSession | null> {
    const service = await this.getCurrentService();
    if (!service) {
      return null;
    }
    return await service.getCurrentSession();
  }

  /**
   * Log out the current user and clear the service instance
   * 
   * @returns Promise that resolves when logout is complete
   */
  public static async logout(): Promise<void> {
    if (this.instance) {
      await this.instance.logout();
      this.instance = null;
      this.currentProvider = null;
    }
  }

  /**
   * Get the current provider type
   * 
   * @returns The current provider or null if no service is active
   */
  public static getCurrentProvider(): AuthProvider | null {
    return this.currentProvider;
  }

  // ================================================
  // Private Static Methods
  // ================================================

  /**
   * Initialize the factory from an existing session file
   * 
   * Reads the persisted session and creates the appropriate service
   * based on the provider information stored in the session.
   * 
   * @returns Promise that resolves when initialization is complete
   */
  private static async initializeFromSession(): Promise<void> {
    const sessionFilePath = this.getSessionFilePath();
    
    // Check if session file exists
    const fileExists = await exists(sessionFilePath);
    if (!fileExists) {
      return; // No session file, nothing to initialize
    }
    
    const sessionData = await Deno.readTextFile(sessionFilePath);
    const session: AuthSession = JSON.parse(sessionData);
    
    if (session.provider) {
      const service = await this.createServiceForProvider(session.provider);
      this.instance = service;
      this.currentProvider = session.provider;
    }
  }

  /**
   * Create an authentication service instance for the specified provider
   * 
   * @param provider The authentication provider
   * @returns Promise that resolves to the created auth service
   */
  private static async createServiceForProvider(provider: AuthProvider): Promise<AuthService> {
    switch (provider) {
      case AuthProvider.Google: {
        const googleService = new GoogleAuthService();
        await googleService.initialize();
        return googleService;
      }
      
      case AuthProvider.GitHub: {
        const githubService = new GitHubAuthService();
        await githubService.initialize();
        return githubService;
      }
      
      case AuthProvider.Apple: {
        // TODO: Implement AppleAuthService when ready
        throw new Error('Apple authentication not yet implemented');
      }
      
      default: {
        const exhaustiveCheck: never = provider;
        throw new Error(`Unsupported authentication provider: ${exhaustiveCheck}`);
      }
    }
  }

  /**
   * Get the session file path with home directory expansion
   * 
   * @returns The resolved session file path
   */
  private static getSessionFilePath(): string {
    const filePath = config.session.filePath;
    if (filePath.startsWith('~')) {
      const homeDir = Deno.env.get('HOME') || Deno.env.get('USERPROFILE') || '/tmp';
      return filePath.replace('~', homeDir);
    }
    return filePath;
  }
}