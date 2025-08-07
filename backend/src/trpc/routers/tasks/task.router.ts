import { z } from "zod";
import { router } from "../../index.ts";
import { protectedProcedure } from "../../middleware/protectedProcedure.ts";
import { TasksService } from "../../../tasks/services/tasks.service.ts";
import { TaskStatus, Priority } from "../../../generated/prisma/enums.ts";
import { PAGINATION_LIMITS } from "../../../shared/constants/pagination.ts";
import { TASK_VALIDATION } from "../../../tasks/constants/validation.ts";

/* ========================================
 * Validation Schemas
 * ======================================== */

/**
 * Task Status Enum Validation
 * 
 * Validates task status values against the allowed enum values.
 */
const taskStatusSchema = z.nativeEnum(TaskStatus);

/**
 * Priority Enum Validation
 * 
 * Validates priority values against the allowed enum values.
 */
const prioritySchema = z.nativeEnum(Priority);

/**
 * Input validation schema for task creation
 * 
 * Comprehensive validation for creating new tasks with business rules
 * and data integrity constraints.
 */
const createTaskInput = z.object({
  title: z.string()
    .min(1, "Task title is required")
    .max(TASK_VALIDATION.TITLE_MAX_LENGTH, `Task title must be ${TASK_VALIDATION.TITLE_MAX_LENGTH} characters or less`)
    .trim(),
  description: z.string()
    .max(TASK_VALIDATION.DESCRIPTION_MAX_LENGTH, `Description must be ${TASK_VALIDATION.DESCRIPTION_MAX_LENGTH} characters or less`)
    .optional()
    .transform(val => val || null),
  status: taskStatusSchema.default(TaskStatus.PENDING),
  priority: prioritySchema.default(Priority.MEDIUM),
  assigneeId: z.string()
    .uuid("Invalid assignee ID format")
    .optional()
    .transform(val => val || null),
  remindAt: z.coerce.date()
    .refine(date => date > new Date(), "Reminder date must be in the future")
    .optional()
    .transform(val => val || null),
  remindIntervalMinutes: z.number()
    .int("Reminder interval must be a whole number")
    .min(1, "Reminder interval must be at least 1 minute")
    .max(10080, "Reminder interval cannot exceed 1 week (10080 minutes)")
    .optional()
    .transform(val => val || null),
});

/**
 * Input validation schema for task updates
 * 
 * Flexible validation for partial task updates with optional fields
 * and business rule enforcement.
 */
const updateTaskInput = z.object({
  taskId: z.string().uuid("Invalid task ID format"),
  title: z.string()
    .min(1, "Task title cannot be empty")
    .max(TASK_VALIDATION.TITLE_MAX_LENGTH, `Task title must be ${TASK_VALIDATION.TITLE_MAX_LENGTH} characters or less`)
    .trim()
    .optional(),
  description: z.string()
    .max(TASK_VALIDATION.DESCRIPTION_MAX_LENGTH, `Description must be ${TASK_VALIDATION.DESCRIPTION_MAX_LENGTH} characters or less`)
    .nullish()
    .transform(val => val === undefined ? undefined : val || null),
  status: taskStatusSchema.optional(),
  priority: prioritySchema.optional(),
  assigneeId: z.string()
    .uuid("Invalid assignee ID format")
    .nullish()
    .transform(val => val === undefined ? undefined : val || null),
  remindAt: z.coerce.date()
    .refine(date => date > new Date(), "Reminder date must be in the future")
    .nullish()
    .transform(val => val === undefined ? undefined : val || null),
  remindIntervalMinutes: z.number()
    .int("Reminder interval must be a whole number")
    .min(1, "Reminder interval must be at least 1 minute")
    .max(10080, "Reminder interval cannot exceed 1 week (10080 minutes)")
    .nullish()
    .transform(val => val === undefined ? undefined : val || null),
});

/**
 * Input validation schema for task filtering and querying
 * 
 * Comprehensive filtering options with pagination support for
 * efficient task retrieval and search operations.
 */
