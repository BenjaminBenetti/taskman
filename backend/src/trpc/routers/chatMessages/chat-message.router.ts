import { z } from "zod";
import { router } from "../../index.ts";
import { protectedProcedure } from "../../middleware/protectedProcedure.ts";
import { ChatMessagesService } from "../../../chatMessages/services/chat-messages.service.ts";
import type { ChatMessageFilters } from "../../../chatMessages/types/chat-message-filters.type.ts";
import {
  chatMessageIdInput,
  createChatMessageInput,
  updateChatMessageInput,
  getChatMessagesInput,
  type ChatMessageIdInput,
  type CreateChatMessageInput,
  type UpdateChatMessageInput,
  type GetChatMessagesInput,
} from "./chat-message.validation.ts";

/* ========================================
 * Service Instance
 * ======================================== */

// Create single service instance for efficiency and consistency
const chatMessagesService = new ChatMessagesService();

/* ========================================
 * Type Exports
 * ======================================== */

export type { ChatMessageFilters, ChatMessageIdInput, CreateChatMessageInput, UpdateChatMessageInput, GetChatMessagesInput };

/* ========================================
 * ChatMessage Router Implementation
 * ======================================== */

/**
 * ChatMessage router providing comprehensive chat message management operations
 * 
 * Implements full CRUD operations with advanced filtering, validation,
 * and business logic enforcement. All endpoints are protected and
 * require authentication.
 * 
 * Features:
 * - Chat message creation with comprehensive validation
 * - Chat message retrieval with filtering and pagination
 * - Chat message updates with business rule enforcement
 * - Chat message deletion (soft delete)
 * - Role-based filtering and content search
 * - Task and assignee association filtering
 * - Tenant isolation and security
 */
export const chatMessageRouter = router({
  /**
   * Create a new chat message
   * 
   * Creates a new chat message with validation and business rules enforcement.
   * Validates content length, role permissions, and relationship constraints.
   * Enforces tenant isolation for secure multi-tenant operation.
   * 
   * @input CreateChatMessageInput - Chat message creation data with validation
   * @returns ChatMessage - The created chat message with all properties
   * @throws TRPCError - When validation fails or business rules violated
   */
  create: protectedProcedure
    .input(createChatMessageInput)
    .mutation(async ({ input, ctx }) => {
      return await chatMessagesService.createChatMessage(
        ctx.user,
        input.content,
        input.role,
        input.assigneeId,
        input.taskId
      );
    }),

  /**
   * Get a chat message by ID
   * 
   * Retrieves a specific chat message by ID with tenant isolation.
   * Includes optional relationship data for complete information display.
   * 
   * @input ChatMessageIdInput - Chat message ID with validation
   * @returns ChatMessage | null - The chat message if found, null otherwise
   * @throws TRPCError - When chat message ID is invalid
   */
  get: protectedProcedure
    .input(chatMessageIdInput.extend({
      includeRelations: z.boolean()
        .default(false)
        .describe("Whether to include task and assignee relationship data"),
    }))
    .query(async ({ input, ctx }) => {
      return await chatMessagesService.getChatMessageById(
        ctx.user, 
        input.chatMessageId,
        input.includeRelations
      );
    }),

  /**
   * Get chat messages with filtering and pagination
   * 
   * Retrieves chat messages within the user's tenant with comprehensive
   * filtering capabilities. Supports role, task, assignee, and content 
   * search filtering with pagination and optional relationship includes.
   * 
   * @input GetChatMessagesInput - Filter criteria and pagination options
   * @returns ChatMessage[] - Array of chat messages matching filter criteria
   * @throws TRPCError - When filter parameters are invalid
   */
  search: protectedProcedure
    .input(getChatMessagesInput)
    .query(async ({ input, ctx }) => {
      const { includeRelations, ...filters } = input;
      
      return await chatMessagesService.getChatMessagesByTenant(
        ctx.user, 
        filters,
        includeRelations
      );
    }),

  /**
   * Update a chat message
   * 
   * Updates an existing chat message with validation and business rules.
   * Supports partial updates and enforces content length validation
   * and role permission constraints.
   * 
   * @input UpdateChatMessageInput - Partial chat message data with validation
   * @returns ChatMessage - The updated chat message with all properties
   * @throws TRPCError - When validation fails or business rules violated
   */
  update: protectedProcedure
    .input(updateChatMessageInput)
    .mutation(async ({ input, ctx }) => {
      const { chatMessageId, ...updateData } = input;
      
      return await chatMessagesService.updateChatMessage(
        ctx.user,
        chatMessageId,
        updateData
      );
    }),

  /**
   * Delete a chat message (soft delete)
   * 
   * Performs a soft delete on the specified chat message within the user's tenant.
   * The message is marked as deleted but remains in the database for
   * audit purposes and potential recovery.
   * 
   * @input ChatMessageIdInput - Chat message ID with validation
   * @returns void
   * @throws TRPCError - When message not found or already deleted
   */
  delete: protectedProcedure
    .input(chatMessageIdInput)
    .mutation(async ({ input, ctx }) => {
      await chatMessagesService.deleteChatMessage(ctx.user, input.chatMessageId);
    }),

});