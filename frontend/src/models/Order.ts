import { TBaseModel } from "./BaseModel";
import { OrderStatus } from "../enum/OrderStatus";
import { PaymentsStatus } from "../enum/PaymentsStatus";
import { PaymentMethod } from "../enum/PaymentMethod";

export type TOrder = TBaseModel & {
  total: number;
  status: OrderStatus;
  productIds: string[];
  clientId: string | null;
  paymentStatus: PaymentsStatus;
  paymentMethod: PaymentMethod;
  notes?: string;

  createdAt?: string;
  updatedAt?: string;
  fulfilledAt?: string;
}