import type { User } from "@taskman/backend";

export interface TokenPayload {
  sub: string;
  iss: string;
  email?: string;
  [key: string]: unknown;
}

export interface AuthProvider {
  readonly name: string;
  
  verifyToken(token: string): Promise<TokenPayload>;
  findUserByPayload(payload: TokenPayload): Promise<User | null>;
}