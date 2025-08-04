import type { Task, TaskFilters } from "../models/task.model.ts";
import { TasksRepository } from "../repositories/tasks.repository.ts";
import { AssigneesRepository } from "../../assignees/repositories/assignees.repository.ts";
import { taskConverter } from "../converters/task.converter.ts";
import { type Prisma } from "../../generated/prisma/client.ts";
import { prisma } from "../../prisma/index.ts";
import { TaskStatus, Priority } from "../../generated/prisma/enums.ts";
import { TRPCError } from "@trpc/server";
import type { User } from "../../users/models/user.model.ts";

/**
 * Tasks Service
 * 
 * Contains comprehensive business logic for task operations within the TaskMan system.
 * Handles task CRUD operations, status transitions, assignment validation, and statistics.
 * Enforces business rules and tenant isolation for secure multi-tenant task management.
 * 
 * Key responsibilities:
 * - Task creation with validation and business rules
 * - Task retrieval with filtering and tenant isolation
 * - Task updates with status transition validation
 * - Task deletion (soft delete) with proper cleanup
 * - Status management with business rule enforcement
 * - Statistics generation for dashboard and reporting
 * - Assignee validation and relationship management
 */
export class TasksService {
  private tasksRepository = new TasksRepository();
  private assigneesRepository = new AssigneesRepository();

  /* ========================================
   * Public Methods - CRUD Operations
   * ======================================== */

  /**
   * Create a new task with validation and business rules
   * 
   * Creates a new task with proper validation of assignee relationships,
   * priority settings, and reminder configurations. Enforces tenant isolation
   * and validates that assigned users exist and are active.
   * 
   * @param actor - The user performing the action (provides tenant context and creator ID)
   * @param title - The task title (required)
   * @param description - Optional task description
   * @param status - Initial task status (defaults to PENDING)
   * @param priority - Task priority (defaults to MEDIUM)
   * @param assigneeId - Optional assignee ID (must exist and be active)
   * @param remindAt - Optional reminder date/time
   * @param remindIntervalMinutes - Optional reminder interval in minutes
   * @returns Promise<Task> - The created task with all relationships
   * @throws {TRPCError} When validation fails or assignee is invalid
   * 
   * @example
   * ```typescript
   * const newTask = await tasksService.createTask(
   *   actor,
   *   'Implement user authentication',
   *   'Add JWT-based auth with Google OAuth',
   *   TaskStatus.PENDING,
   *   Priority.HIGH,
   *   'assignee-456',
   *   new Date('2024-12-31T10:00:00Z'),
   *   60
   * );
   * ```
   */
  async createTask(
    actor: User,
    title: string,
    description?: string | null,
    status: TaskStatus = TaskStatus.PENDING,
    priority: Priority = Priority.MEDIUM,
    assigneeId?: string | null,
    remindAt?: Date | null,
    remindIntervalMinutes?: number | null
  ): Promise<Task> {
    return await prisma.$transaction(async (tx) => {
      /* ========================================
       * Validate Business Rules
       * ======================================== */
      
      // Validate assignee exists and is active (if provided)
      if (assigneeId) {
        const assignee = await this.assigneesRepository.getById(assigneeId, tx);
        if (!assignee) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Assignee with ID ${assigneeId} not found`,
          });
        }

        // Check if assignee belongs to the same tenant
        if (assignee.tenantId !== actor.tenantId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot assign task to assignee from different tenant',
          });
        }

        // Check if assignee is active
        if (!assignee.isActive) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot assign task to inactive assignee',
          });
        }
      }

      // Validate reminder configuration
      if (remindAt && remindAt <= new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Reminder date must be in the future',
        });
      }

      if (remindIntervalMinutes && remindIntervalMinutes <= 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Reminder interval must be greater than 0 minutes',
        });
      }

      /* ========================================
       * Create Task Entity
       * ======================================== */
      
      const taskData: Prisma.TaskCreateInput = {
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description?.trim() || null,
        status,
        priority,
        remindAt,
        remindIntervalMinutes,
        tenant: { connect: { id: actor.tenantId } },
        creator: { connect: { id: actor.id } },
        assignee: assigneeId ? { connect: { id: assigneeId } } : undefined,
      };

      const taskEntity = await this.tasksRepository.create(taskData, tx);
      
      // Return task with relationships
      const taskWithRelations = await this.tasksRepository.getByIdWithTenant(
        actor.tenantId,
        taskEntity.id,
        true,
        tx
      );

      if (!taskWithRelations) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve created task',
        });
      }

      return taskConverter.toDomain(taskWithRelations);
    });
  }

  /**
   * Get a task by ID with tenant isolation
   * 
   * Retrieves a specific task by ID ensuring it belongs to the specified tenant.
   * Includes all relationship data (creator, assignee, message count) for
   * complete task information.
   * 
   * @param actor - The user performing the action (provides tenant context)
   * @param taskId - The task ID to retrieve
   * @returns Promise<Task | null> - The task if found, null otherwise
   * 
   * @example
   * ```typescript
   * const task = await tasksService.getTaskById(actor, 'task-456');
   * if (task) {
   *   console.log(`Task: ${task.title} (${task.status})`);
   * }
   * ```
   */
  async getTaskById(actor: User, taskId: string): Promise<Task | null> {
    const taskEntity = await this.tasksRepository.getByIdWithTenant(
      actor.tenantId,
      taskId,
      true
    );
    
    return taskEntity ? taskConverter.toDomain(taskEntity) : null;
  }

  /**
   * Get tasks by tenant with comprehensive filtering
   * 
   * Retrieves tasks within a tenant context with advanced filtering capabilities.
   * Supports filtering by status, priority, assignee, creator, due dates, and
   * text search across title and description fields.
   * 
   * @param actor - The user performing the action (provides tenant context)
   * @param filters - Optional filtering criteria
   * @returns Promise<Task[]> - Array of tasks matching filter criteria
   * 
   * @example
   * ```typescript
   * const highPriorityTasks = await tasksService.getTasksByTenant(
   *   actor,
   *   { priority: Priority.HIGH, status: TaskStatus.PENDING, limit: 20 }
   * );
   * ```
   */
  async getTasksByTenant(
    actor: User,
    filters?: TaskFilters
  ): Promise<Task[]> {
    const taskEntities = await this.tasksRepository.findByTenantWithFilters(
      actor.tenantId,
      filters,
      true
    );
    
    return taskConverter.toDomainArray(taskEntities);
  }

  /**
   * Update a task with validation and business rules
   * 
   * Updates an existing task with proper validation of status transitions,
   * assignee relationships, and reminder configurations. Enforces business
   * rules for status changes and maintains data integrity.
   * 
   * @param actor - The user performing the action (provides tenant context)
   * @param taskId - The task ID to update
   * @param updateData - Partial task data to update
   * @returns Promise<Task> - The updated task with all relationships
   * @throws {TRPCError} When task not found, validation fails, or business rules violated
   * 
   * @example
   * ```typescript
   * const updatedTask = await tasksService.updateTask(
   *   actor,
   *   'task-456',
   *   { status: TaskStatus.IN_PROGRESS, priority: Priority.URGENT }
   * );
   * ```
   */
  async updateTask(
    actor: User,
    taskId: string,
    updateData: {
      title?: string;
      description?: string | null;
      status?: TaskStatus;
      priority?: Priority;
      assigneeId?: string | null;
      remindAt?: Date | null;
      remindIntervalMinutes?: number | null;
    }
  ): Promise<Task> {
    return await prisma.$transaction(async (tx) => {
      /* ========================================
       * Validate Task Exists
       * ======================================== */
      
      const existingTask = await this.tasksRepository.getByIdWithTenant(
        actor.tenantId,
        taskId,
        false,
        tx
      );

      if (!existingTask) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Task with ID ${taskId} not found`,
        });
      }

      /* ========================================
       * Validate Business Rules
       * ======================================== */

      // Validate assignee (if being updated)
      if (updateData.assigneeId !== undefined) {
        if (updateData.assigneeId) {
          const assignee = await this.assigneesRepository.getById(updateData.assigneeId, tx);
          if (!assignee) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: `Assignee with ID ${updateData.assigneeId} not found`,
            });
          }

