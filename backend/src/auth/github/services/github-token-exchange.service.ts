import { config } from "../../../config/index.ts";
import type { GitHubTokenExchangeRequest } from "../interfaces/github-token-exchange-request.interface.ts";
import type { GitHubTokenExchangeResponse } from "../interfaces/github-token-exchange-response.interface.ts";

/**
 * GitHub OAuth2 token exchange service
 * 
 * This service handles server-side OAuth2 token operations that require
 * the client secret. It provides secure token exchange operations while
 * keeping the client secret confidential.
 */
export class GitHubTokenExchangeService {
  // ================================================
  // Public Methods
  // ================================================

  /**
   * Exchange authorization code for access token
   * 
   * This method performs the OAuth2 authorization code exchange with GitHub's
   * token endpoint, including the client secret that must be kept confidential.
   * Note: GitHub tokens do not expire and do not provide refresh tokens.
   * 
   * @param request Token exchange request parameters
   * @returns Promise that resolves to the token exchange response
   */
  public async exchangeCodeForTokens(request: GitHubTokenExchangeRequest): Promise<GitHubTokenExchangeResponse> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: request.code,
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code_verifier: request.codeVerifier,
        redirect_uri: request.redirectUri,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub token exchange failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const tokenData = await response.json();
    
    // Check for GitHub-specific error responses
    if (tokenData.error) {
      throw new Error(`GitHub token exchange failed: ${tokenData.error} - ${tokenData.error_description || 'Unknown error'}`);
    }
    
    return {
      accessToken: tokenData.access_token,
      tokenType: tokenData.token_type || 'Bearer',
      scope: tokenData.scope,
    };
  }
}