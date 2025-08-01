import { BaseAuthService } from "./base-auth.service.ts";
import type { AuthSession } from "../interfaces/auth-session.interface.ts";
import { AuthProvider } from "../enums/auth-provider.enum.ts";
import type { GitHubClientConfig } from "@taskman/backend"
import { OAuthSplashTemplateService } from "../templates/oauth-splash-template.service.ts";
import { AuthFlowState } from "../enums/auth-flow-state.enum.ts";
import type { AuthFlowStatus, AuthFlowStatusCallback } from "../interfaces/auth-flow-status.interface.ts";
import { PublicTrpcClientFactory } from "../../trpc/factory/public-trpc-client.factory.ts";

/**
 * GitHub OAuth2 authentication service for CLI applications
 * 
 * Implements the OAuth2 authorization code flow with PKCE for security.
 * Opens a browser for user authentication and handles the OAuth redirect
 * via a temporary local HTTP server.
 * 
 * Note: GitHub tokens do not expire and do not provide refresh tokens,
 * so token refresh simply returns the existing session.
 */
export class GitHubAuthService extends BaseAuthService {
  /**
   * Delay in milliseconds before shutting down the OAuth redirect server.
   * 
   * This delay is necessary to ensure HTTP responses are fully transmitted
   * to the browser before the server is shut down. Without this delay,
   * there's a race condition where the server might close the connection
   * before the browser receives the complete response, resulting in
   * connection errors or incomplete page rendering.
   */
  private static readonly SERVER_SHUTDOWN_DELAY_MS = 2000;

  /**
   * Extended delay in milliseconds for error pages to allow users time to read error messages.
   * 
   * When OAuth errors occur, users need sufficient time to read and understand
   * the error message before the page closes automatically. This longer delay
   * ensures users can see what went wrong without the page disappearing too quickly.
   */
  private static readonly ERROR_DISPLAY_DELAY_MS = 10000;

  private githubConfig: GitHubClientConfig | null = null;
  private templateService = new OAuthSplashTemplateService();
  private statusCallback?: AuthFlowStatusCallback;

  // ================================================
  // Public Methods
  // ================================================

  /**
   * Initialize the service by fetching GitHub OAuth configuration
   * 
   * @returns Promise that resolves when configuration is loaded
   */
  public async initialize(): Promise<void> {
    const trpcClient = PublicTrpcClientFactory.create();
    const clientConfig = await trpcClient.config.clientConfig.query();
    this.githubConfig = clientConfig.auth.github;
  }

  // ================================================
  // Protected Implementation
  // ================================================

