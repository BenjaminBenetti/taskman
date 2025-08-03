import { AbstractConverter } from '../../shared/converters/abstract.converter.ts';
import { Task } from '../models/task.model.ts';
import type { TaskModel } from '../../generated/prisma/models/Task.ts';

/**
 * Task Converter
 * 
 * Handles bidirectional conversion between Task domain models and Prisma entities.
 * Provides type-safe conversion methods for single entities and arrays, ensuring
 * consistent data transformation across the application.
 * 
 * Key responsibilities:
 * - Convert Prisma Task entities to clean domain models
 * - Transform domain models to Prisma-compatible format
 * - Handle nullable field mappings (description, remindAt, remindIntervalMinutes, assigneeId, deletedAt)
 * - Manage Date object conversions for timestamp fields
 * - Handle relationship property mapping (creator, assignee, messageCount)
 * - Provide batch conversion capabilities for arrays
 */
export class TaskConverter extends AbstractConverter<Task, TaskModel> {

  /* ========================================
   * Single Entity Conversion
   * ======================================== */

  /**
   * Converts a Prisma Task entity to a Task domain model
   * 
   * Transforms the raw database entity into a clean domain object suitable
   * for business logic operations. Handles proper type mapping for all fields
   * including nullable fields, Date conversions, and relationship properties.
   * 
   * @param prismaEntity - The Prisma Task entity from database
   * @returns Clean Task domain model
   * @throws {Error} When prismaEntity is null, undefined, or malformed
   * 
   * @example
   * ```typescript
   * const taskEntity = await prisma.task.findUnique({ 
   *   where: { id: 'task-123' },
   *   include: { creator: true, assignee: true, _count: { select: { messages: true } } }
   * });
   * const taskDomain = taskConverter.toDomain(taskEntity);
   * console.log(taskDomain.title); // Access clean domain properties
   * ```
   */
  toDomain(prismaEntity: TaskModel): Task {
    // Extract relationship data if included in query
    const creator = (prismaEntity as any).creator ? {
      id: (prismaEntity as any).creator.id,
      name: (prismaEntity as any).creator.name,
      email: (prismaEntity as any).creator.email,
    } : undefined;

    const assignee = (prismaEntity as any).assignee ? {
      id: (prismaEntity as any).assignee.id,
      name: (prismaEntity as any).assignee.name,
      email: (prismaEntity as any).assignee.email ?? null,
      isActive: (prismaEntity as any).assignee.isActive,
    } : undefined;

    const messageCount = (prismaEntity as any)._count?.chatMessages ?? undefined;

    return {
      id: prismaEntity.id,
      title: prismaEntity.title,
      description: prismaEntity.description ?? null,
      status: prismaEntity.status,
      priority: prismaEntity.priority,
      remindAt: prismaEntity.remindAt ? new Date(prismaEntity.remindAt) : null,
      remindIntervalMinutes: prismaEntity.remindIntervalMinutes ?? null,
      tenantId: prismaEntity.tenantId,
      creatorId: prismaEntity.creatorId,
      assigneeId: prismaEntity.assigneeId ?? null,
      createdAt: new Date(prismaEntity.createdAt),
      updatedAt: new Date(prismaEntity.updatedAt),
      deletedAt: prismaEntity.deletedAt ? new Date(prismaEntity.deletedAt) : null,
      creator,
      assignee,
      messageCount,
    };
  }

  /**
   * Converts a Task domain model to Prisma entity format
   * 
   * Transforms a domain model into the structure expected by Prisma for
   * database operations. Ensures all required fields are present and
   * properly formatted for persistence. Excludes computed/relationship
   * properties that are not stored directly in the task table.
   * 
   * @param domainModel - The Task domain model to convert
   * @returns Prisma-compatible Task entity format
   * @throws {Error} When domainModel is null, undefined, or missing required fields
   * 
   * @example
   * ```typescript
   * const newTask: Task = {
   *   id: 'task-123',
   *   title: 'Complete API implementation',
   *   status: TaskStatus.PENDING,
   *   priority: Priority.HIGH,
   *   // ... other fields
   * };
   * const prismaData = taskConverter.toPrisma(newTask);
   * await prisma.task.create({ data: prismaData });
   * ```
   */
  toPrisma(domainModel: Task): TaskModel {
    return {
      id: domainModel.id,
      title: domainModel.title,
      description: domainModel.description,
      status: domainModel.status,
      priority: domainModel.priority,
      remindAt: domainModel.remindAt,
      remindIntervalMinutes: domainModel.remindIntervalMinutes,
      tenantId: domainModel.tenantId,
      creatorId: domainModel.creatorId,
      assigneeId: domainModel.assigneeId,
      createdAt: domainModel.createdAt,
      updatedAt: domainModel.updatedAt,
      deletedAt: domainModel.deletedAt,
    };
  }

  /* ========================================
   * Entity Type Name Override
   * ======================================== */

  /**
   * Provides the entity type name for error messages
   * 
   * Overrides the base class method to provide specific entity type
   * identification for Task converter error messages.
   * 
   * @returns The entity type name used in error messages
   */
  protected override getEntityTypeName(): string {
    return 'Task';
  }
}

// =========================================
// Singleton Instance Export
// =========================================

/**
 * Singleton instance of TaskConverter for application-wide use
 * 
 * Provides a single, reusable converter instance to avoid unnecessary
 * object creation overhead. This pattern ensures consistent conversion
 * behavior across the entire application.
 * 
 * @example
 * ```typescript
 * import { taskConverter } from './task.converter.ts';
 * 
 * // Use singleton instance directly
 * const taskDomain = taskConverter.toDomain(prismaTask);
 * const prismaData = taskConverter.toPrisma(taskDomain);
 * ```
 */
export const taskConverter = new TaskConverter();