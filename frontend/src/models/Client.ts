import { TBaseModel } from "./BaseModel";

export type TClient = TBaseModel & {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  address: string;
  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;
}
