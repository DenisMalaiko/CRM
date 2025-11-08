import { TBaseModel } from "./BaseModel";
import { ClientRoles } from "../enum/ClientRoles";

export type TClient = TBaseModel & {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  address: string;
  role: ClientRoles;
  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;
}
