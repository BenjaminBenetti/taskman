import type { AuthProvider } from "../enums/auth-provider.enum.ts";

/**
 * Represents an authentication session containing tokens and user information
 * 
 * This interface follows DDD principles by encapsulating authentication session
 * data as a value object. It's immutable and provider-agnostic.
 */
export interface AuthSession {
  /** The access token for API calls */
  readonly accessToken: string;
  
  /** The refresh token for obtaining new access tokens */
  readonly refreshToken?: string;
  
  /** The ID token (JWT) for backend authentication - provider specific */
  readonly idToken?: string;
  
  /** When the access token expires (Unix timestamp) */
  readonly expiresAt?: number;
  
  /** The identity provider used for authentication */
  readonly provider: AuthProvider;
  
  /** Provider-specific user identifier */
  readonly providerUserId: string;
  
  /** User's email address */
  readonly email: string;
  
  /** User's display name */
  readonly name?: string;
  
  /** User's profile picture URL */
  readonly picture?: string;
  
  /** Additional provider-specific data */
  readonly metadata?: Record<string, unknown>;
}