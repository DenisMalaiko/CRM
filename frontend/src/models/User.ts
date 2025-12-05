import { TBaseModel } from "./BaseModel";
import { TAgency } from "./Agency";

export type TUser = TBaseModel & {
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

export type TAdmin = {
  id?: string;
  name: string;
  email: string;
  password?: string;
  isAdmin: boolean;
}

export type TSignUpPayload = {
  user: TUserSignUp;
  agency: TAgency;
}