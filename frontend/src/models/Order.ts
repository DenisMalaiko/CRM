import { TBaseModel } from "./BaseModel";
import { OrderStatus } from "../enum/OrderStatus";
import { PaymentsStatus } from "../enum/PaymentsStatus";
import { PaymentMethod } from "../enum/PaymentMethod";
import { TUser } from "./User";
import { TProduct } from "./Product";

export type TOrder = TBaseModel & {
  total: number;
  status: OrderStatus;
  productIds: string[];
  clientId: string;
  paymentStatus: PaymentsStatus;
  paymentMethod: PaymentMethod;
  notes?: string;

  createdAt?: string;
  updatedAt?: string;
  fulfilledAt?: string;

  client?: TUser;
  products?: TProduct[];
}