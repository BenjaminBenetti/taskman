import { TaskStatus, Priority } from "../../generated/prisma/enums.ts";
import type { User } from "../../users/models/user.model.ts";
import type { Assignee } from "../../assignees/models/assignee.model.ts";

/**
 * Task Domain Model
 * 
 * Core task entity representing a work item within the TaskMan system.
 * Keeps model definition separate from Prisma-generated types for domain clarity.
 * Supports AI-powered task management with flexible assignment and reminder capabilities.
 */
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  remindAt: Date | null;
  remindIntervalMinutes: number | null;
  tenantId: string;
  creatorId: string;
  assigneeId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  // Computed/relationship properties
  creator?: Pick<User, 'id' | 'name' | 'email'>;
  assignee?: Pick<Assignee, 'id' | 'name' | 'email' | 'isActive'>;
  messageCount?: number;
}


/**
 * Task Filtering Options
 * 
 * Flexible filter criteria for task queries supporting various search and filter scenarios.
 * Enables advanced task filtering and pagination for efficient data retrieval.
 */
export interface TaskFilters {
  status?: TaskStatus;
  priority?: Priority;
  assigneeId?: string;
  creatorId?: string;
  dueBefore?: Date;
  search?: string;
  limit?: number;
  offset?: number;
}