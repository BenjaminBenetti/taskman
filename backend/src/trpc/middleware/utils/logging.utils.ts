import type { Context } from "../../context.ts";
import type { LogEntry } from "../interfaces/log-entry.interface.ts";

/* ========================================
 * Response Size Configuration
 * ======================================== */

/** Maximum response size for serialization to prevent memory issues */
const MAX_RESPONSE_SIZE_BYTES = 1024 * 1024; // 1MB

/* ========================================
 * Request Metadata Extraction
 * ======================================== */

/**
 * Extracts client IP address from request headers or connection
 * 
 * Checks x-forwarded-for, x-real-ip headers first (for proxy scenarios),
 * then falls back to direct connection remote address
 * 
 * @param ctx - TRPC context containing request information
 * @returns The client IP address or "unknown" if not determinable
 */
export function extractClientIp(ctx: Context): string {
  const { req } = ctx;
  
  // Check proxy headers first
  const forwardedFor = getHeader(req, "x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = getHeader(req, "x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fall back to direct connection
  const socket = req.socket;
  return socket.remoteAddress || "unknown";
}

/**
 * Gets a header value from the request (case-insensitive)
 * 
 * @param req - IncomingMessage request object
 * @param headerName - Name of the header to retrieve
 * @returns Header value or undefined if not found
 */
export function getHeader(req: Context["req"], headerName: string): string | undefined {
  const value = req.headers[headerName.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Extracts basic request metadata from TRPC context
 * 
 * @param ctx - TRPC context
 * @param path - TRPC procedure path
 * @param type - TRPC procedure type
 * @returns Object containing extracted request metadata
 */
export function extractRequestMetadata(ctx: Context, path: string, type: string) {
  return {
    ip: extractClientIp(ctx),
    user: ctx.user?.email || "-",
    tenantId: ctx.user?.tenantId,
    referer: getHeader(ctx.req, "referer") || "-",
    userAgent: getHeader(ctx.req, "user-agent") || "-",
    method: type.toUpperCase(),
    fullPath: `/trpc/${path}`,
  };
}

/* ========================================
 * Timing Management
 * ======================================== */

/**
 * Creates a timing manager for tracking request duration
 * 
 * @returns Object with methods to start timing and calculate elapsed time
 */
export function createTimingManager() {
  const startTime = Date.now();
  
  return {
    startTime,
    getElapsedTime: () => Date.now() - startTime,
  };
}

/* ========================================
 * Response Processing
 * ======================================== */

/**
 * Calculates approximate response size for logging with safety limits
 * 
 * Provides a rough estimate of response size by serializing to JSON
 * and measuring byte length. Includes size limits to prevent memory issues.
 * 
 * @param data - Response data to measure
 * @returns Approximate size in bytes (0 if serialization fails or exceeds limit)
 */
export function calculateResponseSize(data: unknown): number {
  try {
    const serialized = JSON.stringify(data);
    
    // Safety check to prevent memory issues with large responses
    if (serialized.length > MAX_RESPONSE_SIZE_BYTES) {
      console.warn(`Response size (${serialized.length} bytes) exceeds limit (${MAX_RESPONSE_SIZE_BYTES} bytes), logging as 0`);
      return 0;
    }
    
    return serialized.length;
  } catch (error) {
    // Log serialization errors for debugging, but don't fail the request
    console.warn("Failed to calculate response size:", error instanceof Error ? error.message : "Unknown error");
    return 0;
  }
}

/* ========================================
 * Log Entry Factory Functions (DRY Elimination)
 * ======================================== */

/**
 * Base log entry factory that creates common log entry structure
 * 
 * This eliminates duplication between success and error paths
 * 
 * @param metadata - Request metadata
 * @param timestamp - Formatted timestamp
 * @param responseTime - Response time in milliseconds
 * @returns Base log entry with common fields
 */
function createBaseLogEntry(
  metadata: ReturnType<typeof extractRequestMetadata>,
  timestamp: string,
  responseTime: number
): Omit<LogEntry, "status" | "responseSize"> {
  return {
    ip: metadata.ip,
    user: metadata.user,
    timestamp,
    method: metadata.method,
    path: metadata.fullPath,
    referer: metadata.referer,
    userAgent: metadata.userAgent,
    responseTime,
    tenantId: metadata.tenantId,
  };
}

/**
 * Creates a log entry for successful requests
 * 
 * @param metadata - Request metadata
 * @param timestamp - Formatted timestamp
 * @param responseTime - Response time in milliseconds
 * @param result - Success response data
 * @returns Complete log entry for successful request
 */
export function createSuccessLogEntry(
  metadata: ReturnType<typeof extractRequestMetadata>,
  timestamp: string,
  responseTime: number,
  result: unknown
): LogEntry {
  return {
    ...createBaseLogEntry(metadata, timestamp, responseTime),
    status: 200,
    responseSize: calculateResponseSize(result),
  };
}

/**
 * Creates a log entry for error requests
 * 
 * @param metadata - Request metadata
 * @param timestamp - Formatted timestamp
 * @param responseTime - Response time in milliseconds
 * @param status - HTTP status code
 * @param errorData - Error response data
 * @returns Complete log entry for error request
 */
export function createErrorLogEntry(
  metadata: ReturnType<typeof extractRequestMetadata>,
  timestamp: string,
  responseTime: number,
  status: number,
  errorData: unknown
): LogEntry {
  return {
    ...createBaseLogEntry(metadata, timestamp, responseTime),
    status,
    responseSize: calculateResponseSize(errorData),
  };
}

/* ========================================
 * Timestamp Formatting
 * ======================================== */

/**
 * Formats timestamp in nginx log format
 * 
 * Format: [02/Aug/2025:10:30:45 +0000]
 * 
 * @param date - Date object to format
 * @returns Formatted timestamp string with brackets
 */
export function formatNginxTimestamp(date: Date): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hour = date.getUTCHours().toString().padStart(2, "0");
  const minute = date.getUTCMinutes().toString().padStart(2, "0");
  const second = date.getUTCSeconds().toString().padStart(2, "0");

  return `[${day}/${month}/${year}:${hour}:${minute}:${second} +0000]`;
}

/* ========================================
 * Log Output
 * ======================================== */

/**
 * Writes log entry to stdout in nginx format
 * 
 * Format: IP - user [timestamp] "METHOD path HTTP/1.1" status response_size "referer" "user-agent" response_time_ms tenant:tenant_id
 * 
 * @param entry - Log entry data to format and write
 */
export function writeLogEntry(entry: LogEntry): void {
  const tenantInfo = entry.tenantId ? ` tenant:${entry.tenantId}` : "";
  
  const logLine = `${entry.ip} - ${entry.user} ${entry.timestamp} "${entry.method} ${entry.path} HTTP/1.1" ${entry.status} ${entry.responseSize} "${entry.referer}" "${entry.userAgent}" ${entry.responseTime}ms${tenantInfo}`;
  
  console.log(logLine);
}

/**
 * Writes error details to stderr with full stack trace
 * 
 * This function provides detailed error logging including stack traces
 * for debugging purposes, separate from the nginx-style access logs.
 * 
 * @param error - The error object to log
 * @param context - Additional context about where the error occurred
 */
export function writeErrorLog(error: unknown, context: {
  path?: string;
  type?: string;
  user?: string;
  tenantId?: string;
}): void {
  const timestamp = new Date().toISOString();
  const message = error instanceof Error ? error.message : "Unknown error";
  const stack = error instanceof Error ? error.stack : undefined;
  
  // Format context information
  const contextInfo = [
    `Path: ${context.path || "unknown"}`,
    `Type: ${context.type || "unknown"}`,
    `User: ${context.user || "anonymous"}`,
    context.tenantId ? `Tenant: ${context.tenantId}` : null
  ].filter(Boolean).join(" | ");
  
  // Build complete error message as single string
  const errorOutput = [
    `\n=== TRPC ERROR [${timestamp}] ===`,
    `Message: ${message}`,
    `Context: ${contextInfo}`,
    stack ? `Stack Trace:\n${stack}` : null,
    `=== END ERROR ===\n`
  ].filter(Boolean).join("\n");
  
  // Log as single atomic operation
  console.error(errorOutput);
}