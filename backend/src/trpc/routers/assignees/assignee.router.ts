import { router } from "../../index.ts";
import { protectedProcedure } from "../../middleware/protectedProcedure.ts";
import { AssigneesService } from "../../../assignees/services/assignees.service.ts";
import {
  createAssigneeInput,
  updateAssigneeInput,
  getAssigneesInput,
  assigneeIdInput,
} from "../../../assignees/validation/index.ts";


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