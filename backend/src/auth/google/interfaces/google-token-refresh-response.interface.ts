/**
 * Response from Google OAuth2 token refresh
 */
export interface GoogleTokenRefreshResponse {
  /** New access token */
  accessToken: string;
  /** New refresh token (if provided) */
  refreshToken?: string;
  /** ID token (JWT) - may not be included in refresh response */
  idToken?: string;
  /** Token expiration time in seconds */
  expiresIn?: number;
  /** Token type (usually 'Bearer') */
  tokenType: string;
}