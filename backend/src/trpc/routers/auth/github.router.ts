import { z } from "zod";
import { router, publicProcedure } from "../../index.ts";
import { GitHubTokenExchangeService } from "../../../auth/github/services/github-token-exchange.service.ts";

/**
 * Input validation schema for GitHub token exchange
 */
const githubTokenExchangeInput = z.object({
  code: z.string().min(1, "Authorization code is required"),
  codeVerifier: z.string().min(1, "Code verifier is required"),
  redirectUri: z.url("Valid redirect URI is required"),
});

/**
 * GitHub authentication router providing OAuth2 token operations
 */
export const githubRouter = router({
  /**
   * Exchange authorization code for access token
   * 
   * This endpoint performs the OAuth2 authorization code exchange with GitHub's
   * token endpoint, securely handling the client secret on the server side.
   * Note: GitHub tokens do not expire and do not provide refresh tokens.
   */
  exchangeToken: publicProcedure
    .input(githubTokenExchangeInput)
    .mutation(async ({ input }) => {
      const tokenExchangeService = new GitHubTokenExchangeService();
      return await tokenExchangeService.exchangeCodeForTokens(input);
    }),
});