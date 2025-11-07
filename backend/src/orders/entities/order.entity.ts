import { OrderStatusUI } from "../../enums/OrderStatus";
import { PaymentsStatusUI } from "../../enums/PaymentsStatus";
import { PaymentMethodUI } from "../../enums/PaymentMethod";

export type Order = {
  id?: string;
  businessId: string;

  total: number;
  status: OrderStatusUI | string;
  productIds: string[];
  clientId: string;
  paymentStatus: PaymentsStatusUI | string;
  paymentMethod: PaymentMethodUI | string;
  notes?: string | null;

  createdAt: Date | undefined;
  updatedAt: Date | undefined;
  fulfilledAt?: Date | null;
}

export type OrderResponse = Partial<Order>