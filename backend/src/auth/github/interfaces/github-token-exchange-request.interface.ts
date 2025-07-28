/**
 * Request parameters for GitHub OAuth2 token exchange
 */
export interface GitHubTokenExchangeRequest {
  /** Authorization code received from OAuth redirect */
  code: string;
  /** PKCE code verifier used to generate the challenge */
  codeVerifier: string;
  /** Redirect URI used in the authorization request */
  redirectUri: string;
}