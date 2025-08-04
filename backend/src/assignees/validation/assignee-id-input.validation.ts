import { z } from "zod";

/**
 * Assignee ID Input Validation Schema
 * 
 * Simple validation schema for operations that only require an assignee ID.
 * Ensures the ID is a valid UUID format for data integrity.
 */

/* ========================================
 * Assignee ID Validation Schema
 * ======================================== */

export const assigneeIdInput = z.object({
  assigneeId: z.string().uuid("Invalid assignee ID format"),
});

/* ========================================
 * Type Export
 * ======================================== */

export type AssigneeIdInput = z.infer<typeof assigneeIdInput>;