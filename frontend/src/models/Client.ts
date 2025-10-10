import { ClientRoles } from "../enum/ClientRoles";

export type TClient = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  role: ClientRoles;
  isActive: boolean;
  updatedAt?: string;
}
