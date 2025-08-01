/**
 * External Authentication Provider Types
 * 
 * Centralized type definitions for external identity providers supported
 * by the TaskMan authentication system. This ensures consistency across
 * all authentication-related code and makes adding new providers easier.
 */

/**
 * External authentication provider identifiers
 * 
 * Represents the supported external identity providers that users can
 * authenticate with. Each provider corresponds to a specific OAuth2/OpenID
 * Connect implementation.
 * 
 * Currently supported providers:
 * - "google": Google OAuth2 authentication
 * - "github": GitHub OAuth2 authentication
 * 
 * @example
 * ```typescript
 * const provider: ExternalAuthProvider = "google";
 * const authProvider = AuthProviderFactory.create(provider);
 * ```
 */
export type ExternalAuthProvider = "google" | "github";

/**
 * All authentication provider identifiers (external + internal)
 * 
 * Extends ExternalAuthProvider to include internal authentication methods.
 * Used by components that need to handle both external OAuth providers
 * and internal authentication mechanisms.
 */
export type AuthProvider = ExternalAuthProvider | "internal";

/**
 * Type guard to check if a string is a valid external auth provider
 * 
 * @param provider - The provider string to validate
 * @returns boolean - True if the provider is a valid external auth provider
 * 
 * @example
 * ```typescript
 * if (isExternalAuthProvider(userInput)) {
 *   // userInput is now typed as ExternalAuthProvider
 *   const authProvider = AuthProviderFactory.create(userInput);
 * }
 * ```
 */
export function isExternalAuthProvider(provider: string): provider is ExternalAuthProvider {
  return provider === "google" || provider === "github";
}

/**
 * Type guard to check if a string is a valid auth provider (including internal)
 * 
 * @param provider - The provider string to validate
 * @returns boolean - True if the provider is a valid auth provider
 * 
 * @example
 * ```typescript
 * if (isAuthProvider(userInput)) {
 *   // userInput is now typed as AuthProvider
 *   const authProvider = AuthProviderFactory.create(userInput);
 * }
 * ```
 */
export function isAuthProvider(provider: string): provider is AuthProvider {
  return isExternalAuthProvider(provider) || provider === "internal";
}