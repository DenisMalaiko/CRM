export type TAdmin = {
  id: string;
  name: string;
  email: string;
}

export type TAdminSignIn = {
  email: string;
  password: string;
}

export type TAdminCreate = {
  name: string;
  email: string;
  password: string;
}