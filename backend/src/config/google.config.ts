/**
 * Google OAuth configuration interface
 */
export interface GoogleConfig {
  /** OIDC metadata URL for Google Idp*/
  oidcMetadataUrl: string;
  /** Google OAuth client ID for installed applications */
  clientId: string;
  /** Google OAuth client secret */
  clientSecret: string;
  /** Base redirect URI for OAuth flow (CLI will append port) */
  redirectUriBase: string;
}