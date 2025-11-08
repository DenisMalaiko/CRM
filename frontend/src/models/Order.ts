import { TBaseModel } from "./BaseModel";
import { OrderStatus } from "../enum/OrderStatus";
import { PaymentsStatus } from "../enum/PaymentsStatus";
import { PaymentMethod } from "../enum/PaymentMethod";
import { TProduct } from "./Product";
import { TClient } from "./Client";

export type TOrder = TBaseModel & {
  total: number; // Price
  quantity: number;
  status: OrderStatus;
  productId: string;
  clientId: string;
  paymentStatus: PaymentsStatus;
  paymentMethod: PaymentMethod;
  notes?: string;

  createdAt?: string;
  updatedAt?: string;
  fulfilledAt?: string;

  client?: TClient;
  product?: TProduct;
}