  /**
   * Perform GitHub OAuth2 login flow
   * 
   * @param statusCallback Optional callback for auth flow status updates
   * @returns Promise that resolves to the authentication session
   */
  async performLogin(statusCallback?: AuthFlowStatusCallback): Promise<AuthSession> {
    this.statusCallback = statusCallback;
    if (!this.githubConfig) {
      throw new Error("GitHub configuration not loaded. Call initialize() first.");
    }

    try {
      // Update status: Initializing
      this.updateStatus({
        state: AuthFlowState.Initializing,
        message: "Setting up authentication..."
      });

      const redirectPort = this.findAvailablePort();
      const { authUrl, codeVerifier, state } = await this.buildAuthUrl(redirectPort);
      
      // Start local server to handle OAuth redirect
      const authCodePromise = this.startRedirectServer(redirectPort, state);
      
      // Update status: Browser opening
      this.updateStatus({
        state: AuthFlowState.BrowserOpening,
        message: "Opening browser for authentication..."
      });
      
      // Open browser to GitHub OAuth page
      this.openBrowser(authUrl);
      
      // Update status: Waiting for user
      this.updateStatus({
        state: AuthFlowState.WaitingForUser,
        message: "Please complete authentication in your browser...",
        authUrl: authUrl
      });
      
      // Wait for authorization code
      const authCode = await authCodePromise;
      
      // Update status: Processing token
      this.updateStatus({
        state: AuthFlowState.ProcessingToken,
        message: "Processing authentication token..."
      });
      
      // Exchange authorization code for tokens
      const session = await this.exchangeCodeForTokens(authCode, codeVerifier, redirectPort);
      
      // Update status: Success
      this.updateStatus({
        state: AuthFlowState.Success,
        message: `Welcome, ${session.name || session.email}!`
      });
      
      return session;
    } catch (error) {
      // Update status: Error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.updateStatus({
        state: AuthFlowState.Error,
        message: "Authentication failed",
        error: {
          code: 'AUTH_FAILED',
          description: errorMessage
        }
      });
      throw error;
    }
  }

  /**
   * Perform GitHub OAuth2 logout (revoke tokens)
   * 
   * @returns Promise that resolves when logout is complete
   */
  async performLogout(): Promise<void> {
    const session = await this.getCurrentSession();
    if (session?.accessToken) {
      try {
        // Revoke the access token using GitHub's token revocation endpoint
        await fetch(`https://api.github.com/applications/${this.githubConfig?.clientId}/token`, {
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${session.accessToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
      } catch (_error) {
        // Token revocation failed - this is not critical for logout
      }
    }
  }

  /**
   * GitHub Auth uses access token.
   * @param session - The current authentication session
   * @returns - The access token for the backend
   */
  public override getBackendToken(session: AuthSession): string | null {
    return session.accessToken;
  }

  /**
   * Refresh GitHub OAuth2 tokens
   * 
   * Note: GitHub tokens do not expire and do not provide refresh tokens.
   * This method simply returns the existing session.
   * 
   * @param refreshToken The refresh token (unused for GitHub)
   * @returns Promise that resolves to the current authentication session
   */
  protected async performRefresh(refreshToken: string): Promise<AuthSession> {
    const currentSession = await this.getCurrentSession();
    if (!currentSession) {
      throw new Error("No current session available for refresh");
    }
    
    // GitHub tokens don't expire, so we just return the current session
    return currentSession;
  }

  // ================================================
  // Private Implementation
  // ================================================

  /**
   * Update authentication flow status
   * 
   * @param status Current authentication flow status
   */
  private updateStatus(status: AuthFlowStatus): void {
    this.statusCallback?.(status);
  }

  /**
   * Build GitHub OAuth2 authorization URL with PKCE
   * 
   * @param redirectPort The port number for the redirect URI
   * @returns Authorization URL, code verifier, and state parameter
   */
  private async buildAuthUrl(redirectPort: number): Promise<{ authUrl: string; codeVerifier: string; state: string }> {
    if (!this.githubConfig) {
      throw new Error("GitHub configuration not loaded");
    }

    // Generate PKCE code verifier and challenge
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    const state = this.generateRandomString(32);

    const params = new URLSearchParams({
      client_id: this.githubConfig.clientId,
      redirect_uri: `${this.githubConfig.redirectUriBase}:${redirectPort}/auth/github/callback`,
      response_type: 'code',
      scope: this.githubConfig.scopes.join(' '),
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: state,
    });

    const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

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
    const controller = new AbortController();
    
    return new Promise<string>((resolve, reject) => {
      Deno.serve(
        {
          port,
          signal: controller.signal,
          onListen: () => {
            // Server started successfully
          },
        },
        (request) => {
          const {response, authCode, error} = this.handleOAuthCallback(request, expectedState, controller);
          if (authCode) {
            resolve(authCode);  
          } else if (error) {
            // For errors, delay the Promise rejection to match the server shutdown delay
            // This ensures the error page stays open for the full ERROR_DISPLAY_DELAY_MS
            console.log(`GitHub OAuth error occurred: ${error.code} - ${error.description}. Page will close in ${GitHubAuthService.ERROR_DISPLAY_DELAY_MS}ms`);
            setTimeout(() => {
              reject(new Error(`OAuth error: ${error.code} - ${error.description}`));
            }, GitHubAuthService.ERROR_DISPLAY_DELAY_MS);
          } else {
            // For other failures (validation errors), also use the error delay
            console.log(`GitHub OAuth validation failed. Page will close in ${GitHubAuthService.ERROR_DISPLAY_DELAY_MS}ms`);
            setTimeout(() => {
              reject(new Error("Authentication failed or invalid request"));
            }, GitHubAuthService.ERROR_DISPLAY_DELAY_MS);
          }
          // Send response to browser
          return response;
        }
      );
    });
  }

  /**
   * Handle OAuth callback request and process authentication response
   * 
   * @param request The incoming HTTP request
   * @param expectedState Expected state parameter for CSRF protection
   * @param controller AbortController for server shutdown
   * @returns Object containing response, optional authCode, and optional error details
   * @throws Error if OAuth fails or validation fails
   */
  private handleOAuthCallback(
    request: Request,
    expectedState: string,
    controller: AbortController
  ): {response: Response, authCode?: string, error?: {code: string, description: string}} {
    const url = new URL(request.url);
    
    if (url.pathname !== '/auth/github/callback') {
      return {response: new Response("Not Found", { status: 404 })};
    }

    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    // Handle OAuth error responses
    if (error) {
      const errorDescription = url.searchParams.get('error_description') || error;
      
      // Send error response to browser with countdown timer
      const response = new Response(
        this.templateService.generateErrorPage(error, errorDescription),
        { 
          headers: { 'Content-Type': 'text/html' },
          status: 400,
        }
      );
      
      // Use extended delay for error cases to allow users to read the error
      this.scheduleServerShutdown(controller, GitHubAuthService.ERROR_DISPLAY_DELAY_MS);
      return {response, error: {code: error, description: errorDescription}};
    }

    // Validate authorization code and state parameter
    if (!code || state !== expectedState) {
      const errorCode = 'validation_failed';
      const errorDescription = 'Invalid request parameters. This may be due to a security issue or session timeout.';
      
      // Send error response to browser with countdown timer
      const response = new Response(
        this.templateService.generateErrorPage(
          'Authentication Failed',
          errorDescription
        ),
        { 
          headers: { 'Content-Type': 'text/html' },
          status: 400,
        }
      );
      
      // Use extended delay for error cases to allow users to read the error
      this.scheduleServerShutdown(controller, GitHubAuthService.ERROR_DISPLAY_DELAY_MS);
      return {response, error: {code: errorCode, description: errorDescription}};
    }

    // Success case - send success page to browser
    const response = new Response(
      this.templateService.generateSuccessPage(
        'Authentication successful! You can close this window and return to the terminal.'
      ),
      {
        headers: { 'Content-Type': 'text/html' },
        status: 200,
      }
    );
    
    this.scheduleServerShutdown(controller);
    return {response, authCode: code};
  }


  /**
   * Open browser to the authentication URL
   * 
   * @param url URL to open in browser
   * @returns Promise that resolves when browser command is executed
   */
  private openBrowser(url: string): void {
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
    } catch (_error) {
      // Browser failed to open - status will be updated with URL for manual access
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
    if (!this.githubConfig) {
      throw new Error("GitHub configuration not loaded");
    }

    // Use backend endpoint for secure token exchange
    const trpcClient = PublicTrpcClientFactory.create();
    const tokenData = await trpcClient.auth.github.exchangeToken.mutate({
      code: code,
      codeVerifier: codeVerifier,
      redirectUri: `${this.githubConfig.redirectUriBase}:${redirectPort}/auth/github/callback`,
    });

    const userInfo = await this.fetchUserInfo(tokenData.accessToken);

    return {
      accessToken: tokenData.accessToken,
      refreshToken: undefined, // GitHub doesn't provide refresh tokens
      provider: AuthProvider.GitHub,
      providerUserId: userInfo.id.toString(),
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.avatar_url,
      expiresAt: undefined, // GitHub tokens don't expire
    };
  }

  /**
   * Fetch user information from GitHub
   * 
   * @param accessToken Access token to use for API call
   * @returns Promise that resolves to user information
   */
  private async fetchUserInfo(accessToken: string): Promise<{ id: number; email: string; name: string; avatar_url: string }> {
    // Fetch basic user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      },
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to fetch user info: ${userResponse.statusText}`);
    }

    const userInfo = await userResponse.json();

    // GitHub API may not return email in the user endpoint if it's private
    // We need to fetch it from the emails endpoint
    let email = userInfo.email;
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        },
      });

      if (emailResponse.ok) {
        const emails = await emailResponse.json();
        const primaryEmail = emails.find((e: any) => e.primary);
        email = primaryEmail?.email || emails[0]?.email;
      }
    }

    return {
      id: userInfo.id,
      email: email || '',
      name: userInfo.name || userInfo.login,
      avatar_url: userInfo.avatar_url,
    };
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
  
  /**
   * Sanitize HTML content to prevent XSS attacks
   * 
   * @param input Raw input string that may contain HTML
   * @returns Sanitized string safe for HTML output
   */
  private sanitizeHtml(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Schedule the shutdown of the OAuth redirect server with a configurable delay.
   * 
   * This method addresses a critical timing race condition in the OAuth flow where
   * the server might shut down before the HTTP response is fully transmitted to
   * the browser. Without this delay, users may see connection errors or incomplete
   * page renders even though the authentication was successful.
   * 
   * The delay ensures that:
   * 1. The HTTP response (success or error page) is fully transmitted
   * 2. The browser has time to render the page completely
   * 3. The user sees appropriate feedback before the server closes
   * 
   * @param controller AbortController used to shutdown the HTTP server
   * @param delayMs Optional delay in milliseconds (defaults to SERVER_SHUTDOWN_DELAY_MS)
   * @returns Promise that resolves after the delay and server shutdown
   */
  private scheduleServerShutdown(
    controller: AbortController,
    delayMs: number = GitHubAuthService.SERVER_SHUTDOWN_DELAY_MS
  ): Promise<void> {
    console.log(`GitHub OAuth server shutdown scheduled in ${delayMs}ms`);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log(`GitHub OAuth server shutting down after ${delayMs}ms delay`);
        controller.abort();
        resolve();
      }, delayMs);
    });
  }
}