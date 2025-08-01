import type { User } from "../../users/models/user.model.ts";
import type { TokenPayload } from "../interfaces/auth-provider.interface.ts";
import { UsersRepository } from "../../users/repositories/users.repository.ts";
import { UsersService } from "../../users/services/users.service.ts";
import { userConverter } from "../../users/converters/user.converter.ts";
import { type Prisma } from "../../generated/prisma/client.ts";

/**
 * Authentication Service
 * 
 * Handles authentication-related operations and token processing.
 * Extracts user data from auth tokens and delegates user creation to UserService.
 * Focuses on auth concerns while leaving user domain logic to appropriate services.
 */
export class AuthService {
  private usersRepository = new UsersRepository();
  private usersService = new UsersService();

  /* ========================================
   * Public Methods
   * ======================================== */

  /**
   * Create or update a user from a verified token payload
   * 
   * If user exists, updates them with latest info from identity provider.
   * If user doesn't exist, creates them with all required relationships.
   * 
   * @param payload - The verified token payload containing user information
   * @param identityProvider - The name of the identity provider (e.g., "google")
   * @returns Promise<User> - The created or updated user
   */
  async createOrUpdateUserFromToken(
    payload: TokenPayload,
    identityProvider: string
  ): Promise<User> {
    const existingUserEntity = await this.usersRepository.findByIdentityProvider(
      identityProvider,
      payload.sub
    );
    
    const existingUser = existingUserEntity ? userConverter.toDomain(existingUserEntity) : null;

    if (existingUser) {
      /* ========================================
       * Update Existing User
       * ======================================== */
      
      return await this._updateUserFromPayload(existingUser.id, payload);
    } else {
      /* ========================================
       * Create New User
       * ======================================== */
      
      return await this._createNewUserFromPayload(payload, identityProvider);
    }
  }

  /**
   * Find an existing user from a verified token payload (does not create)
   * 
   * Used by TRPC context to authenticate existing users without creating duplicates.
   * 
   * @param payload - The verified token payload containing user information
   * @param identityProvider - The name of the identity provider (e.g., "google")
   * @returns Promise<User | null> - The existing user or null if not found
   */
  async findExistingUserFromToken(
    payload: TokenPayload,
    identityProvider: string
  ): Promise<User | null> {
    const existingUserEntity = await this.usersRepository.findByIdentityProvider(
      identityProvider,
      payload.sub
    );
    
    return existingUserEntity ? userConverter.toDomain(existingUserEntity) : null;
  }


  /* ========================================
   * Private Methods
   * ======================================== */

  /**
   * Update user with latest information from identity provider
   */
  private async _updateUserFromPayload(userId: string, payload: TokenPayload): Promise<User> {
    const updateData: Prisma.UserUpdateInput = {
      email: payload.email,
      name: payload.name as string | undefined
    };

    const updatedUserEntity = await this.usersRepository.update(userId, updateData);
    return userConverter.toDomain(updatedUserEntity);
  }

  /**
   * Create a new user with all required relationships (tenant and self-assignee)
   * 
   * @param payload - The verified token payload containing user information
   * @param identityProvider - The name of the identity provider (e.g., "google")
   * @returns Promise<User> - The newly created user
   */
  private async _createNewUserFromPayload(
    payload: TokenPayload,
    identityProvider: string
  ): Promise<User> {
    // Extract user data from payload
    const userData = this._extractUserDataFromPayload(payload);
    const userName = userData.name || userData.email.split("@")[0];

    // Delegate user creation orchestration to UserService
    return await this.usersService.createUser(
      userName,
      userData.email,
      identityProvider,
      userData.identityProviderId
    );
  }

  /**
   * Extract user creation data from identity provider payload
   */
  private _extractUserDataFromPayload(payload: TokenPayload): {
    email: string;
    name?: string;
    identityProviderId: string;
  } {
    if (!payload.email) {
      throw new Error("Email is required but not found in token payload");
    }

    return {
      email: payload.email,
      name: payload.name as string | undefined,
      identityProviderId: payload.sub
    };
  }

}