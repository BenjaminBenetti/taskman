/**
 * Google OAuth configuration for client applications
 */
export interface GoogleClientConfig {
  /** Google OAuth client ID for installed applications */
  clientId: string;
  /** Base redirect URI for OAuth flow (CLI will append port) */
  redirectUriBase: string;
  /** OAuth scopes required for authentication */
  scopes: string[];
}