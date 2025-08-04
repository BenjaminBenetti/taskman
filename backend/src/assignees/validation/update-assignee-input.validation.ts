import { z } from "zod";
import { VALIDATION_LIMITS } from "../../shared/constants/validation-limits.ts";

/**
 * Update Assignee Input Validation Schema
 * 
 * Flexible validation schema for partial assignee updates with optional fields
 * and business rule enforcement. Uses shared validation limits for consistency.
 */

/* ========================================
 * Update Assignee Validation Schema
 * ======================================== */

export const updateAssigneeInput = z.object({
  assigneeId: z.string().uuid("Invalid assignee ID format"),
  
  name: z.string()
    .min(1, "Assignee name cannot be empty")
    .max(VALIDATION_LIMITS.ASSIGNEE.NAME_MAX_LENGTH, `Assignee name must be ${VALIDATION_LIMITS.ASSIGNEE.NAME_MAX_LENGTH} characters or less`)
    .trim()
    .optional(),
    
  email: z.string()
    .email("Invalid email format")
    .nullish()
    .transform(val => val === undefined ? undefined : val || null),
    
  phone: z.string()
    .max(VALIDATION_LIMITS.ASSIGNEE.PHONE_MAX_LENGTH, `Phone number must be ${VALIDATION_LIMITS.ASSIGNEE.PHONE_MAX_LENGTH} characters or less`)
    .nullish()
    .transform(val => val === undefined ? undefined : val || null),
    
  notes: z.string()
    .max(VALIDATION_LIMITS.ASSIGNEE.NOTES_MAX_LENGTH, `Notes must be ${VALIDATION_LIMITS.ASSIGNEE.NOTES_MAX_LENGTH} characters or less`)
    .nullish()
    .transform(val => val === undefined ? undefined : val || null),
    
  isActive: z.boolean().optional(),
});

/* ========================================
 * Type Export
 * ======================================== */

export type UpdateAssigneeInput = z.infer<typeof updateAssigneeInput>;