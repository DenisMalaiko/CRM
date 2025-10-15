export type User = {
  id: string;
  name: string;
  email: string;
  businessId: string;
  password: string;
}

export type UserResponse = Omit<User, 'password'>;