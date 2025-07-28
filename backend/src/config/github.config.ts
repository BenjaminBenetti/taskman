/**
 * GitHub OAuth configuration interface
 */
export interface GitHubConfig {
  /** GitHub OAuth client ID for applications */
  clientId: string;
  /** GitHub OAuth client secret */
  clientSecret: string;
  /** Base redirect URI for OAuth flow (CLI will append port) */
  redirectUriBase: string;
}