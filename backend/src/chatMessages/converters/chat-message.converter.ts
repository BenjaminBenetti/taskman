import { AbstractConverter } from '../../shared/converters/abstract.converter.ts';
import { ChatMessage } from '../models/chat-message.model.ts';
import { ChatMessageModel } from '../../generated/prisma/models/ChatMessage.ts';
import { assigneeConverter } from '../../assignees/converters/assignee.converter.ts';
import { taskConverter } from '../../tasks/converters/task.converter.ts';

/**
 * ChatMessage Converter
 * 
 * Handles bidirectional conversion between ChatMessage domain models and Prisma entities.
 * Provides type-safe conversion methods for single entities and arrays, ensuring
 * consistent data transformation across the application.
 * 
 * Key responsibilities:
 * - Convert Prisma ChatMessage entities to clean domain models
 * - Transform domain models to Prisma-compatible format
 * - Handle MessageRole enum conversions
 * - Manage nullable field mappings (taskId, deletedAt)
 * - Handle optional relationship data (task, assignee)
 * - Provide batch conversion capabilities for arrays
 */
export class ChatMessageConverter extends AbstractConverter<ChatMessage, ChatMessageModel> {

  /* ========================================
   * Single Entity Conversion
   * ======================================== */

  /**
   * Converts a Prisma ChatMessage entity to a ChatMessage domain model
   * 
   * Transforms the raw database entity into a clean domain object suitable
   * for business logic operations. Handles proper type mapping for all fields
   * including nullable fields, Date conversions, and optional relationships.
   * 
   * @param prismaEntity - The Prisma ChatMessage entity from database
   * @returns Clean ChatMessage domain model
   * @throws {Error} When prismaEntity is null, undefined, or malformed
   * 
   * @example
   * ```typescript
   * const chatMessageEntity = await prisma.chatMessage.findUnique({ 
   *   where: { id: 'msg-123' },
   *   include: { task: true, assignee: true }
   * });
   * const chatMessageDomain = chatMessageConverter.toDomain(chatMessageEntity);
   * console.log(chatMessageDomain.content); // Access clean domain properties
   * ```
   */
  toDomain(prismaEntity: ChatMessageModel & {
    task?: any;
    assignee?: any;
  }): ChatMessage {

    return {
      id: prismaEntity.id,
      content: prismaEntity.content,
      role: prismaEntity.role,
      tenantId: prismaEntity.tenantId,
      taskId: prismaEntity.taskId,
      assigneeId: prismaEntity.assigneeId,
      createdAt: new Date(prismaEntity.createdAt),
      updatedAt: new Date(prismaEntity.updatedAt),
      deletedAt: prismaEntity.deletedAt ? new Date(prismaEntity.deletedAt) : null,
      
      // Handle optional relationship data
      task: prismaEntity.task ? taskConverter.toDomain(prismaEntity.task) : undefined,
      assignee: prismaEntity.assignee ? assigneeConverter.toDomain(prismaEntity.assignee) : undefined,
    };
  }

  /**
   * Converts a ChatMessage domain model to Prisma entity format
   * 
   * Transforms a domain model into the structure expected by Prisma for
   * database operations. Ensures all required fields are present and
   * properly formatted for persistence.
   * 
   * @param domainModel - The ChatMessage domain model to convert
   * @returns Prisma-compatible ChatMessage entity format
   * @throws {Error} When domainModel is null, undefined, or missing required fields
   * 
   * @example
   * ```typescript
   * const newChatMessage: ChatMessage = {
   *   id: 'msg-123',
   *   content: 'Hello, how can I help?',
   *   role: MessageRole.ASSISTANT,
   *   tenantId: 'tenant-456',
   *   assigneeId: 'assignee-789',
   *   // ... other fields
   * };
   * const prismaData = chatMessageConverter.toPrisma(newChatMessage);
   * await prisma.chatMessage.create({ data: prismaData });
   * ```
   */
  toPrisma(domainModel: ChatMessage): ChatMessageModel {

    return {
      id: domainModel.id,
      content: domainModel.content,
      role: domainModel.role,
      tenantId: domainModel.tenantId,
      taskId: domainModel.taskId ?? null,
      assigneeId: domainModel.assigneeId,
      createdAt: domainModel.createdAt,
      updatedAt: domainModel.updatedAt,
      deletedAt: domainModel.deletedAt ?? null,
    };
  }

  /* ========================================
   * Entity Type Name Override
   * ======================================== */

  /**
   * Provides the entity type name for error messages
   * 
   * Overrides the base class method to provide specific entity type
   * identification for ChatMessage converter error messages.
   * 
   * @returns The entity type name used in error messages
   */
  protected override getEntityTypeName(): string {
    return 'ChatMessage';
  }
}

// =========================================
// Singleton Instance Export
// =========================================

/**
 * Singleton instance of ChatMessageConverter for application-wide use
 * 
 * Provides a single, reusable converter instance to avoid unnecessary
 * object creation overhead. This pattern ensures consistent conversion
 * behavior across the entire application.
 * 
 * @example
 * ```typescript
 * import { chatMessageConverter } from './chat-message.converter.ts';
 * 
 * // Use singleton instance directly
 * const chatMessageDomain = chatMessageConverter.toDomain(prismaChatMessage);
 * const prismaData = chatMessageConverter.toPrisma(chatMessageDomain);
 * ```
 */
export const chatMessageConverter = new ChatMessageConverter();