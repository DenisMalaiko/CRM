import { PaymentsStatus } from '../../generated/prisma';

export enum PaymentsStatusUI {
  Unpaid = "Unpaid",
  Paid = "Paid",
  Refund = "Refund",
  Failed = "Failed",
}

export const PaymentsStatusToPrisma: Record<PaymentsStatusUI, PaymentsStatus> = {
  [PaymentsStatusUI.Unpaid]: PaymentsStatus.Unpaid,
  [PaymentsStatusUI.Paid]: PaymentsStatus.Paid,
  [PaymentsStatusUI.Refund]: PaymentsStatus.Refund,
  [PaymentsStatusUI.Failed]: PaymentsStatus.Failed,
}