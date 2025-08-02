export interface TokenPayload {
  sub: string;
  iss: string;
  email?: string;
  name?: string;
  [key: string]: unknown;
}

export interface UserInfo {
  email: string;
  name?: string;
  [key: string]: unknown;
}

export interface AuthProvider {
  readonly name: string;
  
  verifyToken(token: string): Promise<TokenPayload>;
  getUserInfoFromToken(token: string): Promise<UserInfo>;
}