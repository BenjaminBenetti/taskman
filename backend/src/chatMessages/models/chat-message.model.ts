import { MessageRole } from "../../generated/prisma/enums.ts";
import type { Assignee } from "../../assignees/models/assignee.model.ts";
import type { Task } from "../../tasks/models/task.model.ts";

/**
 * ChatMessage Domain Model
 * 
 * Clean interface representing a chat message entity for AI conversations.
 * Keeps model definition separate from Prisma-generated types for domain clarity.
 * Supports optional relationships to tasks and assignees for context-aware messaging.
 */
export interface ChatMessage {
  id: string;
  content: string;
  role: MessageRole;
  tenantId: string;
  taskId?: string | null;
  assigneeId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;

  // Optional relationship data for efficient queries
  task?: Task | null;
  assignee?: Assignee;
}