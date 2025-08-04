import { MessageRole } from "../../generated/prisma/enums.ts";

/**
 * ChatMessage Filters Interface
 *
 * Defines the structure for filtering chat messages in search operations.
 * Used by the service layer for type-safe filtering operations.
 */
export interface ChatMessageFilters {
  /**
   * Filter by message role
   * - USER: Messages from users
   * - ASSISTANT: Messages from AI assistant
   * - SYSTEM: System-generated messages
   */
  role?: MessageRole;

  /**
   * Filter by task ID
   * Only messages associated with the specified task
   */
  taskId?: string;

  /**
   * Filter by assignee ID
   * Only messages associated with the specified assignee
   */
  assigneeId?: string;

  /**
   * Text search within message content
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