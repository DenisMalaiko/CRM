import { TBaseModel } from "../../entities/BaseEntity";
import { TAgencySignUp } from "../../agency/entities/agency.entity";
import { UserRole, UserStatus } from "generated/prisma";

export type TUser = TBaseModel & {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

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
}

export type TSignUpPayload = {
  user: TUserSignUp;
  agency: TAgencySignUp;
}