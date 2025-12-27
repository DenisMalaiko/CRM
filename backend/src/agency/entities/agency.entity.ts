import { Plan } from "generated/prisma";
import { TUser } from "../../auth/entities/user.entity";
import { TBusiness } from "../../business/entities/business.entity";

export type TAgency = {
  id: string;
  name: string;
  plan: Plan;
  createdAt: Date;

  users?: TUser[];
  businesses: TBusiness[];
}

export type TAgencySignUp = {
  name: string;
  plan: Plan;
}