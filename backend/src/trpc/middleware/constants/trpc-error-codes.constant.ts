/**
 * TRPC Error Code to HTTP Status Code Mapping
 * 
 * Maps TRPC error codes to their corresponding HTTP status codes
 * for consistent logging and error reporting.
 * 
 * Based on TRPC's error handling specifications and HTTP status code standards.
 */
export const TRPC_ERROR_CODE_TO_HTTP_STATUS: Record<string, number> = {
  /** Malformed request syntax */
  PARSE_ERROR: 400,
  
  /** Generic client error */
  BAD_REQUEST: 400,
  
  /** Authentication required */
  UNAUTHORIZED: 401,
  
  /** Access denied */
  FORBIDDEN: 403,
  
  /** Resource not found */
  NOT_FOUND: 404,
  
  /** HTTP method not allowed */
  METHOD_NOT_SUPPORTED: 405,
  
  /** Request timeout */
  TIMEOUT: 408,
  
  /** Resource conflict */
  CONFLICT: 409,
  
  /** Precondition failed */
  PRECONDITION_FAILED: 412,
  
  /** Request entity too large */
  PAYLOAD_TOO_LARGE: 413,
  
  /** Semantic errors in request */
  UNPROCESSABLE_CONTENT: 422,
  
  /** Rate limit exceeded */
  TOO_MANY_REQUESTS: 429,
  
  /** Client closed connection */
  CLIENT_CLOSED_REQUEST: 499,
  
  /** Server error (default fallback) */
  INTERNAL_SERVER_ERROR: 500,
} as const;