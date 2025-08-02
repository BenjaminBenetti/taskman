import { TRPCError } from "@trpc/server";
import { trpcContext } from "../index.ts";
import { TRPC_ERROR_CODE_TO_HTTP_STATUS } from "./constants/trpc-error-codes.constant.ts";
import {
  extractRequestMetadata,
  createTimingManager,
  formatNginxTimestamp,
  createSuccessLogEntry,
  createErrorLogEntry,
  writeLogEntry,
} from "./utils/logging.utils.ts";

/* ========================================
 * Logging Middleware
 * ======================================== */

/**
 * TRPC logging middleware that logs requests in nginx-style format
 * 
 * Log format: IP - user [timestamp] "METHOD path HTTP/1.1" status response_size "referer" "user-agent" response_time_ms tenant:tenant_id
 * 
 * Example output:
 * 127.0.0.1 - john.doe@example.com [02/Aug/2025:10:30:45 +0000] "POST /trpc/auth.google.exchangeToken HTTP/1.1" 200 156 "-" "trpc-client/1.0" 45ms tenant:abc123
 */
export const loggingMiddleware = trpcContext.middleware((opts) => {
  const { ctx, path, type } = opts;
  
  // Extract request metadata once
  const requestMetadata = extractRequestMetadata(ctx, path, type);
  
  // Initialize timing manager
  const timing = createTimingManager();

  return (async () => {
    try {
      /* ========================================
       * Execute Procedure
       * ======================================== */
      
      const result = await opts.next({ ctx });

      /* ========================================
       * Log Successful Request
       * ======================================== */
      
      const logEntry = createSuccessLogEntry(
        requestMetadata,
        formatNginxTimestamp(new Date()),
        timing.getElapsedTime(),
        result
      );

      writeLogEntry(logEntry);

      return result;
    } catch (error) {
      /* ========================================
       * Handle and Log Errors
       * ======================================== */
      
      const { status, errorData } = processError(error);

      const logEntry = createErrorLogEntry(
        requestMetadata,
        formatNginxTimestamp(new Date()),
        timing.getElapsedTime(),
        status,
        errorData
      );

      writeLogEntry(logEntry);

      // Re-throw the error to maintain TRPC error handling
      throw error;
    }
  })();
});

/* ========================================
 * Error Processing
 * ======================================== */

/**
 * Processes errors to determine HTTP status code and response data
 * 
 * Follows single responsibility principle by handling only error processing logic
 * 
 * @param error - The error to process
 * @returns Object containing status code and error data for logging
 */
function processError(error: unknown): { status: number; errorData: unknown } {
  if (error instanceof TRPCError) {
    return {
      status: TRPC_ERROR_CODE_TO_HTTP_STATUS[error.code] || 500,
      errorData: { error: error.message },
    };
  }
  
  if (error instanceof Error) {
    return {
      status: 500,
      errorData: { error: error.message },
    };
  }

  return {
    status: 500,
    errorData: { error: "Unknown error" },
  };
}

