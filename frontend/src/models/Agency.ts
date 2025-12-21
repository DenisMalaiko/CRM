import { Plans } from "../enum/Plans";
import { TUser } from "./User";

export type TAgencySignUp = {
  name: string;
  plan: Plans;
}

export type TAgency = TAgencySignUp & {
  id: string;
  createdAt: Date;
  users?: TUser[];
  /*businesses?: TBusiness[];*/
}