/**
 * User Domain Model
 * 
 * Simple interface representing a user entity with identity provider information.
 * Keeps model definition separate from Prisma-generated types for domain clarity.
 */
export interface User {
  id: string;
  email: string;
  name?: string | null;
  identityProvider: string;
  identityProviderId: string;
  tenantId: string;
  assigneeId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}