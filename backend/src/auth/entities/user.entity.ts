export type User = {
  id: string;
  name: string;
  email: string;
  agencyId: string;
  password: string;
}

export type UserResponse = Omit<User, 'password'>;