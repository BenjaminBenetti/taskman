import { z } from "zod";
import { router, publicProcedure } from "../../index.ts";
import { GoogleTokenExchangeService } from "../../../auth/google/services/google-token-exchange.service.ts";

/**
 * Input validation schema for Google token exchange
 */
const googleTokenExchangeInput = z.object({
  code: z.string().min(1, "Authorization code is required"),
  codeVerifier: z.string().min(1, "Code verifier is required"),
  redirectUri: z.string().url("Valid redirect URI is required"),
});

/**
 * Input validation schema for Google token refresh
 */
const googleTokenRefreshInput = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

/**
 * Google authentication router providing OAuth2 token operations
 */
export const googleRouter = router({
  /**
   * Exchange authorization code for access and refresh tokens
   * 
   * This endpoint performs the OAuth2 authorization code exchange with Google's
   * token endpoint, securely handling the client secret on the server side.
   */
  exchangeToken: publicProcedure
    .input(googleTokenExchangeInput)
    .mutation(async ({ input }) => {
      const tokenExchangeService = new GoogleTokenExchangeService();
      return await tokenExchangeService.exchangeCodeForTokens(input);
    }),

  /**
   * Refresh access token using refresh token
   * 
   * This endpoint exchanges a refresh token for a new access token using
   * Google's token endpoint with the required client secret.
   */
  refreshToken: publicProcedure
    .input(googleTokenRefreshInput)
    .mutation(async ({ input }) => {
      const tokenExchangeService = new GoogleTokenExchangeService();
      return await tokenExchangeService.refreshAccessToken(input.refreshToken);
    }),
});