import { z } from "zod";
import { VALIDATION_LIMITS } from "../../shared/constants/validation-limits.ts";

/**
 * Get Assignees Input Validation Schema
 * 
 * Comprehensive filtering options with pagination support for efficient
 * assignee retrieval and search operations. Uses shared validation limits
 * for consistent pagination and search constraints.
 */

/* ========================================
 * Get Assignees Validation Schema
 * ======================================== */

export const getAssigneesInput = z.object({
  isActive: z.boolean().optional(),
  
  creatorId: z.string().uuid("Invalid creator ID format").optional(),
  
  search: z.string()
    .max(VALIDATION_LIMITS.ASSIGNEE.SEARCH_MAX_LENGTH, `Search term must be ${VALIDATION_LIMITS.ASSIGNEE.SEARCH_MAX_LENGTH} characters or less`)
    .trim()
    .optional(),
    
  limit: z.number()
    .int("Limit must be a whole number")
    .min(VALIDATION_LIMITS.PAGINATION.MIN_LIMIT, `Limit must be at least ${VALIDATION_LIMITS.PAGINATION.MIN_LIMIT}`)
    .max(VALIDATION_LIMITS.PAGINATION.MAX_LIMIT, `Limit cannot exceed ${VALIDATION_LIMITS.PAGINATION.MAX_LIMIT}`)
    .default(VALIDATION_LIMITS.PAGINATION.DEFAULT_LIMIT),
    
  offset: z.number()
    .int("Offset must be a whole number")
    .min(VALIDATION_LIMITS.PAGINATION.MIN_OFFSET, "Offset cannot be negative")
    .default(VALIDATION_LIMITS.PAGINATION.MIN_OFFSET),
});

/* ========================================
 * Type Export
 * ======================================== */

export type GetAssigneesInput = z.infer<typeof getAssigneesInput>;