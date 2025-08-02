/**
 * LogEntry interface for TRPC logging middleware
 * 
 * Represents a structured log entry in nginx-style format containing
 * request metadata, response information, and timing data.
 */
export interface LogEntry {
  /** Client IP address (from headers or socket) */
  ip: string;
  
  /** User identifier (email or "-" for anonymous) */
  user: string;
  
  /** Formatted timestamp in nginx format [DD/MMM/YYYY:HH:MM:SS +0000] */
  timestamp: string;
  
  /** HTTP method equivalent (GET, POST, etc.) */
  method: string;
  
  /** Full request path including /trpc prefix */
  path: string;
  
  /** HTTP status code */
  status: number;
  
  /** Approximate response size in bytes */
  responseSize: number;
  
  /** Referer header value or "-" */
  referer: string;
  
  /** User-Agent header value or "-" */
  userAgent: string;
  
  /** Response time in milliseconds */
  responseTime: number;
  
  /** Optional tenant ID for multi-tenant logging */
  tenantId?: string;
}