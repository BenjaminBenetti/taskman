/**
 * Response from Google OAuth2 token exchange
 */
export interface GoogleTokenExchangeResponse {
  /** Access token for API calls */
  accessToken: string;
  /** Refresh token for obtaining new access tokens */
  refreshToken?: string;
  /** Token expiration time in seconds */
  expiresIn?: number;
  /** Token type (usually 'Bearer') */
  tokenType: string;
}