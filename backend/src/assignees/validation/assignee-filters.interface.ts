/**
 * Assignee Filters Interface
 * 
 * Defines the structure for filtering assignees in search operations.
 * Moved from service layer to validation directory for better organization
 * and separation of concerns.
 */

/* ========================================
 * Filter Interface Definition
 * ======================================== */

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