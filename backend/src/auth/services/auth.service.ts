import type { User } from "../../users/models/user.model.ts";
import type { TokenPayload, UserInfo } from "../interfaces/auth-provider.interface.ts";
import type { ExternalAuthProvider } from "../types/auth-provider.type.ts";
import { UsersRepository } from "../../users/repositories/users.repository.ts";
import { UsersService } from "../../users/services/users.service.ts";
import { userConverter } from "../../users/converters/user.converter.ts";
import { AuthProviderFactory } from "../factories/auth-provider.factory.ts";
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
   * Create or update a user from a provider token
   * 
   * If user exists, updates them with latest info from identity provider.
   * If user doesn't exist, creates them with all required relationships.
   * 
   * @param token - The provider token to get user information from
   * @param identityProvider - The name of the identity provider (e.g., "google")
   * @returns Promise<User> - The created or updated user
   */
  async createOrUpdateUserFromToken(
    token: string,
    identityProvider: ExternalAuthProvider
  ): Promise<User> {
    // Get auth provider and extract user info from token
    const authProvider = AuthProviderFactory.create(identityProvider);
    const userInfo = await authProvider.getUserInfoFromToken(token);
    const payload = await authProvider.verifyToken(token);
    
    const existingUserEntity = await this.usersRepository.findByIdentityProvider(
      identityProvider,
      payload.sub
    );
    
    const existingUser = existingUserEntity ? userConverter.toDomain(existingUserEntity) : null;

    if (existingUser) {
      /* ========================================
       * Update Existing User
       * ======================================== */
      
      return await this._updateUserFromUserInfo(existingUser.id, userInfo);
    } else {
      /* ========================================
       * Create New User
       * ======================================== */
      
      return await this._createNewUserFromUserInfo(userInfo, payload.sub, identityProvider);
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
  private async _updateUserFromUserInfo(userId: string, userInfo: UserInfo): Promise<User> {
    const updateData: Prisma.UserUpdateInput = {
      email: userInfo.email,
      name: userInfo.name as string | undefined
    };

    const updatedUserEntity = await this.usersRepository.update(userId, updateData);
    return userConverter.toDomain(updatedUserEntity);
  }

  /**
   * Create a new user with all required relationships (tenant and self-assignee)
   * 
   * @param userInfo - The user information from the identity provider
   * @param identityProviderId - The identity provider user ID (sub claim)
   * @param identityProvider - The name of the identity provider (e.g., "google")
   * @returns Promise<User> - The newly created user
   */
  private async _createNewUserFromUserInfo(
    userInfo: UserInfo,
    identityProviderId: string,
    identityProvider: string
  ): Promise<User> {
    const userName = userInfo.name || userInfo.email.split("@")[0];

    // Delegate user creation orchestration to UserService
    return await this.usersService.createUser(
      userName,
      userInfo.email,
      identityProvider,
      identityProviderId
    );
  }

}