import { PrismaClient } from "@prisma/client";

export enum PaymentMethod {
  Cash = "Cash",
  CreditCard = "Credit Card",
  BankTransfer = "Bank Transfer",
}

export const PaymentMethodToPrisma: Record<string, any> = {
  "Cash": PrismaClient.Cash,
  "Credit Card": PrismaClient.CreditCard,
  "Bank Transfer": PrismaClient.BankTransfer,
};