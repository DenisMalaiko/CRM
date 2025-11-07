import { OrderStatus } from '../../generated/prisma';

export enum OrderStatusUI {
  Pending = "Pending",
  Processing = "Processing",
  Shipped = "Shipped",
  Completed = "Completed",
  Cancelled = "Cancelled"
}

export const OrderStatusToPrisma: Record<OrderStatusUI, OrderStatus> = {
  [OrderStatusUI.Pending]: OrderStatus.Pending,
  [OrderStatusUI.Processing]: OrderStatus.Processing,
  [OrderStatusUI.Shipped]: OrderStatus.Shipped,
  [OrderStatusUI.Completed]: OrderStatus.Completed,
  [OrderStatusUI.Cancelled]: OrderStatus.Cancelled
}