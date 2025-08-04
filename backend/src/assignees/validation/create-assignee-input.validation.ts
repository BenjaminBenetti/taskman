import { z } from "zod";
import { VALIDATION_LIMITS } from "../../shared/constants/validation-limits.ts";

/**
 * Create Assignee Input Validation Schema
 * 
 * Comprehensive validation schema for creating new assignees with business rules
 * and data integrity constraints. Uses shared validation limits to eliminate
 * magic numbers and maintain consistency.
 */

/* ========================================
 * Create Assignee Validation Schema
 * ======================================== */

export const createAssigneeInput = z.object({
  name: z.string()
    .min(1, "Assignee name is required")
    .max(VALIDATION_LIMITS.ASSIGNEE.NAME_MAX_LENGTH, `Assignee name must be ${VALIDATION_LIMITS.ASSIGNEE.NAME_MAX_LENGTH} characters or less`)
    .trim(),
    
  email: z.string()
    .email("Invalid email format")
    .optional()
    .transform(val => val || null),
    
  phone: z.string()
    .max(VALIDATION_LIMITS.ASSIGNEE.PHONE_MAX_LENGTH, `Phone number must be ${VALIDATION_LIMITS.ASSIGNEE.PHONE_MAX_LENGTH} characters or less`)
    .optional()
    .transform(val => val || null),
    
  notes: z.string()
    .max(VALIDATION_LIMITS.ASSIGNEE.NOTES_MAX_LENGTH, `Notes must be ${VALIDATION_LIMITS.ASSIGNEE.NOTES_MAX_LENGTH} characters or less`)
    .optional()
    .transform(val => val || null),
    
  isActive: z.boolean().default(true),
});

/* ========================================
 * Type Export
 * ======================================== */

export type CreateAssigneeInput = z.infer<typeof createAssigneeInput>;