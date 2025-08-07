/**
 * Assignee Validation Constants
 * 
 * Domain-specific validation limits for assignee entities.
 * Co-located with assignee domain for better maintainability and discoverability.
 */

/* ========================================
 * Assignee Field Validation Limits
 * ======================================== */

export const ASSIGNEE_VALIDATION = {
  NAME_MAX_LENGTH: 255,
  PHONE_MAX_LENGTH: 50,
  NOTES_MAX_LENGTH: 1000,
  SEARCH_MAX_LENGTH: 100,
} as const;

/* ========================================
 * Type Exports for Type Safety
 * ======================================== */

export type AssigneeValidation = typeof ASSIGNEE_VALIDATION;
