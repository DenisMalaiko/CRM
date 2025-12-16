export interface AuthResponse<T> {
  user: T;
  accessToken: string;
  refreshToken: string;
}