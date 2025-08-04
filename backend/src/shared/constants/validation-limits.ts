/**
 * Validation Limits Constants
 * 
 * Centralized validation limits for consistent data constraints across the application.
 * This eliminates magic numbers and provides a single source of truth for validation rules.
 */

/* ========================================
 * Assignee Validation Limits
 * ======================================== */

export const VALIDATION_LIMITS = {
  ASSIGNEE: {
    NAME_MAX_LENGTH: 255,
    PHONE_MAX_LENGTH: 50,
    NOTES_MAX_LENGTH: 1000,
    SEARCH_MAX_LENGTH: 100,
  },
  
  /* ========================================
   * Pagination Limits
   * ======================================== */
  
  PAGINATION: {
    MAX_LIMIT: 100,
    DEFAULT_LIMIT: 50,
    MIN_LIMIT: 1,
    MIN_OFFSET: 0,
  },
} as const;

/* ========================================
 * Type Exports for Type Safety
 * ======================================== */

export type ValidationLimits = typeof VALIDATION_LIMITS;