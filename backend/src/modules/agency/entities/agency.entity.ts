import { Plan } from "@prisma/client"
import { TUser } from "../../auth/entities/user.entity";
import { TBusiness } from "../../business/entities/business.entity";

export type TAgencyBase = {
  name: string;
  plan: Plan;
  users?: TUser[];
  businesses?: TBusiness[];
}

export type TAgency = TAgencyBase & {
  id: string;
  createdAt: Date;
}

export type TAgencyCreate = TAgencyBase;

export type TAgencyUpdate = TAgencyBase;