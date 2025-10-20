import { TBaseModel } from "./BaseModel";
import { ClientRoles } from "../enum/ClientRoles";

export type TClient = TBaseModel & {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  role: ClientRoles;
  isActive: boolean;
  updatedAt?: string;
}
