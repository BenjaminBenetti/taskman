import { config } from "../../../config/index.ts";
import type { GoogleTokenExchangeRequest } from "../interfaces/google-token-exchange-request.interface.ts";
import type { GoogleTokenExchangeResponse } from "../interfaces/google-token-exchange-response.interface.ts";
import type { GoogleTokenRefreshResponse } from "../interfaces/google-token-refresh-response.interface.ts";

/**
 * Google OAuth2 token exchange service
 * 
 * This service handles server-side OAuth2 token operations that require
 * the client secret. It provides secure token exchange and refresh
 * operations while keeping the client secret confidential.
 */
export class GoogleTokenExchangeService {
  // ============================================================================
  // Public Methods
  // ============================================================================

  /**
   * Exchange authorization code for access and refresh tokens
   * 
   * This method performs the OAuth2 authorization code exchange with Google's
   * token endpoint, including the client secret that must be kept confidential.
   * 
   * @param request Token exchange request parameters
   * @returns Promise that resolves to the token exchange response
   */
  public async exchangeCodeForTokens(request: GoogleTokenExchangeRequest): Promise<GoogleTokenExchangeResponse> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: request.code,
        client_id: config.google.clientId,
        client_secret: config.google.clientSecret,
        code_verifier: request.codeVerifier,
        redirect_uri: request.redirectUri,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google token exchange failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const tokenData = await response.json();
    
    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      tokenType: tokenData.token_type || 'Bearer',
    };
  }

  /**
   * Refresh access token using refresh token
   * 
   * This method exchanges a refresh token for a new access token using
   * Google's token endpoint with the required client secret.
   * 
   * @param refreshToken The refresh token to exchange
   * @returns Promise that resolves to the token refresh response
   */
  public async refreshAccessToken(refreshToken: string): Promise<GoogleTokenRefreshResponse> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: config.google.clientId,
        client_secret: config.google.clientSecret,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google token refresh failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const tokenData = await response.json();
    
    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      tokenType: tokenData.token_type || 'Bearer',
    };
  }
}