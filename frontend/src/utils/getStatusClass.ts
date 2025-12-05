import { ProductStatus } from "../enum/ProductStatus";
import { PaymentsStatus } from "../enum/PaymentsStatus";

export const getStatusClass = (status: string) => {
  switch (status) {
    case ProductStatus.Active:
      return "bg-emerald-50 text-emerald-700";
    case ProductStatus.Draft:
      return "bg-amber-50 text-amber-700";
    case ProductStatus.Archived:
      return "bg-slate-100 text-slate-600";

    case PaymentsStatus.Paid:
      return "bg-green-50 text-green-700";
    case PaymentsStatus.Unpaid:
      return "bg-yellow-50 text-yellow-700";
    case PaymentsStatus.Refund:
      return "bg-red-50 text-red-700";
    case PaymentsStatus.Failed:
      return "bg-red-50 text-red-700";


    default:
      return "bg-gray-50 text-gray-700";
  }
}