import type { AuthProvider } from "../interfaces/auth-provider.interface.ts";
import { GoogleAuthProvider } from "../providers/google-auth.provider.ts";
import { GitHubAuthProvider } from "../providers/github-auth.provider.ts";

/**
 * Authentication Provider Factory
 * 
 * Factory class responsible for creating appropriate auth provider instances
 * based on the identity provider type. Follows the Factory pattern and 
 * Open/Closed principle for easy extension.
 */
export class AuthProviderFactory {
  /* ========================================
   * Private Properties
   * ======================================== */
  
  private static readonly _providers = new Map<string, () => AuthProvider>([
    ["google", () => new GoogleAuthProvider()],
    ["github", () => new GitHubAuthProvider()],
  ]);
  
  /* ========================================
   * Public Methods
   * ======================================== */
  
  /**
   * Creates an auth provider instance for the specified provider type
   * 
   * @param providerName - The name of the identity provider (e.g., "google")
   * @returns AuthProvider - The appropriate auth provider instance
   * @throws Error if the provider is not supported
   */
  static create(providerName: "google" | "github"): AuthProvider {
    const providerFactory = this._providers.get(providerName.toLowerCase());
    
    if (!providerFactory) {
      throw new Error(`Unsupported auth provider: ${providerName}`);
    }
    
    return providerFactory();
  }
  
  /**
   * Gets a list of all supported provider names
   * 
   * @returns string[] - Array of supported provider names
   */
  static getSupportedProviders(): string[] {
    return Array.from(this._providers.keys());
  }
  
  /**
   * Checks if a provider is supported
   * 
   * @param providerName - The name of the identity provider to check
   * @returns boolean - True if the provider is supported, false otherwise
   */
  static isSupported(providerName: string): boolean {
    return this._providers.has(providerName.toLowerCase());
  }
}