const getTasksInput = z.object({
  status: taskStatusSchema.optional(),
  priority: prioritySchema.optional(),
  assigneeId: z.string().uuid("Invalid assignee ID format").optional(),
  creatorId: z.string().uuid("Invalid creator ID format").optional(),
  dueBefore: z.coerce.date().optional(),
  search: z.string()
    .max(TASK_VALIDATION.SEARCH_MAX_LENGTH, `Search term must be ${TASK_VALIDATION.SEARCH_MAX_LENGTH} characters or less`)
    .trim()
    .optional(),
  limit: z.number()
    .int("Limit must be a whole number")
    .min(PAGINATION_LIMITS.MIN_LIMIT, `Limit must be at least ${PAGINATION_LIMITS.MIN_LIMIT}`)
    .max(PAGINATION_LIMITS.MAX_LIMIT, `Limit cannot exceed ${PAGINATION_LIMITS.MAX_LIMIT}`)
    .default(PAGINATION_LIMITS.DEFAULT_LIMIT),
  offset: z.number()
    .int("Offset must be a whole number")
    .min(PAGINATION_LIMITS.MIN_OFFSET, "Offset cannot be negative")
    .default(PAGINATION_LIMITS.MIN_OFFSET),
});

/**
 * Input validation schema for task ID operations
 * 
 * Simple validation for operations that only require a task ID.
 */
const taskIdInput = z.object({
  taskId: z.string().uuid("Invalid task ID format"),
});


/* ========================================
 * Task Router Implementation
 * ======================================== */

/**
 * Task router providing comprehensive task management operations
 * 
 * Implements full CRUD operations with advanced filtering, validation,
 * and business logic enforcement. All endpoints are protected and
 * require authentication.
 * 
 * Features:
 * - Task creation with comprehensive validation
 * - Task retrieval with filtering and pagination
 * - Task updates with business rule enforcement
 * - Task deletion (soft delete)
 * - Tenant isolation and security
 */
export const taskRouter = router({
  /**
   * Create a new task
   * 
   * Creates a new task with validation and business rules enforcement.
   * Validates assignee relationships, reminder settings, and enforces
   * tenant isolation for secure multi-tenant operation.
   * 
   * @input CreateTaskInput - Task creation data with validation
   * @returns Task - The created task with all relationships
   * @throws TRPCError - When validation fails or business rules violated
   */
  create: protectedProcedure
    .input(createTaskInput)
    .mutation(async ({ input, ctx }) => {
      const tasksService = new TasksService();
      
      return await tasksService.createTask(
        ctx.user,
        input.title,
        input.description,
        input.status,
        input.priority,
        input.assigneeId,
        input.remindAt,
        input.remindIntervalMinutes
      );
    }),

  /**
   * Get a task by ID
   * 
   * Retrieves a specific task by ID with tenant isolation.
   * Includes all relationship data (creator, assignee, message count)
   * for complete task information display.
   * 
   * @input TaskIdInput - Task ID with validation
   * @returns Task | null - The task if found, null otherwise
   * @throws TRPCError - When task ID is invalid
   */
  getById: protectedProcedure
    .input(taskIdInput)
    .query(async ({ input, ctx }) => {
      const tasksService = new TasksService();
      
      return await tasksService.getTaskById(ctx.user, input.taskId);
    }),

  /**
   * Get tasks with filtering and pagination
   * 
   * Retrieves tasks within the user's tenant with comprehensive
   * filtering capabilities. Supports status, priority, assignee,
   * creator, due date, and text search filtering with pagination.
   * 
   * @input GetTasksInput - Filter criteria and pagination options
   * @returns Task[] - Array of tasks matching filter criteria
   * @throws TRPCError - When filter parameters are invalid
   */
  search: protectedProcedure
    .input(getTasksInput)
    .query(async ({ input, ctx }) => {
      const tasksService = new TasksService();
      
      return await tasksService.getTasksByTenant(ctx.user, input);
    }),

  /**
   * Update a task
   * 
   * Updates an existing task with validation and business rules.
   * Supports partial updates and enforces status transition rules,
   * assignee validation, and reminder constraints.
   * 
   * @input UpdateTaskInput - Partial task data with validation
   * @returns Task - The updated task with all relationships
   * @throws TRPCError - When validation fails or business rules violated
   */
  update: protectedProcedure
    .input(updateTaskInput)
    .mutation(async ({ input, ctx }) => {
      const tasksService = new TasksService();
      
      const { taskId, ...updateData } = input;
      
      return await tasksService.updateTask(
        ctx.user,
        taskId,
        updateData
      );
    }),

  /**
   * Delete a task (soft delete)
   * 
   * Performs a soft delete on the specified task within the user's tenant.
   * The task is marked as deleted but remains in the database for
   * audit purposes and potential recovery.
   * 
   * @input TaskIdInput - Task ID with validation
   * @returns void
   * @throws TRPCError - When task not found or already deleted
   */
  delete: protectedProcedure
    .input(taskIdInput)
    .mutation(async ({ input, ctx }) => {
      const tasksService = new TasksService();
      
      await tasksService.deleteTask(ctx.user, input.taskId);
    }),

});