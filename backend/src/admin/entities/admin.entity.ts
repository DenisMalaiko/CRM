export type Admin = {
  id: string;
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
}

export type AdminResponse = Omit<Admin, 'password'>;