import { Plans } from "../enum/Plans";
import { TUser } from "./User";

export type TAgencyCreate = {
  name: string;
  plan: Plans;
}

export type TAgency = TAgencyCreate & {
  id: string;
  createdAt: Date;
  users?: TUser[];
}