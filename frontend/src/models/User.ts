import { TBaseModel } from "./BaseModel";
import { TAgency, TAgencyCreate } from "./Agency";
import { UserRole } from "../enum/UserRole";
import { UserStatus } from "../enum/UserStatus";

export type TUserSignIn = {
  email: string;
  password: string;
}

export type TUserCreate = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  agency?: TAgency;
}

export type TSignUpPayload = {
  user: TUserCreate;
  agency: TAgencyCreate;
}

export type TUser = TBaseModel & Omit<TUserCreate, "password">;















/*
export type TUser = TBaseModel & {
  name: string;
  email: string;
}
*/

/*export type TUserCreate = TUser & {
  password: string;
}*/


/*export type TAdmin = {
  id?: string;
  name: string;
  email: string;
  password?: string;
  isAdmin: boolean;
}*/
