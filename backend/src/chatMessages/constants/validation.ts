/**
 * Chat Message Validation Constants
 * 
 * Domain-specific validation limits for chat message entities.
 * Co-located with chatMessages domain for better maintainability and discoverability.
 */

/* ========================================
 * Chat Message Field Validation Limits
 * ======================================== */

export const CHAT_MESSAGE_VALIDATION = {
  CONTENT_MAX_LENGTH: 10000,
  CONTENT_MIN_LENGTH: 1,
  SEARCH_MAX_LENGTH: 100,
} as const;

/* ========================================
 * Type Exports for Type Safety
 * ======================================== */

export type ChatMessageValidation = typeof CHAT_MESSAGE_VALIDATION;