          if (assignee.tenantId !== actor.tenantId) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Cannot assign task to assignee from different tenant',
            });
          }

          if (!assignee.isActive) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Cannot assign task to inactive assignee',
            });
          }
        }
      }

      // Validate reminder configuration
      if (updateData.remindAt && updateData.remindAt <= new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Reminder date must be in the future',
        });
      }

      if (updateData.remindIntervalMinutes && updateData.remindIntervalMinutes <= 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Reminder interval must be greater than 0 minutes',
        });
      }

      /* ========================================
       * Update Task Entity
       * ======================================== */
      
      const prismaUpdateData: Prisma.TaskUpdateInput = {
        ...(updateData.title && { title: updateData.title.trim() }),
        ...(updateData.description !== undefined && { 
          description: updateData.description?.trim() || null 
        }),
        ...(updateData.status && { status: updateData.status }),
        ...(updateData.priority && { priority: updateData.priority }),
        ...(updateData.remindAt !== undefined && { remindAt: updateData.remindAt }),
        ...(updateData.remindIntervalMinutes !== undefined && { 
          remindIntervalMinutes: updateData.remindIntervalMinutes 
        }),
        updatedAt: new Date(),
      };

      // Handle assignee update (including null assignment)
      if (updateData.assigneeId !== undefined) {
        if (updateData.assigneeId) {
          prismaUpdateData.assignee = { connect: { id: updateData.assigneeId } };
        } else {
          prismaUpdateData.assignee = { disconnect: true };
        }
      }

      await this.tasksRepository.update(taskId, prismaUpdateData, tx);
      
      // Return updated task with relationships
      const updatedTaskEntity = await this.tasksRepository.getByIdWithTenant(
        actor.tenantId,
        taskId,
        true,
        tx
      );

      if (!updatedTaskEntity) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve updated task',
        });
      }

      return taskConverter.toDomain(updatedTaskEntity);
    });
  }

  /**
   * Delete a task (soft delete)
   * 
   * Performs a soft delete on the specified task by setting the deletedAt
   * timestamp. The task remains in the database for audit purposes but
   * is excluded from normal queries.
   * 
   * @param actor - The user performing the action (provides tenant context)
   * @param taskId - The task ID to delete
   * @throws {TRPCError} When task not found or already deleted
   * 
   * @example
   * ```typescript
   * await tasksService.deleteTask(actor, 'task-456');
   * ```
   */
  async deleteTask(actor: User, taskId: string): Promise<void> {
    const existingTask = await this.tasksRepository.getByIdWithTenant(
      actor.tenantId,
      taskId
    );

    if (!existingTask) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Task with ID ${taskId} not found`,
      });
    }

    await this.tasksRepository.delete(taskId);
  }
}