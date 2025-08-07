/**
 * Task Validation Constants
 * 
 * Domain-specific validation limits for task entities.
 * Co-located with tasks domain for better maintainability and discoverability.
 */

/* ========================================
 * Task Field Validation Limits
 * ======================================== */

export const TASK_VALIDATION = {
  TITLE_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 2000,
  SEARCH_MAX_LENGTH: 100,
} as const;

/* ========================================
 * Type Exports for Type Safety
 * ======================================== */

export type TaskValidation = typeof TASK_VALIDATION;
