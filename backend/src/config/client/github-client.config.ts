/**
 * GitHub OAuth client configuration
 * 
 * Contains only the configuration data needed by client applications
 * for GitHub OAuth flows. Sensitive data like client secrets are
 * kept server-side only.
 */
export interface GitHubClientConfig {
  /** GitHub OAuth client ID for installed applications */
  clientId: string;
  /** Base redirect URI for OAuth flow (client will append port) */
  redirectUriBase: string;
  /** OAuth scopes required for authentication */
  scopes: string[];
}