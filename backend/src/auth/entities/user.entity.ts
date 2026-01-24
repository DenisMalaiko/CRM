import { TBaseModel } from "../../entities/BaseEntity";
import { TAgencyCreate } from "../../agency/entities/agency.entity";
import { UserRole, UserStatus } from "@prisma/client";

export type TUser = TBaseModel & {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export type TUserCreate = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
}

export type TUserSignIn = TUser & {
  password: string;
}

export type TSignInPayload = {
  email: string;
  password: string;
}

export type TSignUpPayload = {
  user: TUserCreate;
  agency: TAgencyCreate;
}