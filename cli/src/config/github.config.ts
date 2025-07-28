/**
 * GitHub OAuth configuration for CLI applications
 * 
 * This configuration is loaded from environment variables and used by the
 * GitHub authentication service to perform OAuth2 flows.
 */
export interface GitHubConfig {
  /** GitHub OAuth client ID for installed applications */
  clientId: string;
  /** Base redirect URI for OAuth flow (CLI will append port) */
  redirectUriBase: string;
  /** OAuth scopes required for authentication */
  scopes: string[];
}

/**
 * Default GitHub configuration loaded from environment variables
 */
export const githubConfig: GitHubConfig = {
  clientId: Deno.env.get('GITHUB_CLIENT_ID') || '',
  redirectUriBase: Deno.env.get('GITHUB_REDIRECT_URI') || 'http://localhost',
  scopes: ['user:email', 'read:user']
};