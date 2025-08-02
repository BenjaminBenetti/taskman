import type { AuthSession } from "../interfaces/auth-session.interface.ts";
import { PublicTrpcClientFactory } from "../../trpc/factory/public-trpc-client.factory.ts";
import { ExternalAuthProvider } from "../../../../backend/src/auth/types/auth-provider.type.ts";
import { AuthServiceFactory } from "../factories/auth-service.factory.ts";
import { BaseAuthService } from "./base-auth.service.ts";

/**
 * Service for managing internal token exchange and refresh operations
 * 
 * This service handles the exchange of external provider tokens (Google, GitHub)
 * for internal JWT tokens, providing a unified authentication mechanism across
 * different identity providers. It includes automatic token refresh and error
 * handling with graceful fallback strategies.
 */
export class InternalTokenService {
  
  // ================================================
  // Public Methods
  // ================================================

  /**
   * Exchange an external provider token for an internal JWT token
   * 
   * @param session The current authentication session containing provider token
   * @returns Promise that resolves to updated session with internal token, or original session on failure
   */
  public async exchangeForInternalToken(session: AuthSession): Promise<AuthSession> {
    
    // Get the appropriate auth service for this provider
    const authService = await AuthServiceFactory.getServiceForProvider(session.provider);
    
    // Get the provider-specific backend token
    const providerToken = (authService as BaseAuthService).getProviderBackendToken(session);
    if (!providerToken) {
      // No suitable token available for exchange, return original session
      return session;
    }

    // Exchange with backend
    const trpcClient = PublicTrpcClientFactory.create();
    const exchangeResult = await trpcClient.auth.internal.exchange.mutate({
      providerToken,
      provider: session.provider as ExternalAuthProvider,
    });

    // Calculate expiration timestamp
    const internalExpiresAt = Math.floor(Date.now() / 1000) + exchangeResult.expiresIn;


    // Return updated session with internal token
    return {
      ...session,
      internalToken: exchangeResult.internalToken,
      internalExpiresAt,
    };
  }

  /**
   * Check if internal token is expired or about to expire
   * 
   * @param session The authentication session to check
   * @param bufferSeconds Optional buffer time in seconds before expiration (default: 300 seconds)
   * @returns True if token is expired or will expire soon, false otherwise
   */
  public isInternalTokenExpired(session: AuthSession, bufferSeconds: number = 300): boolean {
    if (!session.internalToken || !session.internalExpiresAt) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= (session.internalExpiresAt - bufferSeconds);
  }

  /**
   * Refresh internal token if expired or about to expire
   * 
   * @param session The current authentication session
   * @returns Promise that resolves to updated session with fresh internal token, or original session
   */
  public async refreshInternalTokenIfNeeded(session: AuthSession): Promise<AuthSession> {
    if (!this.isInternalTokenExpired(session)) {
      return session;
    }

    // Token is expired or about to expire, exchange for new one
    return await this.exchangeForInternalToken(session);
  }

  /**
   * Remove internal token data from session
   * 
   * @param session The authentication session to clean up
   * @returns Session without internal token data
   */
  public removeInternalToken(session: AuthSession): AuthSession {
    const { internalToken: _internalToken, internalExpiresAt: _internalExpiresAt, ...cleanSession } = session;
    return cleanSession;
  }

}