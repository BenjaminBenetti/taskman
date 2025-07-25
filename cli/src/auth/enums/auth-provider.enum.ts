/**
 * Enumeration of supported authentication providers
 * 
 * This enum provides type safety for authentication provider identifiers
 * and ensures consistency across the application.
 */
export enum AuthProvider {
  /** Google OAuth2 authentication */
  Google = 'google',
  
  /** GitHub OAuth2 authentication */
  GitHub = 'github',
  
  /** Apple OAuth2 authentication */
  Apple = 'apple'
}

/**
 * Type guard to check if a string is a valid AuthProvider
 * 
 * @param provider String to check
 * @returns True if the string is a valid AuthProvider
 */
export function isValidAuthProvider(provider: string): provider is AuthProvider {
  return Object.values(AuthProvider).includes(provider as AuthProvider);
}

/**
 * Convert a string to an AuthProvider with validation
 * 
 * @param provider String to convert
 * @returns AuthProvider enum value
 * @throws Error if the provider is not supported
 */
export function toAuthProvider(provider: string): AuthProvider {
  if (!isValidAuthProvider(provider)) {
    throw new Error(`Unsupported authentication provider: ${provider}`);
  }
  return provider;
}