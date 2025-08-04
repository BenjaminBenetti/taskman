import { z } from "zod";
import { router } from "../../index.ts";
import { protectedProcedure } from "../../middleware/protectedProcedure.ts";
import { AssigneesService } from "../../../assignees/services/assignees.service.ts";
import { VALIDATION_LIMITS } from "../../../shared/constants/validation-limits.ts";

/* ========================================
 * Validation Schemas
 * ======================================== */

/**
 * Assignee Filters Interface
 *
 * Defines the structure for filtering assignees in search operations.
 * Used by the service layer for type-safe filtering operations.
 */
export interface AssigneeFilters {
  /**
   * Filter by active status
   * - true: Only active assignees
   * - false: Only inactive assignees
   * - undefined: All assignees regardless of status
   */
  isActive?: boolean;

  /**
   * Filter by creator ID
   * Only assignees created by the specified user
   */
  creatorId?: string;

  /**
   * Text search across name, email, and notes fields
   * Case-insensitive search
   */
  search?: string;

  /**
   * Maximum number of results to return
   * Must be between 1 and 100
   */
  limit?: number;

  /**
   * Number of results to skip for pagination
   * Must be 0 or greater
   */
  offset?: number;
}

/**
 * Assignee ID Input Validation Schema
 *
 * Simple validation schema for operations that only require an assignee ID.
 * Ensures the ID is a valid UUID format for data integrity.
 */
const assigneeIdInput = z.object({
  assigneeId: z.string().uuid("Invalid assignee ID format"),
});

/**
 * Create Assignee Input Validation Schema
 *
 * Comprehensive validation schema for creating new assignees with business rules
 * and data integrity constraints. Uses shared validation limits to eliminate
 * magic numbers and maintain consistency.
 */
const createAssigneeInput = z.object({
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

/**
 * Update Assignee Input Validation Schema
 *
 * Flexible validation schema for partial assignee updates with optional fields
 * and business rule enforcement. Uses shared validation limits for consistency.
 */
const updateAssigneeInput = z.object({
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

/**
 * Get Assignees Input Validation Schema
 *
 * Comprehensive filtering options with pagination support for efficient
 * assignee retrieval and search operations. Uses shared validation limits
 * for consistent pagination and search constraints.
 */
const getAssigneesInput = z.object({
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
 * Type Exports
 * ======================================== */

export type AssigneeIdInput = z.infer<typeof assigneeIdInput>;
export type CreateAssigneeInput = z.infer<typeof createAssigneeInput>;
export type UpdateAssigneeInput = z.infer<typeof updateAssigneeInput>;
export type GetAssigneesInput = z.infer<typeof getAssigneesInput>;

/* ========================================
 * Assignee Router Implementation
 * ======================================== */

/**
 * Assignee router providing comprehensive assignee management operations
 * 
 * Implements full CRUD operations with advanced filtering, validation,
 * and business logic enforcement. All endpoints are protected and
 * require authentication.
 * 
 * Features:
 * - Assignee creation with comprehensive validation
 * - Assignee retrieval with filtering and pagination
 * - Assignee updates with business rule enforcement
 * - Assignee deletion (soft delete)
 * - Tenant isolation and security
 */
export const assigneeRouter = router({
  /**
   * Create a new assignee
   * 
   * Creates a new assignee with validation and business rules enforcement.
   * Validates email format, phone number constraints, and notes length.
   * Enforces tenant isolation for secure multi-tenant operation.
   * 
   * @input CreateAssigneeInput - Assignee creation data with validation
   * @returns Assignee - The created assignee with all properties
   * @throws TRPCError - When validation fails or business rules violated
   */
  create: protectedProcedure
    .input(createAssigneeInput)
    .mutation(async ({ input, ctx }) => {
      const assigneesService = new AssigneesService();
      
      return await assigneesService.createAssignee(
        ctx.user,
        input.name,
        input.email,
        input.phone,
        input.notes,
        input.isActive
      );
    }),

  /**
   * Get an assignee by ID
   * 
   * Retrieves a specific assignee by ID with tenant isolation.
   * Includes all assignee properties for complete information display.
   * 
   * @input AssigneeIdInput - Assignee ID with validation
   * @returns Assignee | null - The assignee if found, null otherwise
   * @throws TRPCError - When assignee ID is invalid
   */
  get: protectedProcedure
    .input(assigneeIdInput)
    .query(async ({ input, ctx }) => {
      const assigneesService = new AssigneesService();
      
      return await assigneesService.getAssigneeById(ctx.user, input.assigneeId);
    }),

  /**
   * Get assignees with filtering and pagination
   * 
   * Retrieves assignees within the user's tenant with comprehensive
   * filtering capabilities. Supports active status, creator, and text 
   * search filtering across name, email, and notes with pagination.
   * 
   * @input GetAssigneesInput - Filter criteria and pagination options
   * @returns Assignee[] - Array of assignees matching filter criteria
   * @throws TRPCError - When filter parameters are invalid
   */
  search: protectedProcedure
    .input(getAssigneesInput)
    .query(async ({ input, ctx }) => {
      const assigneesService = new AssigneesService();
      
      return await assigneesService.getAssigneesByTenant(ctx.user, input);
    }),

  /**
   * Update an assignee
   * 
   * Updates an existing assignee with validation and business rules.
   * Supports partial updates and enforces email format validation,
   * phone number constraints, and notes length limits.
   * 
   * @input UpdateAssigneeInput - Partial assignee data with validation
   * @returns Assignee - The updated assignee with all properties
   * @throws TRPCError - When validation fails or business rules violated
   */
  update: protectedProcedure
    .input(updateAssigneeInput)
    .mutation(async ({ input, ctx }) => {
      const assigneesService = new AssigneesService();
      
      const { assigneeId, ...updateData } = input;
      
      return await assigneesService.updateAssignee(
        ctx.user,
        assigneeId,
        updateData
      );
    }),

  /**
   * Delete an assignee (soft delete)
   * 
   * Performs a soft delete on the specified assignee within the user's tenant.
   * The assignee is marked as deleted but remains in the database for
   * audit purposes and potential recovery.
   * 
   * @input AssigneeIdInput - Assignee ID with validation
   * @returns void
   * @throws TRPCError - When assignee not found or already deleted
   */
  delete: protectedProcedure
    .input(assigneeIdInput)
    .mutation(async ({ input, ctx }) => {
      const assigneesService = new AssigneesService();
      
      await assigneesService.deleteAssignee(ctx.user, input.assigneeId);
    }),

});