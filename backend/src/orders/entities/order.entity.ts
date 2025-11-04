import { OrderStatus } from "../../enums/OrderStatus";
import { PaymentsStatus } from "../../enums/PaymentsStatus";
import { PaymentMethod } from "../../enums/PaymentMethod";

export type Order = {
  id?: string;
  businessId: string;

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

export type OrderResponse = Partial<Order>