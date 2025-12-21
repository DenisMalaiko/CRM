import { TBaseModel } from "./BaseModel";
import { TAgency, TAgencySignUp } from "./Agency";
import { UserRole } from "../enum/UserRole";
import { UserStatus } from "../enum/UserStatus";

export type TUserSignIn = {
  email: string;
  password: string;
}

export type TUserSignUp = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  agency?: TAgency;
}

export type TSignUpPayload = {
  user: TUserSignUp;
  agency: TAgencySignUp;
}

export type TUser = TBaseModel & Omit<TUserSignUp, "password">;















/*
export type TUser = TBaseModel & {
  name: string;
  email: string;
}
*/

/*export type TUserSignUp = TUser & {
  password: string;
}*/


/*export type TAdmin = {
  id?: string;
  name: string;
  email: string;
  password?: string;
  isAdmin: boolean;
}*/
