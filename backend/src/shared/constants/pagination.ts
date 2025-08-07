/**
 * Pagination Constants
 * 
 * Shared pagination limits used across multiple domains for consistent
 * pagination behavior throughout the application.
 */

/* ========================================
 * Pagination Limits
 * ======================================== */

export const PAGINATION_LIMITS = {
  MAX_LIMIT: 100,
  DEFAULT_LIMIT: 50,
  MIN_LIMIT: 1,
  MIN_OFFSET: 0,
} as const;

/* ========================================
 * Type Exports for Type Safety
 * ======================================== */

export type PaginationLimits = typeof PAGINATION_LIMITS;
