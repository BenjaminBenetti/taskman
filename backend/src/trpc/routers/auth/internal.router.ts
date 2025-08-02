import { z } from "zod";
import { router } from "../../index.ts";
import { publicProcedure } from "../../middleware/publicProcedure.ts";
import { InternalTokenExchangeService } from "../../../auth/services/internal-token-exchange.service.ts";
import type { ExternalAuthProvider } from "../../../auth/types/auth-provider.type.ts";

/**
 * Zod schema for external auth provider validation
 * Derived from the centralized ExternalAuthProvider type
 */
const externalAuthProviderSchema = z.enum(["google", "github"]) satisfies z.ZodType<ExternalAuthProvider>;

/**
 * Input validation schema for external token exchange
 */
const externalTokenExchangeInput = z.object({
  providerToken: z.string().min(1, "Provider token is required"),
  provider: externalAuthProviderSchema,
});

/**
 * Output validation schema for token exchange result
 */
const tokenExchangeOutput = z.object({
  internalToken: z.string(),
  expiresIn: z.number().int().positive(),
});

/**
 * Internal authentication router providing token exchange operations
 * 
 * This router handles the exchange of external provider tokens (Google, GitHub)
 * for internal JWT tokens, enabling unified authentication across different
 * identity providers.
 */
export const internalRouter = router({
  /**
   * Exchange external provider token for internal JWT token
   * 
   * This endpoint validates an external provider token, creates/updates the user,
   * and returns an internal JWT token for authenticated API access. This enables
   * clients to authenticate once with their preferred provider and receive a 
   * unified internal token for all subsequent API calls.
   */
  exchange: publicProcedure
    .input(externalTokenExchangeInput)
    .output(tokenExchangeOutput)
    .mutation(async ({ input }) => {
      const tokenExchangeService = new InternalTokenExchangeService();
      return await tokenExchangeService.exchangeToken(
        input.providerToken,
        input.provider
      );
    }),
});