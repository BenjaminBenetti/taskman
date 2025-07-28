/**
 * Response from GitHub OAuth2 token exchange
 */
export interface GitHubTokenExchangeResponse {
  /** Access token for API calls */
  accessToken: string;
  /** Token type (usually 'Bearer') */
  tokenType: string;
  /** Token scope permissions */
  scope?: string;
}