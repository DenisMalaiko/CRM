import { PaymentMethod } from '../../generated/prisma';

export enum PaymentMethodUI {
  Cash = "Cash",
  CreditCard = "Credit Card",
  BankTransfer = "Bank Transfer",
}

export const PaymentMethodToPrisma: Record<PaymentMethodUI, PaymentMethod> = {
  [PaymentMethodUI.Cash]: PaymentMethod.Cash,
  [PaymentMethodUI.CreditCard]: PaymentMethod.CreditCard,
  [PaymentMethodUI.BankTransfer]: PaymentMethod.BankTransfer,
};