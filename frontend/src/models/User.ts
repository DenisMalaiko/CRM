export type TUser = {
  id?: string;
  name: string;
  email: string;
}

export type TUserSignUp = TUser & {
  password: string;
}

export type TUserSignIn = {
  email: string;
  password: string;
}

export type TAdmin = TUserSignUp & {
  isAdmin: boolean;
}