import { BaseAuthService } from "./base-auth.service.ts";
import type { AuthSession } from "../interfaces/auth-session.interface.ts";
import { AuthProvider } from "../enums/auth-provider.enum.ts";
import type { GoogleClientConfig } from "@taskman/backend";
import { TrpcClientFactory } from "../../trpc/factory/trpc-client.factory.ts";

/**
 * Google OAuth2 authentication service for CLI applications
 * 
 * Implements the OAuth2 authorization code flow with PKCE for security.
 * Opens a browser for user authentication and handles the OAuth redirect
 * via a temporary local HTTP server.
 */
export class GoogleAuthService extends BaseAuthService {
  private googleConfig: GoogleClientConfig | null = null;

  // ============================================================================
  // Public Methods
  // ============================================================================

  /**
   * Initialize the service by fetching Google OAuth configuration
   * 
   * @returns Promise that resolves when configuration is loaded
   */
  public async initialize(): Promise<void> {
    const trpcClient = TrpcClientFactory.create();
    const clientConfig = await trpcClient.config.clientConfig.query();
    this.googleConfig = clientConfig.auth.google;
  }

  // ============================================================================
  // Protected Implementation
  // ============================================================================

  /**
   * Perform Google OAuth2 login flow
   * 
   * @returns Promise that resolves to the authentication session
   */
  async performLogin(): Promise<AuthSession> {
    if (!this.googleConfig) {
      throw new Error("Google configuration not loaded. Call initialize() first.");
    }

    const redirectPort = this.findAvailablePort();
    const { authUrl, codeVerifier, state } = await this.buildAuthUrl(redirectPort);
    
    // Start local server to handle OAuth redirect
    const authCodePromise = this.startRedirectServer(redirectPort, state);
    
    // Open browser to Google OAuth page
    await this.openBrowser(authUrl);
    
    console.log("Waiting for authentication...");
    console.log("If your browser doesn't open automatically, visit:");
    console.log(authUrl);
    
    // Wait for authorization code
    const authCode = await authCodePromise;
    
    // Exchange authorization code for tokens
    return await this.exchangeCodeForTokens(authCode, codeVerifier, redirectPort);
  }

  /**
   * Perform Google OAuth2 logout (revoke tokens)
   * 
   * @returns Promise that resolves when logout is complete
   */
  async performLogout(): Promise<void> {
    const session = await this.getCurrentSession();
    if (session?.accessToken) {
      try {
        // Revoke the access token
        await fetch(`https://oauth2.googleapis.com/revoke?token=${session.accessToken}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
      } catch (error) {
        console.warn("Failed to revoke Google token:", error);
      }
    }
  }

  /**
   * Refresh Google OAuth2 tokens
   * 
   * @param refreshToken The refresh token to use for obtaining new tokens
   * @returns Promise that resolves to the new authentication session
   */
  protected async performRefresh(refreshToken: string): Promise<AuthSession> {
    if (!this.googleConfig) {
      throw new Error("Google configuration not loaded");
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.googleConfig.clientId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const tokenData = await response.json();
    const userInfo = await this.fetchUserInfo(tokenData.access_token);

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || refreshToken,
      provider: AuthProvider.Google,
      providerUserId: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      expiresAt: tokenData.expires_in ? Math.floor(Date.now() / 1000) + tokenData.expires_in : undefined,
    };
  }

  // ============================================================================
  // Private Implementation
  // ============================================================================

  /**
   * Build Google OAuth2 authorization URL with PKCE
   * 
   * @param redirectPort The port number for the redirect URI
   * @returns Authorization URL, code verifier, and state parameter
   */
  private async buildAuthUrl(redirectPort: number): Promise<{ authUrl: string; codeVerifier: string; state: string }> {
    if (!this.googleConfig) {
      throw new Error("Google configuration not loaded");
    }

    // Generate PKCE code verifier and challenge
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    const state = this.generateRandomString(32);

    const params = new URLSearchParams({
      client_id: this.googleConfig.clientId,
      redirect_uri: `${this.googleConfig.redirectUriBase}:${redirectPort}/callback`,
      response_type: 'code',
      scope: this.googleConfig.scopes.join(' '),
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: state,
      access_type: 'offline',
      prompt: 'consent',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return { authUrl, codeVerifier, state };
  }

  /**
   * Find an available port for the redirect server
   * 
   * @returns Available port number
   */
  private findAvailablePort(): number {
    for (let port = 8080; port < 8090; port++) {
      try {
        const listener = Deno.listen({ port });
        listener.close();
        return port;
      } catch {
        continue;
      }
    }
    throw new Error("No available ports found");
  }

  /**
   * Start HTTP server to handle OAuth redirect
   * 
   * @param port Port number to listen on
   * @param expectedState Expected state parameter for CSRF protection
   * @returns Promise that resolves to the authorization code
   */
  private startRedirectServer(port: number, expectedState: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const controller = new AbortController();
      
      Deno.serve(
        {
          port,
          signal: controller.signal,
          onListen: () => {
            // Server started successfully
          },
        },
        (request) => {
          const url = new URL(request.url);
          
          if (url.pathname === '/callback') {
            const code = url.searchParams.get('code');
            const state = url.searchParams.get('state');
            const error = url.searchParams.get('error');

            if (error) {
              const errorDescription = url.searchParams.get('error_description') || error;
              controller.abort();
              reject(new Error(`OAuth error: ${errorDescription}`));
              return new Response(
                `<html><body><h1>Authentication Failed</h1><p>${errorDescription}</p></body></html>`,
                { status: 400, headers: { 'Content-Type': 'text/html' } }
              );
            }

            if (!code || state !== expectedState) {
              controller.abort();
              reject(new Error("Invalid OAuth response"));
              return new Response(
                '<html><body><h1>Authentication Failed</h1><p>Invalid request parameters</p></body></html>',
                { status: 400, headers: { 'Content-Type': 'text/html' } }
              );
            }

            controller.abort();
            resolve(code);
            return new Response(
              '<html><body><h1>Authentication Successful!</h1><p>You can close this window and return to the terminal.</p></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          }

          return new Response("Not Found", { status: 404 });
        }
      );
    });
  }

  /**
   * Open browser to the authentication URL
   * 
   * @param url URL to open in browser
   * @returns Promise that resolves when browser command is executed
   */
  private async openBrowser(url: string): Promise<void> {
    const os = Deno.build.os;
    let cmd: string[];

    switch (os) {
      case "windows":
        cmd = ["cmd", "/c", "start", url];
        break;
      case "darwin":
        cmd = ["open", url];
        break;
      default:
        cmd = ["xdg-open", url];
        break;
    }

    try {
      const process = new Deno.Command(cmd[0], { args: cmd.slice(1) });
      process.spawn();
    } catch (error) {
      console.warn("Failed to open browser automatically:", error);
    }
  }

  /**
   * Exchange authorization code for access and refresh tokens
   * 
   * @param code Authorization code from OAuth redirect
   * @param codeVerifier PKCE code verifier
   * @param redirectPort Port used for redirect URI
   * @returns Promise that resolves to the authentication session
   */
  private async exchangeCodeForTokens(code: string, codeVerifier: string, redirectPort: number): Promise<AuthSession> {
    if (!this.googleConfig) {
      throw new Error("Google configuration not loaded");
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: this.googleConfig.clientId,
        code_verifier: codeVerifier,
        redirect_uri: `${this.googleConfig.redirectUriBase}:${redirectPort}/callback`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token exchange failed: ${response.statusText} - ${errorText}`);
    }

    const tokenData = await response.json();
    const userInfo = await this.fetchUserInfo(tokenData.access_token);

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      provider: AuthProvider.Google,
      providerUserId: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      expiresAt: tokenData.expires_in ? Math.floor(Date.now() / 1000) + tokenData.expires_in : undefined,
    };
  }

  /**
   * Fetch user information from Google
   * 
   * @param accessToken Access token to use for API call
   * @returns Promise that resolves to user information
   */
  private async fetchUserInfo(accessToken: string): Promise<{ sub: string; email: string; name: string; picture: string }> {
    const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Generate a cryptographically secure random string for PKCE
   * 
   * @returns Base64URL-encoded random string
   */
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.base64URLEncode(array);
  }

  /**
   * Generate PKCE code challenge from verifier
   * 
   * @param verifier Code verifier string
   * @returns Promise that resolves to base64URL-encoded challenge
   */
  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return this.base64URLEncode(new Uint8Array(digest));
  }

  /**
   * Generate a random string for state parameter
   * 
   * @param length Length of the random string
   * @returns Random string
   */
  private generateRandomString(length: number): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Encode array to base64URL format
   * 
   * @param array Byte array to encode
   * @returns Base64URL-encoded string
   */
  private base64URLEncode(array: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...array));
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
}